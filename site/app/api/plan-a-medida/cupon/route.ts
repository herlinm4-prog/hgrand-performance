import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database} from '@/lib/student-space';
export const dynamic='force-dynamic';
export async function POST(request:Request){const user=await getChatGPTUser();if(!user)return Response.json({error:'Inicia sesión.'},{status:401});const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Solicitud inválida.'},{status:403});
 let body:unknown;try{body=await request.json()}catch{return Response.json({error:'Solicitud inválida.'},{status:400})}const id=(body as {id?:unknown})?.id;if(typeof id!=='string'||! /^[a-f0-9-]{36}$/.test(id))return Response.json({error:'Solicitud inválida.'},{status:400});
 try{const result=await database().prepare("UPDATE custom_plan_requests SET coupon_status='requested',updated_at=? WHERE id=? AND student_id=? AND status='approved' AND coupon_status IN ('none','declined') AND NOT EXISTS (SELECT 1 FROM checkout_orders WHERE custom_request_id=? AND status IN ('pending','paid'))").bind(new Date().toISOString(),id,user.userId,id).run();
 if(!result.meta.changes)return Response.json({error:'El cupón ya fue solicitado, el pago está abierto o esta solicitud aún no está aprobada.'},{status:409});return Response.json({requested:true});
 }catch{return Response.json({error:'No pudimos enviar la solicitud del cupón.'},{status:503})}}
