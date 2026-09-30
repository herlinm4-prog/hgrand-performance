import {getChatGPTUser} from '@/app/chatgpt-auth';
import {planKey} from '@/lib/plans';
import {stripeKey} from '@/lib/stripe-config';
import {quotePlan} from '@/lib/checkout';
import {database} from '@/lib/student-space';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión para continuar.'},{status:401});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Solicitud inválida.'},{status:403});
 const key=stripeKey();if(!key)return Response.json({error:'El pago en línea todavía no está conectado.'},{status:503});
 let body:Record<string,unknown>;try{body=await request.json() as Record<string,unknown>}catch{return Response.json({error:'Solicitud inválida.'},{status:400})}
 const selected=planKey(body?.plan);if(!selected)return Response.json({error:'Elige un plan válido.'},{status:400});
 let q;try{q=await quotePlan(selected,body.code,body.sessionsPerWeek)}catch(e){return Response.json({error:e instanceof Error?e.message:'Revisa el pedido.'},{status:400})}
 if(!q.enabled)return Response.json({error:'Confirma la disponibilidad con Herlin antes de pagar.'},{status:409});
 if(body.accepted!==true||body.expectedTotal!==q.totalCents||body.terms!==q.terms)return Response.json({error:'El resumen ha cambiado. Actualízalo y confirma el importe y las condiciones.'},{status:409});
 const id=crypto.randomUUID(),now=new Date().toISOString();
 // A single conditional insert reserves both the promotion and the voucher capacity.
 const reserved=await database().prepare(`INSERT INTO checkout_orders (id,student_id,plan,mode,status,amount_cents,base_cents,discount_code,launch,terms,created_at)
 SELECT ?,?,?,?,'pending',?,?,?,?,?,?
 WHERE (?=0 OR (SELECT COUNT(*) FROM checkout_orders WHERE plan=? AND mode=? AND launch=1 AND status IN ('pending','paid'))<5)
 AND (?='' OR EXISTS (SELECT 1 FROM discount_codes d WHERE d.code=? AND d.active=1 AND d.starts_at<=? AND d.expires_at>? AND (d.plan='all' OR d.plan=?) AND (SELECT COUNT(*) FROM checkout_orders WHERE discount_code=d.code AND mode=? AND status IN ('pending','paid'))<d.max_uses))
 AND (SELECT COUNT(*) FROM checkout_orders WHERE student_id=? AND status='pending')<3`).bind(id,user.userId,selected,q.mode,q.totalCents,q.baseCents,q.code,q.launch?1:0,q.terms,now,q.launch?1:0,selected,q.mode,q.code,q.code,now,now,selected,q.mode,user.userId).run();
 if(!reserved.meta.changes)return Response.json({error:'La disponibilidad cambió o tienes pagos abiertos. Actualiza el resumen; si ya abriste Stripe, completa o deja vencer ese pago.'},{status:409});
 const form=new URLSearchParams({mode:'payment',locale:'es','payment_method_types[0]':'card','line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':String(q.totalCents),'line_items[0][price_data][product_data][name]':`${q.p.name} · ${q.sessionCount?`${q.sessionCount} sesiones · `:''}primeras 4 semanas${q.code?' · descuento '+q.code:''}`,'line_items[0][quantity]':'1',customer_email:user.email,client_reference_id:user.userId,'metadata[plan]':selected,'metadata[order_id]':id,'metadata[user_id]':user.userId,...(q.sessionsPerWeek?{'metadata[sessions_per_week]':String(q.sessionsPerWeek),'metadata[support_fee_cents]':String(q.supportCents)}:{}),expires_at:String(Math.floor(Date.now()/1000)+1860),success_url:`${new URL(request.url).origin}/checkout/resultado?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${new URL(request.url).origin}/checkout?plan=${selected}${q.sessionsPerWeek?'&sessions='+q.sessionsPerWeek:''}`});
 try{
 const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':id},body:form.toString()});
 const data=await response.json() as {id?:string;url?:string};
 if(!response.ok){if(response.status<500)await database().prepare("UPDATE checkout_orders SET status='failed' WHERE id=? AND status='pending'").bind(id).run();return Response.json({error:'No se pudo preparar el pago. Inténtalo de nuevo.'},{status:502})}
 if(!data.id||!data.url?.startsWith('https://checkout.stripe.com/'))throw new Error('Invalid Stripe response');
 await database().prepare('UPDATE checkout_orders SET session_id=? WHERE id=?').bind(data.id,id).run();
 return Response.json({url:data.url},{headers:{'Cache-Control':'no-store'}});
 }catch{ return Response.json({error:'No se pudo confirmar la conexión con Stripe. Revisa el estado de tu pago antes de reintentar.'},{status:502})}
}
