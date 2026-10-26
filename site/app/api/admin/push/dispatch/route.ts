import {pushConfig,dispatchPush} from '@/lib/admin-push';
import {database} from '@/lib/student-space';
import {syncNotifications} from '@/lib/admin-notifications';
export const dynamic='force-dynamic';
export async function POST(request:Request){const token=pushConfig().jobToken,supplied=request.headers.get('authorization')||'';if(!token||supplied!=='Bearer '+token)return Response.json({error:'Acceso restringido.'},{status:403});try{const owner=await database().prepare('SELECT user_id FROM admin_push_subscriptions LIMIT 1').first<{user_id:string}>();if(!owner)return Response.json({sent:0,reason:'No hay dispositivos registrados.'});await syncNotifications(owner.user_id);return Response.json(await dispatchPush(),{headers:{'Cache-Control':'no-store'}})}catch(e){console.error('Alert dispatch failed',e);return Response.json({error:'No se pudieron procesar los avisos.'},{status:503})}}
