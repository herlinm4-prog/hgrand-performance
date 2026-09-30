import {getChatGPTUser} from '@/app/chatgpt-auth';
import {allowedStudent,database,filesBucket,isCoach} from '@/lib/student-space';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión.'},{status:401});
 try{
  const form=await request.formData();const file=form.get('file');const kind=form.get('kind');
  const target=await allowedStudent(user,typeof form.get('student')==='string'?String(form.get('student')):null);
  if(!target)return Response.json({error:'Perfil no encontrado.'},{status:404});
  if(!(file instanceof File))return Response.json({error:'Selecciona un archivo.'},{status:400});
  const coach=isCoach(user);
  const isPhoto=kind==='photo';const isPlan=coach&&(kind==='nutrition'||kind==='training'||kind==='supplementation');
  if(!isPhoto&&!isPlan)return Response.json({error:'Tipo de archivo no permitido.'},{status:403});
  const permitted=isPhoto?['image/jpeg','image/png','image/webp','image/heic','image/heif']:['application/pdf'];
  const max=isPhoto?10*1024*1024:20*1024*1024;
  if(!permitted.includes(file.type)||!file.size||file.size>max)return Response.json({error:`Archivo inválido o mayor de ${isPhoto?10:20} MB.`},{status:400});
  const id=crypto.randomUUID();const key=`students/${target}/${id}`;
  const label=typeof form.get('label')==='string'?String(form.get('label')).trim().slice(0,75):'';
  const view=typeof form.get('view')==='string'?String(form.get('view')):'';
  if(isPhoto&&view&&!['Frente','Perfil','Espalda','Otra'].includes(view))return Response.json({error:'Vista de foto inválida.'},{status:400});
  const displayLabel=isPhoto?(view&&view!=='Otra'?view+(label?' · '+label:''):label||'Foto de progreso'):label||({nutrition:'Plan nutricional',training:'Plan de entrenamiento',supplementation:'Guía de suplementación'}[String(kind)]);
  const filename=file.name.replace(/[\r\n"\\/]/g,'_').slice(0,120)||'archivo';
  await filesBucket().put(key,file.stream(),{httpMetadata:{contentType:file.type}});
  try{await database().prepare('INSERT INTO student_files (id, student_id, uploader_id, kind, label, filename, mime, object_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id,target,user.userId,kind,displayLabel,filename,file.type,key,new Date().toISOString()).run()}
  catch(e){await filesBucket().delete(key);throw e}
  return Response.json({saved:true,id});
 }catch(e){console.error('File upload failed',e);return Response.json({error:'No se pudo subir el archivo. Inténtalo de nuevo.'},{status:503})}
}
