import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database,isCoach} from '@/lib/student-space';
export const dynamic='force-dynamic';

type Conversation={student_id:string;name:string;last_body:string|null;last_at:string|null;last_sender_id:string|null;message_count:number;read_at:string|null;read_version:string|null;last_id:string|null};
export async function GET(){
 const user=await getChatGPTUser();
 if(!user)return Response.json({error:'Inicia sesión.'},{status:401});
 if(!isCoach(user))return Response.json({error:'Acceso denegado.'},{status:403});
 try{
  const rows=await database().prepare(`SELECT p.user_id AS student_id, p.name,
   (SELECT body FROM student_messages WHERE student_id=p.user_id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_body,
   (SELECT created_at FROM student_messages WHERE student_id=p.user_id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_at,
   (SELECT sender_id FROM student_messages WHERE student_id=p.user_id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_sender_id,
   (SELECT count(*) FROM student_messages WHERE student_id=p.user_id) AS message_count,
   (SELECT id FROM student_messages WHERE student_id=p.user_id ORDER BY created_at DESC,id DESC LIMIT 1) AS last_id,
   (SELECT read_at FROM admin_notifications WHERE id='message:'||p.user_id) AS read_at,
   (SELECT source_version FROM admin_notifications WHERE id='message:'||p.user_id) AS read_version
   FROM student_profiles p ORDER BY last_at DESC, p.name COLLATE NOCASE`).all<Conversation>();
  return Response.json({conversations:rows.results.map(row=>({...row,unread:row.last_sender_id===row.student_id&&(!row.read_at||row.read_version!==row.last_id),awaiting_reply:row.last_sender_id!==null&&row.last_sender_id!==user.userId}))},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){console.error('Inbox read failed',e);return Response.json({error:'No se pudo cargar la bandeja.'},{status:503})}
}
