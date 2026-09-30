import {adminUser,privateHeaders,sameOrigin} from '@/lib/admin-api';
import {database} from '@/lib/student-space';
import {syncNotifications,type NotificationRow} from '@/lib/admin-notifications';
import {miamiDate,visibleAlert} from '@/lib/notification-rules';
export const dynamic='force-dynamic';
export async function GET(request:Request){const user=await adminUser();if(!user)return Response.json({error:'Acceso restringido.'},{status:403,headers:privateHeaders});try{
 const db=database(),historyId=new URL(request.url).searchParams.get('history');
 if(historyId){const history=await db.prepare('SELECT action,created_at FROM admin_notification_history WHERE notification_id=? ORDER BY created_at DESC LIMIT 100').bind(historyId).all();return Response.json({history:history.results},{headers:privateHeaders})}
 const summary=await syncNotifications(user.userId),rows=await db.prepare('SELECT * FROM admin_notifications ORDER BY priority ASC,COALESCE(due_date,occurred_at) ASC,id ASC').all<NotificationRow>();
 const active=rows.results.filter(r=>visibleAlert(r)),today=miamiDate();
 return Response.json({notifications:rows.results,today,summary:{action:active.filter(r=>r.requires_action).length,unread:active.filter(r=>!r.read_at).length,payments:active.filter(r=>r.category==='pagos'&&r.requires_action).length,overdue:active.filter(r=>r.category==='pagos'&&r.due_date&&r.due_date<today).length,checkins:active.filter(r=>r.category==='checkins'&&r.requires_action).length,messages:active.filter(r=>r.category==='mensajes').length,progress:active.filter(r=>r.category==='progreso'&&r.requires_action).length,students:summary.activeStudents},updatedAt:new Date().toISOString()},{headers:privateHeaders});
 }catch(e){console.error('Notification refresh failed',e);return Response.json({error:'No se pudieron actualizar las alertas. Reintenta; tus estados guardados se conservan.'},{status:503,headers:privateHeaders})}}
export async function PATCH(request:Request){const user=await adminUser();if(!user)return Response.json({error:'Acceso restringido.'},{status:403});if(!sameOrigin(request))return Response.json({error:'Origen no permitido.'},{status:403});try{
 const input=await request.json() as Record<string,unknown>,id=String(input.id||''),action=String(input.action||'');
 if(id.length>400||!['read','unread','resolve','reopen','snooze','unsnooze'].includes(action))return Response.json({error:'Acción inválida.'},{status:400});
 const db=database(),row=await db.prepare('SELECT id,source_version,read_at,resolved_at,snoozed_until FROM admin_notifications WHERE id=?').bind(id).first<{id:string;source_version:string;read_at:string|null;resolved_at:string|null;snoozed_until:string|null}>();if(!row)return Response.json({error:'Alerta no encontrada.'},{status:404});
 if(input.version&&input.version!==row.source_version)return Response.json({error:'Hay una actualización más reciente. Actualiza la alerta.'},{status:409});
 if(action==='read'&&row.read_at||action==='unread'&&!row.read_at||action==='resolve'&&row.resolved_at||action==='unsnooze'&&!row.snoozed_until)return Response.json({saved:true},{headers:privateHeaders});
 const now=new Date().toISOString(),hours=Number(input.hours||24);if(action==='snooze'&&![1,24,72,168].includes(hours))return Response.json({error:'Plazo inválido.'},{status:400});
 const sql=action==='read'?'read_at=?':action==='unread'?'read_at=NULL':action==='resolve'?'resolved_at=?,snoozed_until=NULL':action==='reopen'?'resolved_at=NULL,snoozed_until=NULL':action==='snooze'?'snoozed_until=?':'snoozed_until=NULL';
 const value=action==='snooze'?new Date(Date.now()+hours*3600000).toISOString():now;
 await db.batch([db.prepare('UPDATE admin_notifications SET '+sql+' WHERE id=?').bind(...(sql.includes('=?')?[value,id]:[id])),db.prepare('INSERT INTO admin_notification_history(id,notification_id,actor_id,action,created_at) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),id,user.userId,action==='snooze'?action+':'+hours:action,now)]);
 return Response.json({saved:true},{headers:privateHeaders});
 }catch(e){console.error('Notification action failed',e);return Response.json({error:'No se pudo guardar. Inténtalo de nuevo.'},{status:503})}}
