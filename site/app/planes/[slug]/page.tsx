import PlanPrice from '@/app/plan-price';
import Results from '@/app/results';
import {publishedShowcase} from '@/lib/cms';
import {getLaunchAvailability} from '@/lib/launch';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {Header,Footer} from '@/app/site-shell';
import {getCatalog} from '@/lib/cms';
import {planKey} from '@/lib/plans';
import JsonLd from '@/app/json-ld';
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;if(slug!=="online"&&slug!=="presencial")return {};
 const online=slug==="online",path=`/planes/${slug}`;
 const title=online?"Entrenamiento online personalizado | HGrand Fitness & Performance":"Entrenamiento presencial en Miami | HGrand Fitness & Performance";
 const description=online?"Entrenador personal online y coach de fitness y nutrición: un plan adaptado a ti, con seguimiento semanal de Herlin Miranda.":"Preparación física Miami con Herlin Miranda. Entrenamiento presencial personalizado, nutrición y seguimiento para avanzar según tu objetivo.";
 const image=online?"/og-online.jpg":"/og-presencial.jpg";
 return {title:{absolute:title},description,alternates:{canonical:path},openGraph:{type:"website",locale:"es_US",url:path,title,description,images:[{url:image,width:1200,height:630,alt:title}]},twitter:{card:"summary_large_image",title,description,images:[image]}};
}
export default async function PlanPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const key=planKey(slug);if(!key)notFound();const [catalog,publications,availability]=await Promise.all([getCatalog(),publishedShowcase(),getLaunchAvailability(key)]);const p=catalog[key];
 const schema={"@context":"https://schema.org","@type":"Service",name:p.name,description:p.intro,serviceType:key==='online'?'Entrenamiento personal online':'Preparación física presencial',provider:{"@id":"https://www.hgrandperformance.com/#business"},areaServed:key==='online'?"United States":{ "@type":"City",name:"Miami"},url:`https://www.hgrandperformance.com/planes/${key}`,offers:{"@type":"Offer",price:String(p.price),priceCurrency:"USD",description:"Primer bloque de cuatro semanas; consulta condiciones y disponibilidad."}};return <><JsonLd data={schema}/><Header/><main><section className="section wrap plan-detail"><a className="back-link" href="/#plan">← Todos los planes</a><div className="detail-grid"><div><div className="eyebrow">{p.tag}</div><h1>{key==='online'?'Entrenamiento online personalizado':'Entrenamiento presencial en Miami'}</h1><p className="lead">{p.intro}</p><h2 className="small-title">Pensado para ti</h2><p>{p.forWho}</p><h2 className="small-title">Qué incluye tu acompañamiento</h2><ul className="detail-list">{p.includes.map((x,i)=><li key={x}><span>{String(i+1).padStart(2,'0')}</span>{x}</li>)}</ul><p className="detail-note">{p.note}</p></div><aside className="offer-card"><div className="top"><span>Tu plan</span><span>{p.shortName}</span></div><PlanPrice plan={p} availability={availability}/><a className="btn-accent" data-track="checkout_click" href={`/checkout?plan=${p.slug}`}>Ver checkout del plan <span className="arrow" aria-hidden="true">↗</span></a><p className="subnote">Revisa el resumen del plan. Iniciarás sesión antes de cualquier pago.</p><a className="plan-more" href="/#consulta">Prefiero una consulta gratuita</a></aside></div></section><Results publications={publications}/></main><Footer/></>
}
