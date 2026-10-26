'use client';

import {useEffect,useRef,useState} from 'react';
import type {Showcase} from '@/lib/cms-types';

export default function ResultsGallery({publications}:{publications:Showcase[]}){
 const showAdrian=!publications.some(p=>p.name.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'')==='adrian');
 const count=publications.length+(showAdrian?1:0);
 const track=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(0);
 const [paused,setPaused]=useState(false);
 const [visible,setVisible]=useState(false);
 const [reducedMotion,setReducedMotion]=useState(false);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>setReducedMotion(media.matches);
  update();media.addEventListener('change',update);
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.35});
  if(track.current)observer.observe(track.current);
  return ()=>{observer.disconnect();media.removeEventListener('change',update)};
 },[]);
 useEffect(()=>{
  if(count<2||paused||!visible||reducedMotion)return;
  const timer=window.setInterval(()=>goTo((active+1)%count),6500);
  return ()=>window.clearInterval(timer);
 },[active,paused,visible,reducedMotion,count]);
 function goTo(index:number){const el=track.current?.children[index] as HTMLElement|undefined;if(!el)return;el.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'nearest',inline:'start'});setActive(index)}
 function onScroll(){const container=track.current;if(!container)return;const slides=Array.from(container.children) as HTMLElement[];let nearest=0,distance=Infinity;slides.forEach((el,i)=>{const d=Math.abs(el.offsetLeft-container.offsetLeft-container.scrollLeft);if(d<distance){distance=d;nearest=i}});setActive(nearest)}
 return <div className="results-gallery" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setPaused(false)}}>
  <div className="public-results" ref={track} onScroll={onScroll} aria-label="Resultados y testimonios de alumnos">
   {showAdrian&&<article><div className="result-pair"><figure><img src="/assets/adrian-antes-original.jpeg" alt="Adrián antes de su transformación" loading="lazy"/><figcaption>Antes</figcaption></figure><figure><img src="/assets/adrian-despues-original.jpeg" alt="Adrián después de su transformación" loading="lazy"/><figcaption>Después</figcaption></figure></div><strong>Adrián</strong></article>}
   {publications.map(p=><article key={p.id}>{p.has_image===1&&(p.has_before?<div className="result-pair"><figure><img src={'/api/publicaciones/'+p.id+'?view=before'} alt={'Antes de '+p.name} loading="lazy"/><figcaption>Antes</figcaption></figure><figure><img src={'/api/publicaciones/'+p.id+'?view=after'} alt={'Después de '+p.name} loading="lazy"/><figcaption>Después</figcaption></figure></div>:<div className="result-image"><img src={'/api/publicaciones/'+p.id} alt={p.caption||'Progreso de '+p.name} loading="lazy"/></div>)}{p.quote&&<blockquote>“{p.quote}”</blockquote>}<strong>{p.name}</strong>{p.caption&&<p>{p.caption}</p>}</article>)}
  </div>
  {count>1&&<div className="results-controls"><button type="button" onClick={()=>goTo((active-1+count)%count)} aria-label="Ver resultado anterior">←</button><span aria-live="polite">{active+1} / {count}</span><button type="button" onClick={()=>goTo((active+1)%count)} aria-label="Ver siguiente resultado">→</button></div>}
 </div>
}
