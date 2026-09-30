import {database} from '@/lib/student-space';
import {miamiNowLocal} from '@/lib/consultations';
export const dynamic='force-dynamic';
export async function GET(){try{const rows=await database().prepare("SELECT id,start_local FROM consultation_slots WHERE status='available' AND start_local>? ORDER BY start_local LIMIT 80").bind(miamiNowLocal()).all();return Response.json({slots:rows.results},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'No se pudieron cargar los horarios.'},{status:503})}}
export async function POST(request:Request){try{
 const data=await request.json() as Record<string,unknown>;const id=String(data.id||''),name=String(data.name||'').trim(),email=String(data.email||'').trim().toLowerCase(),phone=String(data.phone||'').trim(),goal=String(data.goal||'').trim();
 if(!/^[a-f0-9-]{36}$/.test(id)||name.length<2||name.length>100||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||phone.length<7||phone.length>30||goal.length>500)return Response.json({error:'Revisa tu nombre, correo y teléfono.'},{status:400});
 const db=database();const existing=await db.prepare("SELECT COUNT(*) AS n FROM consultation_slots WHERE email=? AND status IN ('requested','confirmed') AND start_local>?").bind(email,miamiNowLocal()).first<{n:number}>();if((existing?.n||0)>=2)return Response.json({error:'Ya tienes dos consultas pendientes o confirmadas. Contacta a Herlin si necesitas cambiarlas.'},{status:409});
 const result=await db.prepare("UPDATE consultation_slots SET status='requested',name=?,email=?,phone=?,goal=?,requested_at=? WHERE id=? AND status='available' AND start_local>?").bind(name,email,phone,goal,new Date().toISOString(),id,miamiNowLocal()).run();
 return result.meta.changes?Response.json({requested:true}):Response.json({error:'Ese horario ya no está disponible. Elige otro.'},{status:409});
 }catch{return Response.json({error:'No se pudo guardar tu solicitud.'},{status:503})}}
