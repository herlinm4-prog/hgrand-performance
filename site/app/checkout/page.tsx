import type {Metadata} from "next";
export const metadata:Metadata={title:{absolute:"Revisa tu plan HGrand | HGrand Fitness & Performance"},robots:{index:false,follow:false},alternates:{canonical:"/checkout"},openGraph:{url:"/checkout",title:"Revisa tu plan HGrand",description:"Continúa tu proceso con HGrand Fitness & Performance.",images:["/og-home.jpg"]},twitter:{card:"summary_large_image",title:"Revisa tu plan HGrand",images:["/og-home.jpg"]}};
import {Header,Footer} from '@/app/site-shell';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import PlanPrice from '@/app/plan-price';
import {plans,planKey,whatsapp,type PlanKey} from '@/lib/plans';
import {redirect} from 'next/navigation';
import CheckoutButton from './checkout-button';
import {quotePlan} from '@/lib/checkout';
import {getCatalog} from '@/lib/cms';
import {getLaunchAvailability} from '@/lib/launch';

export const dynamic='force-dynamic';

async function CheckoutContent({selected,sessionsPerWeek}:{selected:PlanKey;sessionsPerWeek:number}){
 const user=await getChatGPTUser();
 const plan=(await getCatalog())[selected];const availability=await getLaunchAvailability(selected);
 let quote=null;try{const {p,discount,...safe}=await quotePlan(selected,'',selected==='presencial'?sessionsPerWeek:undefined);quote=safe}catch{}
 const message=`Hola, Herlin. Quiero confirmar la disponibilidad y las condiciones para contratar el plan ${plan.name}.`;
 return <>
  <div className="eyebrow">Checkout · {plan.shortName}</div>
  <h1>Revisa tu plan</h1>
  <p className="lead">Comprueba el precio y la disponibilidad antes de comenzar.</p>
  <div className="detail-grid">
   <section><h2>{plan.name}</h2><p>{plan.intro}</p><ul className="detail-list">{plan.includes.map((item,i)=><li key={item}><span>{String(i+1).padStart(2,'0')}</span>{item}</li>)}</ul><p className="detail-note">{plan.note}</p></section>
   <aside className="offer-card">
    <div className="top"><span>Resumen del pedido</span><span>{plan.shortName}</span></div>
    {selected==='presencial'?<><p className="checkout-selection-intro">Tarifa habitual: US$50 por sesión. Elige entre 1 y 5 días por semana; el pago cubre cuatro semanas. El precio de lanzamiento, si está disponible, se aplica al entrenamiento.</p><form className="checkout-sessions" action="/checkout" method="get"><input type="hidden" name="plan" value="presencial"/><label htmlFor="sessions">Sesiones presenciales por semana</label><select id="sessions" name="sessions" defaultValue={sessionsPerWeek}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} {n===1?'día':'días'} por semana · {n*4} sesiones al mes</option>)}</select><button className="btn-line" type="submit">Actualizar selección</button></form><p className="subnote">Nutrición y suplementación: US$60 por semana con 1 día (US$240 por cuatro semanas), US$30 con 2 días (US$120 por cuatro semanas) e incluida desde 3 días. El total aumenta al añadir días.</p></>:<><PlanPrice plan={plan} availability={availability}/><p>{plan.sessions}</p></>}
    <p className="subnote">La promoción está sujeta a la disponibilidad indicada en el resumen de pago. Confirma el precio, calendario y condiciones antes de contratar.</p>
    {!user&&<a className="btn-dark" href={`/acceso?plan=${selected}${selected==='presencial'?'&sessions='+sessionsPerWeek:''}`}>Iniciar sesión o crear cuenta ↗</a>}
    <a className="btn-line" href={whatsapp+'?text='+encodeURIComponent(message)} target="_blank" rel="noreferrer">Confirmar disponibilidad ↗</a>
    {quote?<CheckoutButton plan={selected} initial={quote} signedIn={!!user}/>:<p className="checkout-pending">No podemos cargar el resumen del pago en este momento.</p>}
    <a className="plan-more" href="/legal/condiciones">Ver condiciones</a>
   </aside>
  </div>
 </>;
}

export default async function Checkout({searchParams}:{searchParams:Promise<{plan?:string;sessions?:string}>}){
 const query=await searchParams;const selected=planKey(query.plan);if(!selected)redirect('/#plan');
 const sessionsPerWeek=selected==='presencial'&&/^[1-5]$/.test(query.sessions||'')?Number(query.sessions):3;
 return <><Header/><main className="section wrap plan-detail"><a className="back-link" href={'/planes/'+selected}>← Volver al plan</a><CheckoutContent selected={selected} sessionsPerWeek={sessionsPerWeek}/></main><Footer/></>;
}
