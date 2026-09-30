import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database} from '@/lib/student-space';
import {stripeKey,stripeMode,stripeStatus} from '@/lib/stripe-config';
export const dynamic='force-dynamic';
type Offer={id:string;email:string;plan:string;details:string;amount_cents:number;status:string;payment_status:string;terms:string;start_date:string|null;duration_weeks:number};
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión con el correo de la propuesta.'},{status:401});
 const origin=new URL(request.url).origin;if(request.headers.get('origin')&&request.headers.get('origin')!==origin)return Response.json({error:'Solicitud inválida.'},{status:403});
 const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))return Response.json({error:'Propuesta inválida.'},{status:400});
 const key=stripeKey();if(!key||!stripeStatus().ready)return Response.json({error:'El pago en línea aún no está disponible. Contacta a Herlin.'},{status:503});
 try{
  const db=database(),offer=await db.prepare('SELECT id,email,plan,details,amount_cents,status,payment_status,terms,start_date,duration_weeks FROM enrollment_offers WHERE id=? AND email=?').bind(id,user.email.trim().toLowerCase()).first<Offer>();
  if(!offer||offer.status!=='accepted'||offer.payment_status!=='unpaid')return Response.json({error:'Esta propuesta no está pendiente de pago.'},{status:409});
  const orderId=crypto.randomUUID(),now=new Date().toISOString(),mode=stripeMode();
  const inserted=await db.prepare(`INSERT INTO checkout_orders (id,student_id,plan,mode,status,amount_cents,base_cents,discount_code,launch,terms,created_at,offer_id)
  SELECT ?,?,?,?,'pending',?,?, '',0,?,?,? WHERE NOT EXISTS (SELECT 1 FROM checkout_orders WHERE offer_id=? AND status IN ('pending','paid')) AND EXISTS (SELECT 1 FROM enrollment_offers WHERE id=? AND status='accepted' AND payment_status='unpaid')`).bind(orderId,user.userId,offer.plan,mode,offer.amount_cents,offer.amount_cents,offer.terms,now,id,id,id).run();
  if(!inserted.meta.changes)return Response.json({error:'Ya existe un pago abierto para este mes. Complétalo o espera a que venza antes de volver a intentarlo.'},{status:409});
  const form=new URLSearchParams({mode:'payment',locale:'es','payment_method_types[0]':'card','line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':String(offer.amount_cents),'line_items[0][price_data][product_data][name]':`HGrand · ${offer.plan==='online'?'Online':'Presencial'} · ${offer.duration_weeks} ${offer.duration_weeks===1?'semana':'semanas'}`,'line_items[0][quantity]':'1',customer_email:user.email,client_reference_id:user.userId,'metadata[plan]':offer.plan,'metadata[order_id]':orderId,'metadata[offer_id]':id,expires_at:String(Math.floor(Date.now()/1000)+1860),success_url:`${origin}/checkout/resultado?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${origin}/cuenta/propuesta/${id}`});
  const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':orderId},body:form.toString()});const data=await response.json() as {id?:string;url?:string};
  if(!response.ok||!data.id||!data.url?.startsWith('https://checkout.stripe.com/')){if(response.status<500)await db.prepare("UPDATE checkout_orders SET status='failed' WHERE id=? AND status='pending'").bind(orderId).run();return Response.json({error:'No se pudo preparar el pago. Inténtalo de nuevo.'},{status:502})}
  await db.prepare('UPDATE checkout_orders SET session_id=? WHERE id=?').bind(data.id,orderId).run();return Response.json({url:data.url},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Offer checkout failed',e);return Response.json({error:'No pudimos confirmar la conexión de pago. Revisa el estado antes de reintentar.'},{status:502})}
}
