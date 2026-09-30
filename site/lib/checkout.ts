import {database} from './student-space';
import {getSettings,catalog} from './cms';
import {stripeMode,stripeStatus} from './stripe-config';
import type {PlanKey} from './plans';
import type {Discount} from './cms-types';
import {weeklySupportCents} from './support-pricing';
export async function quotePlan(plan:PlanKey,rawCode:unknown,rawSessions?:unknown){
 const s=await getSettings(),p=catalog(s)[plan],mode=stripeMode(),code=typeof rawCode==='string'?rawCode.trim().toUpperCase():'';
 const sessionsPerWeek=plan==='presencial'?(rawSessions===undefined?3:rawSessions):null;
 if(plan==='presencial'&&(!Number.isInteger(sessionsPerWeek)||Number(sessionsPerWeek)<1||Number(sessionsPerWeek)>5))throw new Error('Elige entre 1 y 5 sesiones por semana.');
 const weeklySessions=plan==='presencial'?Number(sessionsPerWeek):null;
 if(code&&!/^[A-Z0-9_-]{3,32}$/.test(code))throw new Error('Revisa el código de descuento.');
 const count=await database().prepare("SELECT COUNT(*) AS n FROM checkout_orders WHERE plan=? AND mode=? AND launch=1 AND status IN ('pending','paid')").bind(plan,mode).first<{n:number}>();
 // Owner-issued codes use the regular first-block price; launch pricing and codes do not stack.
 const launch=!code&&p.launchEnabled&&(count?.n||0)<5;
 const sessionCount=weeklySessions?weeklySessions*4:0;
 const trainingCents=plan==='presencial'?Math.round((launch?p.launch:p.price)*100*sessionCount/12):0;
 const supportCents=weeklySessions!==null?weeklySupportCents(weeklySessions)*4:0;
 const baseCents=plan==='presencial'?trainingCents+supportCents:Math.round((launch?p.launch:p.price)*100);
 let discount:Discount|null=null,discountCents=0;
 if(code){discount=await database().prepare('SELECT * FROM discount_codes WHERE code=?').bind(code).first<Discount>();const now=new Date().toISOString();
 if(!discount||!discount.active||discount.starts_at>now||discount.expires_at<=now||(discount.plan!=='all'&&discount.plan!==plan))throw new Error('El código no está disponible para este plan.');
 const used=await database().prepare("SELECT COUNT(*) AS n FROM checkout_orders WHERE discount_code=? AND mode=? AND status IN ('pending','paid')").bind(code,mode).first<{n:number}>();
 if((used?.n||0)>=discount.max_uses)throw new Error('El código ha alcanzado su límite de usos.');
 discountCents=discount.kind==='percent'?Math.round(baseCents*discount.value/100):discount.value;
 if(baseCents-discountCents<50)throw new Error('Este código no se puede aplicar al importe de este plan.');
 }
 const selection=plan==='presencial'?`Selección específica de este pedido: ${weeklySessions} ${weeklySessions===1?'sesión':'sesiones'} por semana, ${sessionCount} sesiones de una hora durante cuatro semanas. Entrenamiento: US$${(trainingCents/100).toFixed(2)}. ${supportCents?`Acompañamiento de nutrición y suplementación: US$${(supportCents/400).toFixed(2)} por semana, US$${(supportCents/100).toFixed(2)} por cuatro semanas.`:'El acompañamiento de nutrición y suplementación está incluido.'} Esta selección y su importe prevalecen sobre cualquier referencia general a 12 sesiones en las condiciones.`:'';
 return {plan,code,launch,baseCents,trainingCents,supportCents,sessionsPerWeek:weeklySessions,sessionCount,discountCents,totalCents:baseCents-discountCents,mode,terms:selection?`${selection}\n\n${s.terms}`:s.terms,renewal:p.renewal,enabled:s.checkoutEnabled&&stripeStatus().ready&&(plan!=='presencial'||s.presencialAvailable),discount,p};
}
export type CheckoutOrder={id:string;student_id:string;plan:PlanKey|'a-medida';mode:'test'|'live';status:string;amount_cents:number;base_cents:number;discount_code:string;launch:number;session_id:string|null;terms:string;created_at:string;paid_at:string|null;custom_request_id:string|null;offer_id:string|null};
