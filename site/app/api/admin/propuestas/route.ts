import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database,isCoach} from '@/lib/student-space';
import {offerTerms} from '@/lib/offer-terms';
import {getSettings} from '@/lib/cms';
import {calculateOfferCents} from '@/lib/offer-pricing';
import {markOfferPaid} from '@/lib/monthly-payment';
import {validPaymentWeeks} from '@/lib/monthly-payment';
export const dynamic='force-dynamic';
async function admin(){const user=await getChatGPTUser();return !!user&&isCoach(user)}
export async function GET(){if(!await admin())return Response.json({error:'Acceso restringido.'},{status:403});try{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const part=(type:string)=>parts.find(p=>p.type===type)?.value||'';const today=new Date(Date.UTC(Number(part('year')),Number(part('month'))-1,Number(part('day'))));today.setUTCDate(today.getUTCDate()+7);const through=today.toISOString().slice(0,10);const [rows,due,students,settings]=await Promise.all([database().prepare('SELECT id,email,name,plan,details,amount_cents,duration_weeks,sessions_per_week,pricing_mode,start_date,status,created_at,responded_at,signed_name,payment_status,paid_at,sent_at FROM enrollment_offers ORDER BY created_at DESC LIMIT 300').all(),database().prepare("SELECT email,name,plan,next_payment_date FROM student_enrollments WHERE next_payment_date IS NOT NULL AND status!='paused' AND next_payment_date<=? ORDER BY next_payment_date LIMIT 100").bind(through).all(),database().prepare('SELECT email,name,plan,duration_weeks,sessions_per_week FROM student_enrollments ORDER BY name LIMIT 300').all(),getSettings()]);return Response.json({offers:rows.results,due:due.results,students:students.results,prices:{online:settings.plans.online.price,presencial:settings.plans.presencial.price}},{headers:{'Cache-Control':'private, no-store'}})}catch(e){console.error('Offer read failed',e);return Response.json({error:'No se pudieron cargar las propuestas.'},{status:503})}}
export async function POST(request:Request){if(!await admin())return Response.json({error:'Acceso restringido.'},{status:403});try{
 const input=await request.json() as Record<string,unknown>,email=String(input.email||'').trim().toLowerCase(),details=String(input.details||'').trim(),startDate=String(input.startDate||''),pricingMode=String(input.pricingMode||''),amount=Number(input.amount),durationWeeks=Number(input.durationWeeks),sessionsPerWeek=Number(input.sessionsPerWeek);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||details.length<15||details.length>1500||!validPaymentWeeks(durationWeeks)||!Number.isInteger(sessionsPerWeek)||sessionsPerWeek<1||sessionsPerWeek>5||!['calculated','custom'].includes(pricingMode)||pricingMode==='custom'&&(!Number.isFinite(amount)||amount<=0||amount>100000||!/^\d+(\.\d{1,2})?$/.test(String(input.amount)))||!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!Number.isFinite(Date.parse(startDate)))return Response.json({error:'Indica de 1 a 16 semanas, sesiones, inicio, servicios y un importe personalizado válido si lo elegiste.'},{status:400});
 const db=database(),student=await db.prepare('SELECT name,plan FROM student_enrollments WHERE email = ?').bind(email).first<{name:string;plan:'online'|'presencial'}>();
 if(!student)return Response.json({error:'Registra primero al alumno con ese correo.'},{status:404});
 const existing=await db.prepare("SELECT id FROM enrollment_offers WHERE email=? AND status='pending'").bind(email).first();
 if(existing)return Response.json({error:'Ya existe una propuesta pendiente. Espera su respuesta antes de crear otra.'},{status:409});
 const amountCents=pricingMode==='calculated'?calculateOfferCents(await getSettings(),student.plan,durationWeeks,sessionsPerWeek):Math.round(amount*100);
 const fullDetails=student.plan==='presencial'?`${details}\n${sessionsPerWeek} ${sessionsPerWeek===1?'sesión':'sesiones'} de una hora por semana durante ${durationWeeks} ${durationWeeks===1?'semana':'semanas'}.`:details;
 const terms=offerTerms(startDate,amountCents,fullDetails,durationWeeks);
 const id=crypto.randomUUID();await db.prepare('INSERT INTO enrollment_offers (id,email,name,plan,details,amount_cents,duration_weeks,sessions_per_week,pricing_mode,start_date,terms,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,email,student.name,student.plan,fullDetails,amountCents,durationWeeks,sessionsPerWeek,pricingMode,startDate,terms,'pending',new Date().toISOString()).run();
 return Response.json({id,created:true});
 }catch(e){console.error('Offer create failed',e);return Response.json({error:'No se pudo preparar la propuesta.'},{status:503})}}
export async function PATCH(request:Request){if(!await admin())return Response.json({error:'Acceso restringido.'},{status:403});try{
 const input=await request.json() as Record<string,unknown>,id=String(input.id||''),action=String(input.action||'');
 if(!/^[a-f0-9-]{36}$/.test(id)||!['sent','paid','paid_zelle'].includes(action))return Response.json({error:'Acción inválida.'},{status:400});
 if(action==='paid'||action==='paid_zelle'){const changed=await markOfferPaid(id,action==='paid_zelle'?'zelle':'manual',new Date().toISOString());return changed?Response.json({saved:true}):Response.json({error:'La propuesta debe estar aceptada y sin pagar.'},{status:409})}
 const result=await database().prepare("UPDATE enrollment_offers SET sent_at=? WHERE id=? AND status='pending'").bind(new Date().toISOString(),id).run();return result.meta.changes?Response.json({saved:true}):Response.json({error:'Esta propuesta ya tiene una respuesta.'},{status:409});
 }catch(e){console.error('Offer update failed',e);return Response.json({error:'No se pudo actualizar la propuesta.'},{status:503})}}
