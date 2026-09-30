'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {Bell,ArrowUpRight,CalendarDays,ChevronLeft,ChevronRight,Command as CommandIcon,House,Images,Maximize2,MessageCircle,Minimize2,Moon,PanelLeft,Search,Settings2,Sun,Users,Wallet,FileCheck,RefreshCw,Plus,LayoutGrid,ExternalLink} from 'lucide-react';
import {Command,CommandEmpty,CommandGroup,CommandInput,CommandItem,CommandList} from '@/components/ui/command';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import Alerts from './alerts';
import Consultations from './consultations';
import Proposals from './proposals';
import Enrollments from './enrollments';
import CustomRequests from './custom-requests';
import AdminInbox from './admin-inbox';
import StudentSpace from '@/app/cuenta/student-space';
import ContentManager from './contenido/content-manager';

const apps=[
 {id:'alertas',name:'Alertas',detail:'Acciones prioritarias y seguimiento',icon:Bell,color:'red',group:'Tu espacio'},
 {id:'inicio',name:'Escritorio',detail:'Tu día, de un vistazo',icon:House,color:'blue',group:'Tu espacio'},
 {id:'mensajes',name:'Mensajes',detail:'Conversaciones con tus alumnos',icon:MessageCircle,color:'green',group:'Tu espacio'},
 {id:'consultas',name:'Agenda',detail:'Consultas y horarios · Miami',icon:CalendarDays,color:'red',group:'Tu espacio'},
 {id:'altas',name:'Alumnos',detail:'Registro y seguimiento de alumnos',icon:Users,color:'purple',group:'Tu espacio'},
 {id:'seguimiento',name:'Fotos y planes',detail:'Expedientes, progreso y documentos',icon:Images,color:'orange',group:'Tu espacio'},
 {id:'propuestas',name:'Cobros',detail:'Propuestas y pagos por bloque',icon:Wallet,color:'blue',group:'Tu negocio'},
 {id:'solicitudes',name:'Solicitudes',detail:'Planes a medida por revisar',icon:FileCheck,color:'purple',group:'Tu negocio'},
 {id:'contenido',name:'Contenido y ventas',detail:'Textos, precios, testimonios y configuración',icon:Settings2,color:'gray',group:'Tu negocio'},
] as const;
type View=typeof apps[number]['id'];
const isView=(value:string):value is View=>apps.some(app=>app.id===value);
type Overview={messages:number|null;requests:number|null;due:number|null;slots:{id:string;start_local:string;status:string;name:string|null}[]|null;stripe:string|null};
const emptyOverview:Overview={messages:null,requests:null,due:null,slots:null,stripe:null};

async function readOverview(signal?:AbortSignal){
 const read=async<T,>(url:string):Promise<T>=>{const response=await fetch(url,{cache:'no-store',signal});if(!response.ok)throw new Error('No disponible');return response.json() as Promise<T>};
 const results=await Promise.allSettled([read<{conversations:{awaiting_reply:boolean}[]}>('/api/admin/conversaciones'),read<{pendingRequests:number;stripe:{ready:boolean;mode:string}}>('/api/admin/cms'),read<{due:unknown[]}>('/api/admin/propuestas'),read<{slots:NonNullable<Overview['slots']>}>('/api/admin/consultas')]);
 const [messages,cms,proposals,calendar]=results;
 const summary:Overview={messages:messages.status==='fulfilled'?messages.value.conversations.filter(c=>c.awaiting_reply).length:null,requests:cms.status==='fulfilled'?cms.value.pendingRequests:null,due:proposals.status==='fulfilled'?proposals.value.due.length:null,slots:calendar.status==='fulfilled'?calendar.value.slots.filter(s=>s.status!=='cancelled'):null,stripe:cms.status==='fulfilled'?(cms.value.stripe.ready?(cms.value.stripe.mode==='test'?'Modo de prueba':'Modo real'):'Pendiente de configurar'):null};
 return {summary,error:results.some(r=>r.status==='rejected')?'Algunos datos no se pudieron cargar. Puedes reintentar o abrir la sección.':''};
}
function OverviewPanel({open}:{open:(view:View)=>void}){
 const [summary,setSummary]=useState<Overview>(emptyOverview),[loading,setLoading]=useState(true),[error,setError]=useState(''),[updated,setUpdated]=useState('');
 const apply=useCallback((result:Awaited<ReturnType<typeof readOverview>>)=>{setSummary(result.summary);setError(result.error);setUpdated(new Date().toLocaleTimeString('es-US',{hour:'2-digit',minute:'2-digit'}));setLoading(false)},[]);
 const fail=useCallback(()=>{setError('No se pudo cargar el resumen. Vuelve a intentarlo.');setLoading(false)},[]);
 function load(){void readOverview().then(apply).catch(fail)}
 useEffect(()=>{const controller=new AbortController();void readOverview(controller.signal).then(result=>{if(!controller.signal.aborted)apply(result)}).catch(()=>{if(!controller.signal.aborted)fail()});return()=>controller.abort()},[apply,fail]);
 return <div className="desktop-overview">
  <div className="overview-heading"><div><span className="desktop-kicker">HGRAND / WORKSPACE</span><h1>Todo en su lugar.</h1><p>Tus alumnos, tu agenda y el siguiente paso.</p></div><button className="desktop-icon-button" onClick={()=>{setLoading(true);void load()}} disabled={loading} aria-label="Actualizar resumen"><RefreshCw size={18} className={loading?'desktop-spinning':''}/></button></div>
  {error&&<p className="desktop-error" role="alert">{error}</p>}
  <Alerts compact/>
  <div className="desktop-stats" aria-busy={loading}>
   {[{label:'Mensajes por responder',value:summary.messages,view:'mensajes' as View,icon:MessageCircle,color:'green'},{label:'Solicitudes pendientes',value:summary.requests,view:'solicitudes' as View,icon:FileCheck,color:'purple'},{label:'Vencimientos · 7 días',value:summary.due,view:'propuestas' as View,icon:Wallet,color:'blue'}].map(item=><button key={item.view} onClick={()=>open(item.view)} className="desktop-stat"><span className={'app-symbol '+item.color}><item.icon size={20}/></span><ArrowUpRight size={16} className="stat-arrow"/><strong>{loading?'—':item.value??'—'}</strong><span>{item.label}</span></button>)}
  </div>
  <div className="desktop-home-grid"><section className="desktop-home-card"><div className="desktop-card-heading"><div><span className="desktop-kicker">PRÓXIMAMENTE</span><h2>Tu agenda</h2></div><button onClick={()=>open('consultas')} className="desktop-text-button">Abrir agenda <ArrowUpRight size={15}/></button></div>
   {loading?<p className="desktop-muted">Cargando horarios…</p>:summary.slots===null?<p className="desktop-muted">La agenda no está disponible.</p>:summary.slots.length?summary.slots.slice(0,4).map(slot=><button key={slot.id} className="desktop-agenda-row" onClick={()=>open('consultas')}><span className="desktop-date-tile">{slot.start_local.slice(8,10)}<small>{slot.start_local.slice(5,7)}</small></span><span><strong>{slot.name||'Consulta gratuita'}</strong><small>{slot.start_local.slice(11,16)} · Miami</small></span><span className="desktop-chip">{slot.status==='available'?'Disponible':slot.status==='confirmed'?'Confirmada':'Por confirmar'}</span></button>):<div className="desktop-empty"><CalendarDays size={36} strokeWidth={1.3}/><h3>Haz espacio para un nuevo comienzo.</h3><p>Publica tu primer horario para recibir consultas.</p><button className="desktop-primary" onClick={()=>open('consultas')}><Plus size={16}/> Añadir horario</button></div>}
  </section><section className="desktop-home-card"><div className="desktop-card-heading"><div><span className="desktop-kicker">A UN CLIC</span><h2>Acciones rápidas</h2></div><LayoutGrid size={19}/></div><div className="desktop-quick-actions">{[{id:'altas' as View,label:'Registrar alumno',caption:'Su proceso empieza aquí',icon:Users,color:'purple'},{id:'propuestas' as View,label:'Preparar un cobro',caption:'Importe y período a medida',icon:Wallet,color:'blue'},{id:'seguimiento' as View,label:'Revisar progreso',caption:'Fotos y planes en un lugar',icon:Images,color:'orange'}].map(action=><button key={action.id} onClick={()=>open(action.id)}><span className={'app-symbol '+action.color}><action.icon size={20}/></span><span><strong>{action.label}</strong><small>{action.caption}</small></span><ChevronRight size={17}/></button>)}</div><div className="desktop-service"><Wallet size={17}/><span>Stripe</span><strong>{loading?'Cargando…':summary.stripe??'No disponible'}</strong></div></section></div>
  <div className="desktop-overview-foot"><span>{updated?'Actualizado a las '+updated:'Conectando con tu espacio…'}</span><span>Los datos se actualizan al abrir este resumen.</span></div>
 </div>;
}

export default function AdminDesktop({userId,initialView='inicio'}:{userId:string;initialView?:View}){
 const [view,setView]=useState<View>(initialView),[opened,setOpened]=useState<View[]>([initialView]);
 const [searchOpen,setSearchOpen]=useState(false),[dark,setDark]=useState(false),[focus,setFocus]=useState(false),[sidebar,setSidebar]=useState(false),[clock,setClock]=useState('');
 const [trail,setTrail]=useState<View[]>([initialView]),[position,setPosition]=useState(0);
 const contentRef=useRef<HTMLDivElement>(null);
 const current=apps.find(app=>app.id===view)!;
 const activate=useCallback((next:View)=>{setView(next);setOpened(previous=>previous.includes(next)?previous:[...previous,next]);setSidebar(false);setSearchOpen(false)},[]);
 const open=useCallback((next:View)=>{
  if(next!==view){const nextTrail=[...trail.slice(0,position+1),next];setTrail(nextTrail);setPosition(nextTrail.length-1)}
  activate(next);window.history.replaceState(null,'','#'+next);
 },[view,trail,position,activate]);
 useEffect(()=>{
  const sync=()=>{const hash=window.location.hash.slice(1);if(isView(hash)){activate(hash);setTrail([hash]);setPosition(0)}};
  window.addEventListener('hashchange',sync);
  const tick=()=>setClock(new Date().toLocaleString('es-US',{timeZone:'America/New_York',weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}));const timer=setInterval(tick,30000);
  const frame=requestAnimationFrame(()=>{try{setDark(localStorage.getItem('hgrand-desktop-theme')==='dark')}catch{}sync();tick()});
  return()=>{window.removeEventListener('hashchange',sync);clearInterval(timer);cancelAnimationFrame(frame)};
 },[activate]);
 useEffect(()=>{const key=(event:KeyboardEvent)=>{
  if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();setSearchOpen(value=>!value)}
  if(event.key==='Escape'){setFocus(false);setSidebar(false)}
 };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[]);
 useEffect(()=>{contentRef.current?.scrollTo({top:0,behavior:'instant'})},[view]);
 function move(delta:number){const next=position+delta;if(next>=0&&next<trail.length){setPosition(next);activate(trail[next]);window.history.replaceState(null,'','#'+trail[next])}}
 function theme(){setDark(value=>{try{localStorage.setItem('hgrand-desktop-theme',value?'light':'dark')}catch{}return !value})}
 return <div className={'hgrand-desktop'+(dark?' desktop-dark':'')+(focus?' desktop-focus':'')}>
  <a className="desktop-skip" href="#desktop-content">Ir al espacio de trabajo</a>
  <header className="desktop-menubar"><div><span className="desktop-monogram">H</span><strong>HGrand</strong><span className="desktop-menu-label">Espacio de trabajo</span></div><div><button onClick={()=>setSearchOpen(true)} aria-label="Buscar sección"><Search size={17}/></button><button onClick={theme} aria-label={dark?'Usar apariencia clara':'Usar apariencia oscura'}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button><span className="desktop-clock">{clock} <span>Miami</span></span><span className="desktop-avatar" aria-label="Cuenta de Herlin">HM</span></div></header>
  <div className={'desktop-window'+(sidebar?' sidebar-open':'')}>
   {sidebar&&<button className="desktop-sidebar-backdrop" aria-label="Cerrar navegación" onClick={()=>setSidebar(false)}/>}
   <aside className="desktop-sidebar" aria-label="Aplicaciones HGrand"><div className="desktop-sidebar-brand"><span className="desktop-brand-mark">H</span><div><strong>HGrand</strong><small>Fitness & Performance</small></div></div>
    <button className="desktop-search" onClick={()=>setSearchOpen(true)}><Search size={17}/><span>Buscar sección</span><kbd>⌘ K</kbd></button>
    <nav>{['Tu espacio','Tu negocio'].map(group=><div className="desktop-nav-group" key={group}><p>{group}</p>{apps.filter(app=>app.group===group).map(app=><button key={app.id} onClick={()=>open(app.id)} aria-current={view===app.id?'page':undefined}><span className={'desktop-nav-icon '+app.color}><app.icon size={18}/></span>{app.name}</button>)}</div>)}</nav>
    <div className="desktop-sidebar-bottom"><a href="/" target="_blank" rel="noreferrer"><ExternalLink size={16}/> Ver sitio web <ArrowUpRight size={14}/></a><a href="/cuenta"><span className="desktop-avatar">HM</span><span><strong>Herlin Miranda</strong><small>Mi cuenta</small></span><ChevronRight size={16}/></a></div>
   </aside>
   <main className="desktop-main"><div className="desktop-toolbar"><div><button className="desktop-icon-button" onClick={()=>{setFocus(false);setSidebar(value=>!value)}} aria-label="Mostrar navegación"><PanelLeft size={19}/></button><div className="desktop-history"><button className="desktop-icon-button" onClick={()=>move(-1)} disabled={position===0} aria-label="Sección anterior"><ChevronLeft size={19}/></button><button className="desktop-icon-button" onClick={()=>move(1)} disabled={position===trail.length-1} aria-label="Sección siguiente"><ChevronRight size={19}/></button></div><span className="desktop-toolbar-title">{current.name}</span></div><div><button className="desktop-icon-button" onClick={()=>setSearchOpen(true)} aria-label="Buscar sección"><Search size={18}/></button><button className="desktop-icon-button" aria-label={focus?'Salir del modo enfoque':'Activar modo enfoque'} aria-pressed={focus} onClick={()=>setFocus(value=>!value)}>{focus?<Minimize2 size={18}/>:<Maximize2 size={18}/>}</button></div></div>
    <nav className="desktop-open-apps" aria-label="Secciones abiertas">{opened.map(id=>{const app=apps.find(a=>a.id===id)!;return <button key={id} aria-current={view===id?'page':undefined} onClick={()=>open(id)}><app.icon size={14}/>{app.name}</button>})}</nav>
    <div id="desktop-content" className="desktop-content" ref={contentRef} tabIndex={-1}>
     {view==='inicio'&&<OverviewPanel open={open}/>}
     {opened.filter(id=>id!=='inicio').map(id=><div key={id} hidden={view!==id} className="desktop-app-panel"><div className="desktop-app-heading"><span className="desktop-kicker">HGRAND / {apps.find(a=>a.id===id)!.group}</span><h1>{apps.find(a=>a.id===id)!.name}</h1><p>{apps.find(a=>a.id===id)!.detail}</p></div>{id==='alertas'?(view==='alertas'?<Alerts/>:null):id==='consultas'?<Consultations/>:id==='altas'?<Enrollments/>:id==='propuestas'?<Proposals/>:id==='solicitudes'?<CustomRequests/>:id==='mensajes'?<AdminInbox userId={userId}/>:id==='seguimiento'?<StudentSpace coach userId={userId}/>:<ContentManager/>}</div>)}
    </div>
   </main>
  </div>
  <nav className="desktop-dock" aria-label="Accesos rápidos">{apps.filter(app=>['alertas','inicio','mensajes','altas','propuestas'].includes(app.id)).map(app=><button key={app.id} onClick={()=>open(app.id)} aria-label={app.name} aria-current={view===app.id?'page':undefined}><span className="dock-tooltip">{app.name}</span><span className={'dock-symbol '+app.color}><app.icon size={25} strokeWidth={1.8}/></span><span className={'dock-indicator'+(opened.includes(app.id)?' is-open':'')}/></button>)}<span className="dock-separator"/><button onClick={()=>setSearchOpen(true)} aria-label="Buscar sección"><span className="dock-tooltip">Buscar</span><span className="dock-symbol gray"><Search size={25}/></span><span className="dock-indicator"/></button></nav>
  <Dialog open={searchOpen} onOpenChange={setSearchOpen}><DialogContent className={'desktop-command'+(dark?' desktop-command-dark':'')}><DialogTitle className="sr-only">Buscar en HGrand</DialogTitle><DialogDescription className="sr-only">Busca una sección o cambia la apariencia. Usa las flechas y Enter para seleccionar.</DialogDescription><Command><CommandInput placeholder="¿Dónde quieres ir?"/><CommandList><CommandEmpty>No encontramos esa sección.</CommandEmpty><CommandGroup heading="Aplicaciones">{apps.map(app=><CommandItem key={app.id} value={app.name+' '+app.detail} onSelect={()=>open(app.id)}><span className={'app-symbol '+app.color}><app.icon size={19}/></span><span><strong>{app.name}</strong><small>{app.detail}</small></span></CommandItem>)}</CommandGroup><CommandGroup heading="Tu espacio"><CommandItem onSelect={()=>{theme();setSearchOpen(false)}}><Moon size={18}/> Cambiar a apariencia {dark?'clara':'oscura'}</CommandItem><CommandItem onSelect={()=>{setFocus(value=>!value);setSearchOpen(false)}}><Maximize2 size={18}/>{focus?'Salir del':'Activar'} modo enfoque</CommandItem></CommandGroup></CommandList></Command><div className="desktop-command-hint"><CommandIcon size={13}/> K para buscar <span>↑ ↓ navegar · ↵ abrir · esc cerrar</span></div></DialogContent></Dialog>
 </div>;
}
