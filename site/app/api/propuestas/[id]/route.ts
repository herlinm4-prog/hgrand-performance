import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database} from '@/lib/student-space';
export const dynamic='force-dynamic';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión con el correo de la propuesta.'},{status:401});
 const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))return Response.json({error:'Propuesta no encontrada.'},{status:404});
 try{const input=await request.json() as Record<string,unknown>,decision=String(input.decision||''),signedName=String(input.signedName||'').trim();
 if(!['accepted','declined'].includes(decision)||decision==='accepted'&&(!input.consent||signedName.length<2||signedName.length>100))return Response.json({error:'Confirma la lectura y escribe tu nombre completo.'},{status:400});
 const db=database(),offer=await db.prepare('SELECT email,status FROM enrollment_offers WHERE id=?').bind(id).first<{email:string;status:string}>();
 if(!offer||offer.email!==user.email.trim().toLowerCase())return Response.json({error:'Propuesta no encontrada para esta cuenta.'},{status:404});
 if(offer.status!=='pending')return Response.json({error:'Esta propuesta ya tiene una respuesta.'},{status:409});
 const result=await db.prepare("UPDATE enrollment_offers SET status=?,responded_at=?,responded_by=?,signed_name=? WHERE id=? AND email=? AND status='pending'").bind(decision,new Date().toISOString(),user.userId,decision==='accepted'?signedName:null,id,offer.email).run();
 if(!result.meta.changes)return Response.json({error:'Esta propuesta ya tiene una respuesta.'},{status:409});
 return Response.json({status:decision});
 }catch(e){console.error('Offer response failed',e);return Response.json({error:'No pudimos registrar tu respuesta. Inténtalo de nuevo.'},{status:503})}
}
