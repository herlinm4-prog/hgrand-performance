import {database} from '@/lib/student-space';
import {planKey,plans} from '@/lib/plans';
import type {CheckoutOrder} from '@/lib/checkout';
import {stripeWebhookSecret} from '@/lib/stripe-config';
import {markOfferPaid} from '@/lib/monthly-payment';
export const dynamic='force-dynamic';

function decodeHex(value:string){
 if(!/^[a-f0-9]{64}$/i.test(value))return null;
 return Uint8Array.from(value.match(/.{2}/g)!,byte=>parseInt(byte,16));
}
async function validSignature(payload:string,header:string,secret:string){
 const parts=header.split(',').map(part=>part.trim().split('='));
 const time=parts.find(([name])=>name==='t')?.[1];
 if(!time||!/^[0-9]+$/.test(time)||Math.abs(Date.now()/1000-Number(time))>300)return false;
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const expected=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${time}.${payload}`)));
 return parts.filter(([name])=>name==='v1').some(([,value])=>{
  const provided=decodeHex(value||'');if(!provided)return false;
  let diff=0;for(let i=0;i<expected.length;i++)diff|=provided[i]^expected[i];return diff===0;
 });
}

export async function POST(request:Request){
 const secret=stripeWebhookSecret(),signature=request.headers.get('stripe-signature');
 if(!secret)return Response.json({error:'No configurado.'},{status:503});
 if(!signature)return Response.json({error:'Firma requerida.'},{status:400});
 const payload=await request.text();
 if(!(await validSignature(payload,signature,secret)))return Response.json({error:'Firma inválida.'},{status:400});
 let event:{type:string;livemode?:boolean;data?:{object?:{id?:string;mode?:string;payment_status?:string;client_reference_id?:string;metadata?:{plan?:string;order_id?:string;custom_request_id?:string;offer_id?:string};amount_total?:number;currency?:string}}};
 try{event=JSON.parse(payload)}catch{return Response.json({error:'Evento inválido.'},{status:400})}
 if(!['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired','checkout.session.async_payment_failed'].includes(event.type))return Response.json({received:true});
 const session=event.data?.object,plan=session?.metadata?.plan==='a-medida'?'a-medida':planKey(session?.metadata?.plan),orderId=session?.metadata?.order_id;
 if(orderId){
 const order=await database().prepare('SELECT * FROM checkout_orders WHERE id=?').bind(orderId).first<CheckoutOrder>();
 if(!order||!session?.id||session.client_reference_id!==order.student_id||plan!==order.plan||session.mode!=='payment'||(order.session_id&&session.id!==order.session_id)||(event.livemode?'live':'test')!==order.mode||(order.custom_request_id&&session.metadata?.custom_request_id!==order.custom_request_id)||(order.offer_id&&session.metadata?.offer_id!==order.offer_id))return Response.json({error:'Pedido inconsistente.'},{status:400});
 if(event.type==='checkout.session.async_payment_failed'){await database().prepare("UPDATE checkout_orders SET status='failed',session_id=? WHERE id=? AND status='pending'").bind(session.id,order.id).run();return Response.json({received:true})}
 if(event.type==='checkout.session.expired'){await database().prepare("UPDATE checkout_orders SET status='expired',session_id=? WHERE id=? AND status='pending'").bind(session.id,order.id).run();return Response.json({received:true})}
 if(session.payment_status!=='paid')return Response.json({received:true});
 if(session.amount_total!==order.amount_cents||session.currency!=='usd')return Response.json({error:'Importe inconsistente.'},{status:400});
 const paidAt=new Date().toISOString();
 await database().batch([
 database().prepare("UPDATE checkout_orders SET status='paid',session_id=?,paid_at=COALESCE(paid_at,?) WHERE id=?").bind(session.id,paidAt,order.id),
 database().prepare('INSERT OR IGNORE INTO student_payments (session_id,student_id,plan,amount_cents,currency,paid_at) VALUES (?,?,?,?,?,?)').bind(session.id,order.student_id,order.plan,String(order.amount_cents),'usd',paidAt),
 ...(order.custom_request_id?[database().prepare("UPDATE custom_plan_requests SET status='paid',updated_at=? WHERE id=? AND student_id=? AND status IN ('approved','paid')").bind(paidAt,order.custom_request_id,order.student_id)]:[])
 ]);
 if(order.offer_id){
  if(order.mode==='live')await markOfferPaid(order.offer_id,'stripe',paidAt);
  else await database().prepare("UPDATE enrollment_offers SET payment_status='test',paid_at=? WHERE id=? AND payment_status='unpaid'").bind(paidAt,order.offer_id).run();
 }
 return Response.json({received:true});
 }
 // Existing test sessions remain compatible with the previous version.
 if(event.type==='checkout.session.expired')return Response.json({received:true});
 if(!session?.id?.startsWith('cs_test_')||session.mode!=='payment'||session.payment_status!=='paid'||!session.client_reference_id||!plan||plan==='a-medida'||session.amount_total!==plans[plan].launch*100||session.currency!=='usd')return Response.json({error:'Pago inconsistente.'},{status:400});
 await database().prepare('INSERT OR IGNORE INTO student_payments (session_id,student_id,plan,amount_cents,currency,paid_at) VALUES (?,?,?,?,?,?)').bind(session.id,session.client_reference_id,plan,String(session.amount_total),'usd',new Date().toISOString()).run();return Response.json({received:true});
}
