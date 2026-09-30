import {getChatGPTUser} from '@/app/chatgpt-auth';
import {allowedStudent,database,isCoach} from '@/lib/student-space';
import {privateHeaders,sameOrigin} from '@/lib/admin-api';
import {miamiDate,validDate} from '@/lib/notification-rules';
export const dynamic='force-dynamic';
export async function GET(request:Request){const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión.'},{status:401});try{
 const student=await allowedStudent(user,new URL(request.url).searchParams.get('student'));if(!student)return Response.json({error:'Perfil no encontrado.'},{status:404});
 const [rows,photos,enrollment]=await Promise.all([database().prepare('SELECT * FROM student_checkins WHERE student_id=? ORDER BY scheduled_date DESC,created_at DESC LIMIT 100').bind(student).all(),database().prepare("SELECT id,label,created_at FROM student_files WHERE student_id=? AND kind='photo' ORDER BY created_at DESC LIMIT 100").bind(student).all(),database().prepare('SELECT next_checkin_date FROM student_enrollments WHERE user_id=?').bind(student).first<{next_checkin_date:string|null}>()]);
 return Response.json({checkins:rows.results,photos:photos.results,scheduledDate:enrollment?.next_checkin_date||null},{headers:privateHeaders});
 }catch(e){console.error('Check-in read failed',e);return Response.json({error:'No se pudo cargar el seguimiento.'},{status:503})}}
export async function POST(request:Request){const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión.'},{status:401});if(!sameOrigin(request))return Response.json({error:'Origen no permitido.'},{status:403});try{
 const d=await request.json() as Record<string,unknown>,student=await allowedStudent(user,typeof d.student==='string'?d.student:null);if(!student)return Response.json({error:'Perfil no encontrado.'},{status:404});
 const date=String(d.scheduledDate||''),comments=String(d.comments||'').trim();const field=(key:string,min:number,max:number,required=false)=>{const s=String(d[key]??'').trim();if(!s&&!required)return null;const n=Number(s);if(!s||!Number.isFinite(n)||n<min||n>max)throw new Error('validation');return String(n)};
 let weight,fat,muscle,waist;try{weight=field('weightKg',20,500,true);fat=field('bodyFatPercent',1,80);muscle=field('muscleKg',1,250);waist=field('waistCm',20,300)}catch{return Response.json({error:'Revisa peso, medidas y bioimpedancia.'},{status:400})}
 if(!validDate(date)||date>miamiDate()||comments.length>2000)return Response.json({error:'Revisa la fecha y el comentario.'},{status:400});
 const id=String(d.id||'');if(!/^[a-f0-9-]{36}$/.test(id))return Response.json({error:'Identificador inválido.'},{status:400});
 const existing=await database().prepare('SELECT id FROM student_checkins WHERE student_id=? AND scheduled_date=?').bind(student,date).first<{id:string}>();if(existing&&existing.id!==id)return Response.json({error:'Ya enviaste un check-in para esta fecha. Revisa el historial.'},{status:409});
 const inserted=await database().prepare('INSERT OR IGNORE INTO student_checkins(id,student_id,scheduled_date,weight_kg,body_fat_percent,muscle_kg,waist_cm,comments,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,student,date,weight,fat,muscle,waist,comments,new Date().toISOString()).run();
 if(!inserted.meta.changes){const previous=await database().prepare('SELECT id FROM student_checkins WHERE student_id=? AND scheduled_date=?').bind(student,date).first<{id:string}>();if(previous?.id!==id)return Response.json({error:'Ya existe un check-in en esa fecha.'},{status:409});}
 return Response.json({saved:true},{headers:privateHeaders});
 }catch(e){console.error('Check-in write failed',e);return Response.json({error:'No se pudo guardar el check-in. Conserva tus datos y reintenta.'},{status:503})}}
export async function PATCH(request:Request){const user=await getChatGPTUser();if(!user||!isCoach(user))return Response.json({error:'Acceso restringido.'},{status:403});if(!sameOrigin(request))return Response.json({error:'Origen no permitido.'},{status:403});try{
 const d=await request.json() as Record<string,unknown>,id=String(d.id||''),note=String(d.note||'').trim(),next=String(d.nextDate||'');
 if(!/^[a-f0-9-]{36}$/.test(id)||note.length>2000||next&&(!validDate(next)||next<=miamiDate()))return Response.json({error:'Revisa la nota y el próximo check-in.'},{status:400});
 const db=database(),row=await db.prepare('SELECT student_id,scheduled_date FROM student_checkins WHERE id=?').bind(id).first<{student_id:string;scheduled_date:string}>();if(!row)return Response.json({error:'Check-in no encontrado.'},{status:404});
 await db.batch([db.prepare('UPDATE student_checkins SET reviewed_at=?,reviewed_by=?,coach_note=? WHERE id=?').bind(new Date().toISOString(),user.userId,note,id),...(next?[db.prepare('UPDATE student_enrollments SET next_checkin_date=?,updated_at=? WHERE user_id=? AND (next_checkin_date IS NULL OR next_checkin_date<=?)').bind(next,new Date().toISOString(),row.student_id,row.scheduled_date)]:[])]);
 return Response.json({saved:true},{headers:privateHeaders});
 }catch(e){console.error('Check-in review failed',e);return Response.json({error:'No se pudo guardar la revisión.'},{status:503})}}
