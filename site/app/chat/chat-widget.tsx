'use client';
import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import {MessageCircle,Send,X,RefreshCw} from 'lucide-react';
import {Textarea} from '@/components/ui/textarea';

type Message={id:string;sender_id:string;body:string;created_at:string};
type Payload={messages:Message[];nextBefore:string|null;error?:string};
export default function ChatWidget({userId,studentId,studentName,mode='floating',onSent}:{userId:string;studentId?:string;studentName?:string;mode?:'floating'|'panel';onSent?:()=>void}){
 const [open,setOpen]=useState(false),[messages,setMessages]=useState<Message[]>([]),[cursor,setCursor]=useState<string|null>(null);
 const [loading,setLoading]=useState(false),[olderBusy,setOlderBusy]=useState(false),[sending,setSending]=useState(false),[error,setError]=useState('');
 const container=useRef<HTMLDivElement>(null);
 const latestRequest=useRef(0),loadedOlder=useRef(false),bottom=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const visible=mode==='panel'||open;
 const endpoint=useCallback((before?:string)=>'/api/espacio'+(studentId||before?'?'+[studentId?'student='+encodeURIComponent(studentId):'',before?'before='+encodeURIComponent(before):''].filter(Boolean).join('&'):''),[studentId]);
 const refresh=useCallback(async()=>{
  const requestId=++latestRequest.current;setLoading(true);setError('');
  try{const response=await fetch(endpoint(),{cache:'no-store'});const data=await response.json() as Payload;
   if(!response.ok)throw new Error(data.error||'No pudimos cargar la conversación.');
   if(requestId===latestRequest.current){if(studentId&&document.visibilityState==='visible'&&container.current?.getClientRects().length&&data.messages.at(-1)?.sender_id===studentId)void fetch('/api/admin/alertas',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'message:'+studentId,version:data.messages.at(-1)?.id,action:'read'})}).catch(()=>{});if(loadedOlder.current){setMessages(existing=>[...existing,...data.messages.filter(m=>!existing.some(x=>x.id===m.id))])}else{setMessages(data.messages);setCursor(data.nextBefore)}}
  }catch(e){if(requestId===latestRequest.current)setError(e instanceof Error?e.message:'No pudimos conectar.')}finally{if(requestId===latestRequest.current)setLoading(false)}
 },[endpoint,studentId]);
 useEffect(()=>{if(!visible)return;loadedOlder.current=false;setMessages([]);setCursor(null);void refresh();const timer=setInterval(()=>{void refresh()},20000);return()=>{clearInterval(timer);latestRequest.current++}},[visible,refresh]);
 useEffect(()=>{if(visible&&messages.length&&!loadedOlder.current)bottom.current?.scrollIntoView({block:'end',behavior:'smooth'})},[visible,messages.length]);
 useEffect(()=>{if(!open||mode!=='floating')return;const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);trigger.current?.focus()}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[open,mode]);
 async function loadOlder(){if(!cursor||olderBusy)return;setOlderBusy(true);setError('');try{const response=await fetch(endpoint(cursor),{cache:'no-store'});const data=await response.json() as Payload;if(!response.ok)throw new Error(data.error||'No pudimos cargar mensajes anteriores.');loadedOlder.current=true;setMessages(existing=>[...data.messages.filter(m=>!existing.some(x=>x.id===m.id)),...existing]);setCursor(data.nextBefore)}catch(e){setError(e instanceof Error?e.message:'No pudimos cargar mensajes anteriores.')}finally{setOlderBusy(false)}}
 async function send(event:FormEvent<HTMLFormElement>){event.preventDefault();if(sending)return;const form=event.currentTarget;const body=String(new FormData(form).get('message')||'').trim();if(!body)return;
  setSending(true);setError('');try{const response=await fetch('/api/espacio',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({body,student:studentId})});const data=await response.json() as {error?:string};if(!response.ok)throw new Error(data.error||'No se pudo enviar el mensaje.');form.reset();loadedOlder.current=false;await refresh();onSent?.()}catch(e){setError(e instanceof Error?e.message:'No se pudo enviar el mensaje.')}finally{setSending(false)}
 }
 const title=mode==='panel'?studentName||'Conversación':'Habla con Herlin';
 return <div ref={container} className={mode==='floating'?'chat-dock':'chat-panel'}>
  {mode==='floating'&&<button ref={trigger} className="chat-launcher" type="button" aria-expanded={open} aria-controls="student-chat-window" onClick={()=>setOpen(value=>!value)}><MessageCircle size={23} aria-hidden="true"/><span>Chat con Herlin</span></button>}
  {visible&&<section id={mode==='floating'?'student-chat-window':undefined} className="chat-window" role={mode==='floating'?'dialog':undefined} aria-label={title}>
   <header className="chat-header"><div><span className="chat-avatar" aria-hidden="true">H</span><div><strong>{title}</strong><small>Mensajes privados · HGrand</small></div></div><div className="chat-header-actions"><button type="button" aria-label="Actualizar conversación" title="Actualizar" onClick={()=>void refresh()} disabled={loading}><RefreshCw size={18}/></button>{mode==='floating'&&<button type="button" aria-label="Cerrar chat" onClick={()=>{setOpen(false);trigger.current?.focus()}}><X size={20}/></button>}</div></header>
   <div className="chat-history" aria-live="polite">{cursor&&<button className="chat-older" type="button" onClick={()=>void loadOlder()} disabled={olderBusy}>{olderBusy?'Cargando…':'Ver mensajes anteriores'}</button>}{loading&&!messages.length?<p className="chat-empty">Cargando conversación…</p>:!messages.length?<p className="chat-empty">Todavía no hay mensajes. Escribe para comenzar.</p>:messages.map(m=><article className={'chat-bubble '+(m.sender_id===userId?'mine':'')} key={m.id}><p>{m.body}</p><time dateTime={m.created_at}>{new Date(m.created_at).toLocaleString('es-US',{dateStyle:'short',timeStyle:'short'})}</time></article>)}<div ref={bottom}/></div>
   {error&&<p className="chat-error" role="alert">{error}</p>}
   <form className="chat-compose" onSubmit={send}><label className="sr-only" htmlFor={mode==='panel'?'admin-chat-message':'student-chat-message'}>Escribe tu mensaje</label><Textarea id={mode==='panel'?'admin-chat-message':'student-chat-message'} name="message" maxLength={2000} rows={2} placeholder="Escribe tu mensaje…" required/><button type="submit" aria-label="Enviar mensaje" disabled={sending}><Send size={19}/></button></form>
  </section>}
 </div>
}
