import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database} from '@/lib/student-space';
import {getSettings} from '@/lib/cms';
import {stripeKey,stripeMode,stripeStatus} from '@/lib/stripe-config';
export const dynamic='force-dynamic';
type Approved={id:string;student_id:string;days:string;duration_minutes:number;preferred_time:string;gym:string;coach_note:string;quoted_cents:number;status:string;coupon_status:string;coupon_code:string|null;coupon_discount_cents:number};
async function quote(id:string,userId:string,rawCode:unknown){
 const row=await database().prepare('SELECT id,student_id,days,duration_minutes,preferred_time,gym,coach_note,quoted_cents,status,coupon_status,coupon_code,coupon_discount_cents FROM custom_plan_requests WHERE id=? AND student_id=?').bind(id,userId).first<Approved>();
 if(!row||row.status!=='approved'||!row.quoted_cents)throw new Error('Esta solicitud aún no está aprobada para el pago.');
 const code=typeof rawCode==='string'?rawCode.trim().toUpperCase():'';
 if(code&&(row.coupon_status!=='granted'||code!==row.coupon_code))throw new Error('El cupón no corresponde a esta solicitud.');
 const discountCents=code?row.coupon_discount_cents:0;
 if(row.quoted_cents-discountCents<50)throw new Error('El cupón no se puede aplicar a este importe.');
 const settings=await getSettings();const days=JSON.parse(row.days) as string[];
 const terms=`Plan a medida aprobado · ${days.join(', ')} · ${row.duration_minutes} minutos por sesión durante cuatro semanas. Horario solicitado: ${row.preferred_time}. Gimnasio: ${row.gym}. Precio aprobado: US$${(row.quoted_cents/100).toFixed(2)} por cuatro semanas.${code?` Cupón ${code}: descuento de US$${(discountCents/100).toFixed(2)}. Total: US$${((row.quoted_cents-discountCents)/100).toFixed(2)}.`:''} Respuesta del coach: ${row.coach_note}. Estas condiciones particulares prevalecen sobre las referencias generales a sesiones y tarifas de otros planes.\n\n${settings.terms}`;
 return {row,code,discountCents,totalCents:row.quoted_cents-discountCents,terms,enabled:settings.checkoutEnabled&&stripeStatus().ready};
}
export async function GET(request:Request){const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión.'},{status:401});const params=new URL(request.url).searchParams,id=params.get('id');if(!id||!isId(id))return Response.json({error:'Solicitud inválida.'},{status:400});try{
 const q=await quote(id,user.userId,params.get('code'));return Response.json({amountCents:q.row.quoted_cents,discountCents:q.discountCents,totalCents:q.totalCents,code:q.code,couponStatus:q.row.coupon_status,couponCode:q.row.coupon_status==='granted'?q.row.coupon_code:null,terms:q.terms,enabled:q.enabled,mode:stripeMode()},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'No se pudo cargar el resumen.'},{status:409})}}
function isId(value:unknown):value is string{return typeof value==='string'&&/^[a-f0-9-]{36}$/.test(value)}
export async function POST(request:Request){const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión.'},{status:401});const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Solicitud inválida.'},{status:403});
 let body:Record<string,unknown>;try{body=await request.json() as Record<string,unknown>}catch{return Response.json({error:'Solicitud inválida.'},{status:400})}if(!isId(body.id))return Response.json({error:'Solicitud inválida.'},{status:400});
 let q;try{q=await quote(body.id,user.userId,body.code)}catch(e){return Response.json({error:e instanceof Error?e.message:'Solicitud no aprobada.'},{status:409})}
 const key=stripeKey();if(!q.enabled||!key)return Response.json({error:'El pago en línea aún no está habilitado. Coordina el siguiente paso con Herlin.'},{status:409});
 if(body.accepted!==true||body.expectedTotal!==q.totalCents||body.terms!==q.terms)return Response.json({error:'El precio o las condiciones cambiaron. Actualiza el resumen antes de pagar.'},{status:409});
 const id=crypto.randomUUID(),now=new Date().toISOString(),mode=stripeMode();
 try{const result=await database().prepare(`INSERT INTO checkout_orders (id,student_id,plan,mode,status,amount_cents,base_cents,discount_code,launch,terms,created_at,custom_request_id)
 SELECT ?,?,'a-medida',?,'pending',?,?,?,0,?,?,? WHERE NOT EXISTS (SELECT 1 FROM checkout_orders WHERE custom_request_id=? AND status IN ('pending','paid')) AND EXISTS (SELECT 1 FROM custom_plan_requests WHERE id=? AND student_id=? AND status='approved' AND quoted_cents=? AND coupon_status=? AND COALESCE(coupon_code,'')=? AND coupon_discount_cents=?)`).bind(id,user.userId,mode,q.totalCents,q.row.quoted_cents,q.code,q.terms,now,q.row.id,q.row.id,q.row.id,user.userId,q.row.quoted_cents,q.row.coupon_status,q.row.coupon_code||'',q.row.coupon_discount_cents).run();
 if(!result.meta.changes)return Response.json({error:'Ya existe un pago abierto o confirmado para esta solicitud. No se creó otro cobro.'},{status:409});
 }catch{return Response.json({error:'No se pudo reservar tu pedido. Inténtalo de nuevo.'},{status:503})}
 const form=new URLSearchParams({mode:'payment',locale:'es','payment_method_types[0]':'card','line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':String(q.totalCents),'line_items[0][price_data][product_data][name]':`Plan HGrand a medida · primeras cuatro semanas${q.code?' · cupón '+q.code:''}`,'line_items[0][quantity]':'1',customer_email:user.email,client_reference_id:user.userId,'metadata[plan]':'a-medida','metadata[order_id]':id,'metadata[custom_request_id]':q.row.id,'metadata[user_id]':user.userId,expires_at:String(Math.floor(Date.now()/1000)+1860),success_url:`${new URL(request.url).origin}/checkout/resultado?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${new URL(request.url).origin}/planes/a-medida`});
 try{const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':id},body:form.toString()});const data=await response.json() as {id?:string;url?:string};
 if(!response.ok){if(response.status<500)await database().prepare("UPDATE checkout_orders SET status='failed' WHERE id=? AND status='pending'").bind(id).run();return Response.json({error:'No se pudo preparar el pago. Inténtalo de nuevo.'},{status:502})}
 if(!data.id||!data.url?.startsWith('https://checkout.stripe.com/'))throw new Error('Respuesta de pago inválida');await database().prepare('UPDATE checkout_orders SET session_id=? WHERE id=?').bind(data.id,id).run();return Response.json({url:data.url},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'No pudimos confirmar la conexión con Stripe. Revisa tu solicitud antes de reintentar.'},{status:502})}
}
