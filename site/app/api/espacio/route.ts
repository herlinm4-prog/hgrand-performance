import {getChatGPTUser} from '@/app/chatgpt-auth';
import {allowedStudent,database,isCoach,spaceData} from '@/lib/student-space';
export const dynamic='force-dynamic';
const failure=()=>Response.json({error:'No se pudo completar la solicitud. Inténtalo de nuevo.'},{status:503});
export async function GET(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión.'},{status:401});
 try{
  const url=new URL(request.url);const target=await allowedStudent(user,url.searchParams.get('student'));
  if(isCoach(user)&&url.searchParams.get('view')==='admin'&&!url.searchParams.get('student')){
   const students=await database().prepare('SELECT user_id, name FROM student_profiles ORDER BY name').all<{user_id:string;name:string}>();
   return Response.json({students:students.results});
  }
  if(!target)return Response.json({error:'Perfil no encontrado.'},{status:404});
  return Response.json(await spaceData(target,url.searchParams.get('before')),{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){console.error('Space read failed',e);return failure()}
}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión.'},{status:401});
 try{
  const data=await request.json() as {student?:string;body?:string};
  const target=await allowedStudent(user,typeof data.student==='string'?data.student:null);
  if(!target)return Response.json({error:'Perfil no encontrado.'},{status:404});
  const body=typeof data.body==='string'?data.body.trim():'';
  if(!body||body.length>2000)return Response.json({error:'Escribe un mensaje de hasta 2000 caracteres.'},{status:400});
  await database().prepare('INSERT INTO student_messages (id, student_id, sender_id, body, created_at) VALUES (?, ?, ?, ?, ?)').bind(crypto.randomUUID(),target,user.userId,body,new Date().toISOString()).run();
  return Response.json({saved:true});
 }catch(e){console.error('Message write failed',e);return failure()}
}
