import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database,filesBucket,isCoach} from '@/lib/student-space';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await getChatGPTUser();if(!user)return new Response('Inicia sesión',{status:401});
 try{
  const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))return new Response('No encontrado',{status:404});
  const record=await database().prepare('SELECT student_id, object_key, filename, mime FROM student_files WHERE id = ?').bind(id).first<{student_id:string;object_key:string;filename:string;mime:string}>();
  if(!record||(!isCoach(user)&&record.student_id!==user.userId))return new Response('No encontrado',{status:404});
  const object=await filesBucket().get(record.object_key);if(!object)return new Response('No encontrado',{status:404});
  const safe=record.filename.replace(/[\r\n"\\]/g,'_');
  return new Response(object.body,{headers:{'Content-Type':record.mime,'Content-Disposition':`${record.mime==='application/pdf'?'attachment':'inline'}; filename="${safe}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch(e){console.error('File read failed',e);return new Response('Archivo temporalmente no disponible',{status:503})}
}
