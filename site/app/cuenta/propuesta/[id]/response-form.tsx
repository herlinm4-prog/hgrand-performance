'use client';
import {useState} from 'react';
import {Input} from '@/components/ui/input';
export default function ResponseForm({id,name}:{id:string;name:string}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState('');
 async function send(form:HTMLFormElement,decision:'accepted'|'declined'){
  if(busy)return;const data=new FormData(form);setBusy(true);setError('');
  try{const response=await fetch('/api/propuestas/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decision,signedName:String(data.get('signedName')||''),consent:data.has('consent')})});const body=await response.json() as {error?:string};if(!response.ok)throw new Error(body.error||'No pudimos registrar tu respuesta.');setResult(decision==='accepted'?'Aceptada':'Rechazada');window.location.reload()}catch(e){setError(e instanceof Error?e.message:'Inténtalo de nuevo.')}finally{setBusy(false)}
 }
 return <form className="space-card space-form offer-response" onSubmit={e=>{e.preventDefault();void send(e.currentTarget,'accepted')}}><h2>Tu respuesta</h2><p>Revisa el precio, los servicios y las condiciones antes de confirmar.</p><label>Nombre completo como confirmación<Input name="signedName" defaultValue={name} minLength={2} maxLength={100} required/></label><label className="offer-checkbox"><input type="checkbox" name="consent" required/><span>He leído esta propuesta, acepto sus condiciones y consiento recibir y conservar esta confirmación en formato electrónico.</span></label>{error&&<p role="alert" className="form-error">{error}</p>}{result&&<p role="status">{result}</p>}<div className="offer-actions"><button className="btn-dark" disabled={busy} type="submit">{busy?'Registrando…':'Aceptar propuesta'}</button><button type="button" disabled={busy} onClick={e=>{const form=e.currentTarget.closest('form');if(form)void send(form,'declined')}}>Rechazar propuesta</button></div></form>
}
