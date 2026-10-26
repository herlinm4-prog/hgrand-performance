import type {Metadata} from "next";
export const metadata:Metadata={robots:{index:false,follow:false},title:"Resultado del checkout"};
import {Header,Footer} from '@/app/site-shell';
import {requireChatGPTUser} from '@/app/chatgpt-auth';
import {database} from '@/lib/student-space';
import {stripeTestKey} from '@/lib/stripe-config';
import type {CheckoutOrder} from '@/lib/checkout';
export const dynamic='force-dynamic';
async function Result({sessionId}:{sessionId:string}){
 const user=await requireChatGPTUser('/checkout/resultado?session_id='+encodeURIComponent(sessionId));
 if(!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId))return <p>No encontramos un pago asociado a esta solicitud.</p>;
 const order=await database().prepare('SELECT * FROM checkout_orders WHERE session_id=? AND student_id=?').bind(sessionId,user.userId).first<CheckoutOrder>();
 if(order){return order.status==='paid'?<><h1>{order.mode==='test'?'Pago de prueba completado':'Pago confirmado'}</h1><p>{order.mode==='test'?'Esta operación no realizó un cargo real.':'Hemos recibido tu pago de US$'+(order.amount_cents/100).toFixed(2)+'. Completa tu perfil para coordinar el inicio con Herlin.'}</p><a className="btn-dark" href={order.plan==='a-medida'?'/planes/a-medida':'/cuenta?plan='+order.plan}>Ir a mi espacio ↗</a></>:<><h1>{order.status==='expired'?'Pago vencido':'Confirmando tu pago'}</h1><p>Estamos esperando la confirmación del proveedor. No necesitas pagar de nuevo.</p><a className="btn-dark" href={'/checkout/resultado?session_id='+encodeURIComponent(sessionId)}>Actualizar estado</a><a className="secondary-link" href="/cuenta">Ir a mi cuenta</a></>}
 // Retain verification of test sessions created before the order register was added.
 const key=stripeTestKey();if(sessionId.startsWith('cs_test_')&&key){try{const r=await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(sessionId),{headers:{Authorization:`Bearer ${key}`},cache:'no-store'});const s=await r.json() as {client_reference_id?:string;payment_status?:string};if(r.ok&&s.client_reference_id===user.userId&&s.payment_status==='paid')return <><h1>Pago de prueba completado</h1><p>No se realizó ningún cargo real.</p><a className="btn-dark" href="/cuenta">Ir a mi espacio</a></>}catch{}}
 return <><h1>Pago por confirmar</h1><p>No encontramos todavía la confirmación de este pago en tu cuenta. Si acabas de pagar, actualiza el estado en unos segundos.</p><a className="btn-dark" href={'/checkout/resultado?session_id='+encodeURIComponent(sessionId)}>Actualizar estado</a></>;
}
export default async function CheckoutResult({searchParams}:{searchParams:Promise<{session_id?:string}>}){const {session_id}=await searchParams;return <><Header account/><main className="section wrap plan-detail checkout-result"><div className="eyebrow">Tu pedido HGrand</div><Result sessionId={session_id||''}/></main><Footer/></>}
