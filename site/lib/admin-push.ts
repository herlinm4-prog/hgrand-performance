import {env} from 'cloudflare:workers';
import {database} from './student-space';
import {visibleAlert} from './notification-rules';
const runtime=()=>env as unknown as Record<string,string|undefined>;
export function pushConfig(){const e=runtime();return {publicKey:e.WEB_PUSH_PUBLIC_KEY||'',privateJwk:e.WEB_PUSH_PRIVATE_JWK||'',subject:e.WEB_PUSH_SUBJECT||'',jobToken:e.HGRAND_ALERT_JOB_TOKEN||''}}
export function allowedPushEndpoint(endpoint:string){try{const u=new URL(endpoint);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com'].includes(u.hostname)||u.hostname.endsWith('.push.apple.com'))}catch{return false}}
function b64(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}
async function authorization(endpoint:string){const c=pushConfig(),encoder=new TextEncoder(),header=b64(encoder.encode(JSON.stringify({typ:'JWT',alg:'ES256'}))),payload=b64(encoder.encode(JSON.stringify({aud:new URL(endpoint).origin,exp:Math.floor(Date.now()/1000)+3600,sub:c.subject}))),value=header+'.'+payload;const key=await crypto.subtle.importKey('jwk',JSON.parse(c.privateJwk),{name:'ECDSA',namedCurve:'P-256'},false,['sign']);const signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,encoder.encode(value));return `vapid t=${value}.${b64(new Uint8Array(signature))}, k=${c.publicKey}`}
// Empty push payload: the worker shows a generic notification, never student/health data.
export async function dispatchPush(){const c=pushConfig();if(!c.publicKey||!c.privateJwk||!c.subject)return {configured:false,sent:0,failed:0};const db=database(),[alerts,subscriptions]=await Promise.all([db.prepare('SELECT id,source_version,priority,resolved_at,snoozed_until FROM admin_notifications WHERE requires_action=1 AND resolved_at IS NULL').all<{id:string;source_version:string;priority:number;resolved_at:null;snoozed_until:string|null}>(),db.prepare('SELECT id,endpoint FROM admin_push_subscriptions').all<{id:string;endpoint:string}>()]);let sent=0,failed=0;
 await db.prepare("DELETE FROM admin_push_deliveries WHERE created_at LIKE 'pending:%' AND substr(created_at,9)<?").bind(new Date(Date.now()-600000).toISOString()).run();
 for(const s of subscriptions.results){
  if(!allowedPushEndpoint(s.endpoint))continue;
  const available=alerts.results.filter(a=>visibleAlert(a)),claimed:string[]=[];
  for(const a of available){
   const digest=b64(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s.id+'|'+a.id+'|'+a.source_version+'|'+a.priority))));
   const lease=await db.prepare('INSERT OR IGNORE INTO admin_push_deliveries(id,subscription_id,created_at) VALUES(?,?,?)').bind(digest,s.id,'pending:'+new Date().toISOString()).run();
   if(lease.meta.changes)claimed.push(digest);
  }
  if(!claimed.length)continue;
  try{
   const response=await fetch(s.endpoint,{method:'POST',headers:{Authorization:await authorization(s.endpoint),TTL:'3600',Urgency:'normal'},redirect:'error',signal:AbortSignal.timeout(10000)});
   if(response.status===404||response.status===410){await db.prepare('DELETE FROM admin_push_subscriptions WHERE id=?').bind(s.id).run()}
   else if(!response.ok)throw new Error('Push refused');else sent++;
   for(let offset=0;offset<claimed.length;offset+=50)await db.batch(claimed.slice(offset,offset+50).map(id=>db.prepare('UPDATE admin_push_deliveries SET created_at=? WHERE id=?').bind(new Date().toISOString(),id)));
  }catch{failed++;for(let offset=0;offset<claimed.length;offset+=50)await db.batch(claimed.slice(offset,offset+50).map(id=>db.prepare('DELETE FROM admin_push_deliveries WHERE id=?').bind(id)))}
 }
 return {configured:true,sent,failed};
}
