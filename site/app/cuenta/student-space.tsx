'use client';
import {useCallback,useEffect,useState,useRef,type FormEvent} from 'react';
import type {StoredFile} from '@/lib/student-space';
import {Input} from '@/components/ui/input';
import Checkins from './checkins';
import ChatWidget from '@/app/chat/chat-widget';

type Student={user_id:string;name:string};
const fileUrl=(id:string)=>'/api/archivos/'+id;
const dateLabel=(date:string)=>new Date(date).toLocaleDateString('es-US',{day:'numeric',month:'short',year:'numeric'});
const planType=(kind:string)=>({nutrition:'Nutrición',training:'Entrenamiento',supplementation:'Suplementación'}[kind]||'Documento');

export default function StudentSpace({coach,userId}:{coach:boolean;userId:string}){
 const loadSequence=useRef(0);
 const [students,setStudents]=useState<Student[]>([]),[target,setTarget]=useState('');
 const [files,setFiles]=useState<StoredFile[]>([]),[compareFirst,setCompareFirst]=useState(''),[compareSecond,setCompareSecond]=useState('');
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const load=useCallback(async(student:string)=>{
  const sequence=++loadSequence.current;setLoading(true);setError('');
  try{const response=await fetch('/api/espacio'+(student?'?student='+encodeURIComponent(student):coach?'?view=admin':''),{cache:'no-store'});
   if(!response.ok)throw new Error('No pudimos cargar tu espacio. Inténtalo de nuevo.');
   const data=await response.json() as {students?:Student[];files?:StoredFile[]};
   if(data.students)setStudents(data.students);if(sequence===loadSequence.current)setFiles(data.files||[]);
  }catch(e){if(sequence===loadSequence.current)setError(e instanceof Error?e.message:'No pudimos cargar tu espacio.')}finally{if(sequence===loadSequence.current)setLoading(false)}
 },[coach]);
 useEffect(()=>{void load(target)},[target,load]);
 useEffect(()=>{if(coach){void load('');const id=new URLSearchParams(window.location.search).get('student');if(id)setTarget(id)}},[coach,load]);
 useEffect(()=>{setCompareFirst('');setCompareSecond('')},[target]);
 async function upload(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;
  setBusy(true);setError('');setNotice('');const form=event.currentTarget;const data=new FormData(form);if(coach)data.set('student',target);
  try{const response=await fetch('/api/archivos',{method:'POST',body:data});const result=await response.json() as {error?:string};if(!response.ok)throw new Error(result.error||'No se pudo subir el archivo.');form.reset();setNotice('Archivo guardado en el espacio privado.');await load(target)}catch(e){setError(e instanceof Error?e.message:'No se pudo subir el archivo.')}finally{setBusy(false)}
 }
 const active=!coach||!!target;const photos=files.filter(file=>file.kind==='photo');const plans=files.filter(file=>file.kind!=='photo');
 const first=photos.find(p=>p.id===compareFirst),second=photos.find(p=>p.id===compareSecond),latestPlan=plans[0];
 return <section id="seguimiento" className="student-space" aria-label="Espacio del alumno"><div className="space-title"><div><div className="eyebrow">Seguimiento personal</div><h2>{coach?'Expediente del alumno':'Tu espacio de trabajo'}</h2></div><button className="space-refresh" type="button" onClick={()=>void load(target)} disabled={loading}>Actualizar</button></div>
 {coach&&<div className="space-picker"><label htmlFor="space-student">Alumno</label><select id="space-student" value={target} onChange={e=>setTarget(e.target.value)}><option value="">Selecciona un alumno</option>{students.map(s=><option key={s.user_id} value={s.user_id}>{s.name}</option>)}</select></div>}
 {error&&<p className="form-error" role="alert">{error}</p>}{notice&&<p className="saved-state" role="status">{notice}</p>}
 {loading?<p className="space-empty">Cargando tu espacio…</p>:!active?<p className="space-empty">Selecciona un alumno para revisar sus fotos y planes.</p>:<>
 <div className="space-summary" aria-label="Resumen del seguimiento"><div><strong>{photos.length}</strong><span>Fotos de progreso</span></div><div><strong>{plans.length}</strong><span>Documentos publicados</span></div><div><strong>{latestPlan?dateLabel(latestPlan.created_at):'Pendiente'}</strong><span>Último plan</span></div></div>
 <Checkins key={target||userId} coach={coach} student={target||userId}/>
 <div className="space-grid">
 <section id="fotos" className="space-card"><span className="eyebrow">01 / Progreso</span><h3>Fotos</h3><p>Guarda una vista frontal, de perfil o de espalda por cada revisión. Solo tú y Herlin podéis ver estos archivos.</p><form onSubmit={upload} className="space-form"><input type="hidden" name="kind" value="photo"/><label htmlFor="progress-view">Vista de la foto</label><select id="progress-view" name="view" defaultValue="Frente"><option>Frente</option><option>Perfil</option><option>Espalda</option><option>Otra</option></select><label htmlFor="progress-photo">Subir foto de progreso</label><Input id="progress-photo" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" required/><Input name="label" aria-label="Nota opcional de la foto" placeholder="Nota o semana (opcional)" maxLength={75}/><button className="btn-dark" disabled={busy}>{busy?'Subiendo…':'Guardar foto'}</button><small>Hasta 10 MB. Usa una iluminación y una postura parecidas para comparar avances.</small></form>
 {photos.length>=2&&<div className="space-compare"><h4>Comparar dos fotos</h4><div className="space-compare-selects"><label>Primera foto<select value={compareFirst} onChange={e=>setCompareFirst(e.target.value)}><option value="">Seleccionar</option>{photos.map(f=><option key={f.id} value={f.id}>{f.label} · {dateLabel(f.created_at)}</option>)}</select></label><label>Segunda foto<select value={compareSecond} onChange={e=>setCompareSecond(e.target.value)}><option value="">Seleccionar</option>{photos.map(f=><option key={f.id} value={f.id}>{f.label} · {dateLabel(f.created_at)}</option>)}</select></label></div>{first&&second&&(first.id===second.id?<p className="space-empty">Elige dos fotos distintas para ver el cambio.</p>:<div className="space-compare-pair">{[first,second].map(f=><figure key={f.id}><a href={fileUrl(f.id)} target="_blank" rel="noreferrer"><img src={fileUrl(f.id)} alt={f.label}/></a><figcaption>{f.label}<small>{dateLabel(f.created_at)}</small></figcaption></figure>)}</div>)}</div>}
 <div className="space-photos">{photos.length?photos.map(f=><a key={f.id} href={fileUrl(f.id)} target="_blank" rel="noreferrer"><img src={fileUrl(f.id)} alt={f.label} loading="lazy"/><span>{f.label}<small>{dateLabel(f.created_at)} · Abrir foto</small></span></a>):<p className="space-empty">Todavía no hay fotos. Sube tu primera vista para empezar el seguimiento.</p>}</div></section>
 <section id="documentos" className="space-card"><span className="eyebrow">02 / Planes</span><h3>Documentos PDF</h3><p>Consulta las versiones que Herlin publica para ti: entrenamiento, nutrición y suplementación.</p>{coach&&<form onSubmit={upload} className="space-form"><label htmlFor="plan-kind">Publicar un documento</label><select id="plan-kind" name="kind"><option value="nutrition">Plan nutricional</option><option value="training">Plan de entrenamiento</option><option value="supplementation">Guía de suplementación</option></select><Input name="label" aria-label="Nombre del plan" placeholder="Nombre o semana (opcional)" maxLength={75}/><Input name="file" aria-label="Archivo PDF" type="file" accept="application/pdf" required/><button className="btn-dark" disabled={busy}>{busy?'Publicando…':'Publicar PDF'}</button><small>Solo el alumno seleccionado tendrá acceso. Máximo 20 MB.</small></form>}<div className="space-list">{plans.length?plans.map(f=><a key={f.id} href={fileUrl(f.id)} download><span><strong>{f.label}</strong><small>{planType(f.kind)} · {dateLabel(f.created_at)}</small></span><b>Descargar ↓</b></a>):<p className="space-empty">Herlin todavía no ha publicado un documento. Puedes escribirle desde el chat.</p>}</div></section>
 </div></>}{!coach&&<ChatWidget userId={userId}/>}</section>;
}
