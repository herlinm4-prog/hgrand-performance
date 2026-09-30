import {database} from '@/lib/student-space';
import {plans} from '@/lib/plans';
import type {CheckoutOrder} from '@/lib/checkout';
type Offer={id:string;plan:string;amount_cents:number;duration_weeks:number;start_date:string|null;status:string;payment_status:string;paid_at:string|null;created_at:string};
export default async function PaymentHistory({userId,email}:{userId:string;email:string}){
 try{
  const db=database();const [orders,offers]=await Promise.all([
   db.prepare("SELECT * FROM checkout_orders WHERE student_id=? AND status='paid' AND mode='live' AND offer_id IS NULL ORDER BY paid_at DESC LIMIT 20").bind(userId).all<CheckoutOrder>(),
   db.prepare('SELECT id,plan,amount_cents,duration_weeks,start_date,status,payment_status,paid_at,created_at FROM enrollment_offers WHERE email=? ORDER BY created_at DESC LIMIT 20').bind(email.trim().toLowerCase()).all<Offer>(),
  ]);
  return <section className="payment-history"><h2 className="small-title">Propuestas y pagos</h2>
   {!orders.results.length&&!offers.results.length&&<p>Cuando Herlin prepare una propuesta, la verás aquí. Todavía no tienes pagos registrados.</p>}
   {offers.results.map(o=><p key={o.id}><a href={'/cuenta/propuesta/'+o.id}><strong>{o.plan==='online'?'Acompañamiento online':'Entrenamiento presencial'}</strong> · US${(o.amount_cents/100).toFixed(2)} · {o.duration_weeks} {o.duration_weeks===1?'semana':'semanas'}</a><br/>{o.status==='pending'?'Pendiente de tu respuesta':o.status==='declined'?'Rechazada':o.payment_status==='unpaid'?'Aceptada · pendiente de pago':o.payment_status==='zelle'?'Zelle confirmado por Herlin':o.payment_status==='stripe'?'Pagada con Stripe':o.payment_status==='manual'?'Pago externo confirmado':o.payment_status==='test'?'Pago de prueba, sin cargo real':'Pago por verificar'}{o.start_date?' · Inicio '+o.start_date:''}</p>)}
   {orders.results.map(o=><p key={o.id}><strong>{o.plan==='a-medida'?'Plan a medida':plans[o.plan].name}</strong> · US${(o.amount_cents/100).toFixed(2)} · {new Date(o.paid_at||o.created_at).toLocaleDateString('es-US')}<br/>Pago confirmado. Coordina el inicio con Herlin.</p>)}
  </section>;
 }catch{return <section className="payment-history"><h2 className="small-title">Propuestas y pagos</h2><p>No pudimos cargar tus pagos. Inténtalo de nuevo más tarde.</p></section>}
}
