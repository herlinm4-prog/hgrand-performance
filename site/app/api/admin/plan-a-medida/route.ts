import {adminUser} from '@/lib/admin-request';
import {database} from '@/lib/student-space';
import {z} from 'zod';
export const dynamic='force-dynamic';
export async function GET(request:Request){if(!await adminUser(request))return Response.json({error:'Acceso restringido.'},{status:403});try{
 const rows=await database().prepare('SELECT * FROM custom_plan_requests ORDER BY CASE status WHEN \'pending\' THEN 0 ELSE 1 END, created_at DESC LIMIT 100').all();
 return Response.json({requests:rows.results},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return Response.json({error:'No pudimos cargar las solicitudes.'},{status:503})}}
const decision=z.object({id:z.string().uuid(),status:z.enum(['approved','declined']),coachNote:z.string().trim().min(3).max(1000),quotedCents:z.number().int().min(100).max(1000000).nullable()}).refine(v=>v.status==='declined'||v.quotedCents!==null);
export async function POST(request:Request){if(!await adminUser(request))return Response.json({error:'Acceso restringido.'},{status:403});let body:unknown;try{body=await request.json()}catch{return Response.json({error:'Solicitud inválida.'},{status:400})}
 if((body as {action?:unknown})?.action==='coupon'){
 const parsedCoupon=z.object({action:z.literal('coupon'),id:z.string().uuid(),decision:z.enum(['granted','declined']),discountCents:z.number().int().min(100).max(1000000).nullable()}).safeParse(body);
 if(!parsedCoupon.success)return Response.json({error:'Indica un descuento válido o rechaza la solicitud.'},{status:400});const p=parsedCoupon.data;
 try{const row=await database().prepare("SELECT quoted_cents FROM custom_plan_requests WHERE id=? AND status='approved' AND coupon_status='requested'").bind(p.id).first<{quoted_cents:number}>();if(!row)return Response.json({error:'No hay una solicitud de cupón pendiente.'},{status:409});
 if(p.decision==='granted'&&(!p.discountCents||p.discountCents>=row.quoted_cents-50))return Response.json({error:'El descuento debe dejar al menos US$0.50 por pagar.'},{status:400});
 const code=p.decision==='granted'?'HGR-'+crypto.randomUUID().slice(0,8).toUpperCase():null;
 const saved=await database().prepare("UPDATE custom_plan_requests SET coupon_status=?,coupon_code=?,coupon_discount_cents=?,updated_at=? WHERE id=? AND status='approved' AND coupon_status='requested' AND NOT EXISTS (SELECT 1 FROM checkout_orders WHERE custom_request_id=? AND status IN ('pending','paid'))").bind(p.decision,code,p.decision==='granted'?p.discountCents:0,new Date().toISOString(),p.id,p.id).run();
 if(!saved.meta.changes)return Response.json({error:'El pago ya se abrió o el cupón ya se resolvió.'},{status:409});return Response.json({saved:true});
 }catch{return Response.json({error:'No se pudo responder al cupón.'},{status:503})}
 }
 const parsed=decision.safeParse(body);if(!parsed.success)return Response.json({error:'Para aprobar, añade el precio por cuatro semanas y un mensaje para el cliente.'},{status:400});const p=parsed.data;try{
 const result=await database().prepare('UPDATE custom_plan_requests SET status=?,coach_note=?,quoted_cents=?,updated_at=? WHERE id=? AND status=\'pending\'').bind(p.status,p.coachNote,p.status==='approved'?p.quotedCents:null,new Date().toISOString(),p.id).run();
 if(!result.meta.changes)return Response.json({error:'La solicitud ya se resolvió o no existe.'},{status:409});return Response.json({saved:true});
 }catch{return Response.json({error:'No se pudo registrar la decisión.'},{status:503})}}
