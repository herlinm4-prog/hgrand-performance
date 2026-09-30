import {database} from '@/lib/student-space';

type Enrollment={name:string;plan:string;status:string;start_date:string|null;next_payment_date:string|null;next_checkin_date:string|null;first_plan_due_date:string|null};
type Offer={id:string;status:string;payment_status:string;amount_cents:number;duration_weeks:number;start_date:string|null};
const date=(value:string|null)=>value?new Date(value+'T12:00:00Z').toLocaleDateString('es-US',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):'Por coordinar';

export default async function NextSteps({email}:{email:string}){
 const db=database();const [enrollment,offer]=await Promise.all([
  db.prepare('SELECT name,plan,status,start_date,next_payment_date,next_checkin_date,first_plan_due_date FROM student_enrollments WHERE email=?').bind(email.trim().toLowerCase()).first<Enrollment>(),
  db.prepare('SELECT id,status,payment_status,amount_cents,duration_weeks,start_date FROM enrollment_offers WHERE email=? ORDER BY created_at DESC LIMIT 1').bind(email.trim().toLowerCase()).first<Offer>(),
 ]);
 if(!enrollment&&!offer)return null;
 const action=offer?.status==='pending'?{label:'Revisar y responder mi propuesta',href:'/cuenta/propuesta/'+offer.id}:offer?.status==='accepted'&&offer.payment_status==='unpaid'?{label:'Revisar cómo pagar mi período',href:'/cuenta/propuesta/'+offer.id}:{label:'Ver mis fotos y planes',href:'#seguimiento'};
 return <section className="student-space" aria-label="Tus próximos pasos"><div className="space-title"><div><div className="eyebrow">Tu proceso</div><h2>Qué sigue ahora</h2></div></div>
 <p>{offer?.status==='pending'?'Tienes una propuesta pendiente de respuesta. Revísala antes de pagar.':offer?.status==='accepted'&&offer.payment_status==='unpaid'?'Aceptaste tu propuesta. El pago de este período aún está pendiente.':enrollment?.status==='paused'?'Tu seguimiento está pausado; habla con Herlin para coordinar el regreso.':enrollment?.status==='active'?'Tu seguimiento está activo. Revisa tus próximos hitos aquí.':'Coordina con Herlin la evaluación y el comienzo del servicio.'}</p>
 <div className="space-summary"><div><strong>{date(enrollment?.next_checkin_date||null)}</strong><span>Próximo check-in</span></div><div><strong>{date(enrollment?.first_plan_due_date||null)}</strong><span>Primer plan estimado</span></div><div><strong>{date(enrollment?.next_payment_date||null)}</strong><span>Próximo vencimiento</span></div></div>
 {offer&&<p className="hint">Última propuesta: {offer.duration_weeks} {offer.duration_weeks===1?'semana':'semanas'} · US${(offer.amount_cents/100).toFixed(2)} · {offer.payment_status==='unpaid'?'Pago pendiente':offer.payment_status==='zelle'?'Zelle confirmado':offer.payment_status==='test'?'Pago de prueba':offer.payment_status==='stripe'?'Pagado con Stripe':'Pago externo registrado'}.</p>}
 <a className="btn-dark" href={action.href}>{action.label} ↗</a><p className="hint">Las fechas se fijan con Herlin. Si falta alguna o necesitas cambiarla, usa el chat de tu espacio.</p>
 </section>;
}
