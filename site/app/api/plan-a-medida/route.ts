import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database} from '@/lib/student-space';
import {z} from 'zod';
export const dynamic='force-dynamic';
const requestSchema=z.object({
 name:z.string().trim().min(2).max(100),phone:z.string().trim().min(7).max(35),
 days:z.array(z.enum(['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'])).min(1).max(6).refine(v=>new Set(v).size===v.length),
 durationMinutes:z.number().int().refine(v=>[60,90,120].includes(v)),preferredTime:z.string().trim().min(3).max(150),gym:z.string().trim().min(3).max(180),notes:z.string().trim().max(1000),
});
export async function GET(){const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión.'},{status:401});try{
 const rows=await database().prepare('SELECT id,days,duration_minutes,preferred_time,gym,notes,status,coach_note,quoted_cents,coupon_status,coupon_code,coupon_discount_cents,created_at FROM custom_plan_requests WHERE student_id=? ORDER BY created_at DESC LIMIT 10').bind(user.userId).all();
 return Response.json({requests:rows.results},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return Response.json({error:'No pudimos cargar tus solicitudes.'},{status:503})}}
export async function POST(request:Request){const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión para enviar tu solicitud.'},{status:401});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Solicitud inválida.'},{status:403});
 let body:unknown;try{body=await request.json()}catch{return Response.json({error:'Solicitud inválida.'},{status:400})}
 const parsed=requestSchema.safeParse(body);if(!parsed.success)return Response.json({error:'Revisa los días, el horario, la duración y el gimnasio.'},{status:400});
 const p=parsed.data,id=crypto.randomUUID(),now=new Date().toISOString();try{
 const saved=await database().prepare(`INSERT INTO custom_plan_requests (id,student_id,name,email,phone,days,duration_minutes,preferred_time,gym,notes,status,coach_note,quoted_cents,created_at,updated_at)
 SELECT ?,?,?,?,?,?,?,?,?,?,'pending','',NULL,?,? WHERE (SELECT COUNT(*) FROM custom_plan_requests WHERE student_id=? AND status='pending')<3`).bind(id,user.userId,p.name,user.email,p.phone,JSON.stringify(p.days),p.durationMinutes,p.preferredTime,p.gym,p.notes,now,now,user.userId).run();
 if(!saved.meta.changes)return Response.json({error:'Ya tienes tres solicitudes pendientes. Espera la respuesta del coach.'},{status:409});
 return Response.json({id,status:'pending'},{status:201});
 }catch{return Response.json({error:'No se pudo guardar la solicitud. Inténtalo de nuevo.'},{status:503})}}
