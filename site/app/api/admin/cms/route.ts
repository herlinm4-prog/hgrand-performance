import {adminUser} from '@/lib/admin-request';
import {database,filesBucket} from '@/lib/student-space';
import {getSettings} from '@/lib/cms';
import {stripeStatus} from '@/lib/stripe-config';
import {z} from 'zod';
export const dynamic='force-dynamic';
const plan=z.object({price:z.number().min(1).max(10000).multipleOf(.01),launch:z.number().min(1).max(10000).multipleOf(.01),renewal:z.string().trim().min(3).max(150),intro:z.string().trim().min(3).max(1000),note:z.string().trim().min(3).max(1000),launchEnabled:z.boolean()}).refine(p=>p.launch<=p.price,'El precio de lanzamiento no puede superar el habitual.');
const settings=z.object({plans:z.object({online:plan,presencial:plan}),heroText:z.string().trim().min(10).max(1000),bioQuote:z.string().trim().min(5).max(300),checkoutEnabled:z.boolean(),presencialAvailable:z.boolean(),terms:z.string().trim().max(5000)});
const discount=z.object({code:z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,32}$/),kind:z.enum(['percent','fixed']),value:z.number().int().positive(),plan:z.enum(['all','online','presencial']),starts_at:z.string().datetime(),expires_at:z.string().datetime(),max_uses:z.number().int().min(1).max(100000),active:z.number().int().min(0).max(1)}).refine(d=>d.kind==='percent'?d.value<=90:d.value<=1000000,'Descuento inválido.').refine(d=>d.expires_at>d.starts_at,'La fecha final debe ser posterior al inicio.');
export async function GET(request:Request){if(!await adminUser(request))return Response.json({error:'Acceso restringido.'},{status:403});try{
 const [s,d,p,requests]=await Promise.all([getSettings(),database().prepare(`SELECT d.*, (SELECT COUNT(*) FROM checkout_orders o WHERE o.discount_code=d.code AND o.status='paid' AND o.mode='live') AS used, (SELECT COUNT(*) FROM checkout_orders o WHERE o.discount_code=d.code AND o.status='pending' AND o.mode='live') AS reserved FROM discount_codes d ORDER BY d.code`).all(),database().prepare("SELECT id,name,quote,caption,has_image,published,consent,created_at,CASE WHEN object_key LIKE '{%' THEN 1 ELSE 0 END AS has_before FROM public_showcase ORDER BY created_at DESC LIMIT 100").all(),database().prepare("SELECT COUNT(*) AS n FROM custom_plan_requests WHERE status='pending' OR coupon_status='requested'").first<{n:number}>()]);
 return Response.json({settings:s,discounts:d.results,publications:p.results,pendingRequests:requests?.n||0,stripe:stripeStatus()},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return Response.json({error:'No se pudo cargar la administración.'},{status:503})}}
export async function POST(request:Request){if(!await adminUser(request))return Response.json({error:'Acceso restringido.'},{status:403});try{
 if(request.headers.get('content-type')?.includes('multipart/form-data')){
 const f=await request.formData(),name=String(f.get('name')||'').trim(),quote=String(f.get('quote')||'').trim(),caption=String(f.get('caption')||'').trim(),consent=f.get('consent')==='true';
 const before=f.get('before'),after=f.get('after'),legacy=f.get('file');
 const beforeFile=before instanceof File&&before.size>0?before:null;
 const afterFile=after instanceof File&&after.size>0?after:legacy instanceof File&&legacy.size>0?legacy:null;
 if(!name||name.length>100||quote.length>2000||caption.length>300||!consent)return Response.json({error:'Completa el nombre y confirma la autorización de publicación.'},{status:400});
 if(!quote&&!afterFile)return Response.json({error:'Añade un testimonio o una fotografía del resultado.'},{status:400});
 if(beforeFile&&!afterFile)return Response.json({error:'Añade también la fotografía de después.'},{status:400});
 for(const file of [beforeFile,afterFile])if(file&&(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024))return Response.json({error:'Usa imágenes JPG, PNG o WebP de hasta 10 MB cada una.'},{status:400});
 const id=crypto.randomUUID(),keys:string[]=[];
 try{
  if(beforeFile){const key=`public-showcase/${id}/before`;await filesBucket().put(key,beforeFile.stream(),{httpMetadata:{contentType:beforeFile.type}});keys.push(key)}
  if(afterFile){const key=`public-showcase/${id}/after`;await filesBucket().put(key,afterFile.stream(),{httpMetadata:{contentType:afterFile.type}});keys.push(key)}
  const objectKey=beforeFile?JSON.stringify({before:keys[0],after:keys[1]}):afterFile?keys[0]:'';
  await database().prepare('INSERT INTO public_showcase (id,name,quote,caption,has_image,object_key,published,consent,created_at) VALUES (?,?,?,?,?,?,0,1,?)').bind(id,name,quote,caption,afterFile?1:0,objectKey,new Date().toISOString()).run();
 }catch(e){for(const key of keys)await filesBucket().delete(key);throw e}
 return Response.json({saved:true});
 }
 const body=await request.json() as Record<string,unknown>;
 if(body.action==='settings'){
 const parsed=settings.safeParse(body.settings);if(!parsed.success)return Response.json({error:parsed.error.issues[0]?.message||'Revisa los campos.'},{status:400});
 if(parsed.data.checkoutEnabled&&(!stripeStatus().ready||parsed.data.terms.length<30))return Response.json({error:'Configura Stripe y escribe las condiciones de contratación antes de habilitar el pago.'},{status:400});
 await database().prepare("INSERT INTO site_settings (id,value,updated_at) VALUES ('main',?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(JSON.stringify(parsed.data),new Date().toISOString()).run();
 }else if(body.action==='discount'){
 const parsed=discount.safeParse(body.discount);if(!parsed.success)return Response.json({error:parsed.error.issues[0]?.message||'Revisa el código.'},{status:400});const d=parsed.data;
 // Existing codes retain their terms; deactivate them and create a new code for a different offer.
 await database().prepare('INSERT INTO discount_codes (code,kind,value,plan,starts_at,expires_at,max_uses,active) VALUES (?,?,?,?,?,?,?,?)').bind(d.code,d.kind,d.value,d.plan,d.starts_at,d.expires_at,d.max_uses,d.active).run();
 }else if(body.action==='discount-toggle'&&typeof body.code==='string'&&typeof body.active==='boolean'){
 await database().prepare('UPDATE discount_codes SET active=? WHERE code=?').bind(body.active?1:0,body.code).run();
 }else if(body.action==='publication-edit'&&typeof body.id==='string'&&typeof body.name==='string'&&typeof body.quote==='string'&&typeof body.caption==='string'){
 const name=body.name.trim(),quote=body.quote.trim(),caption=body.caption.trim();
 if(!name||name.length>100||quote.length>2000||caption.length>300)return Response.json({error:'Revisa los campos de la publicación.'},{status:400});
 const result=await database().prepare("UPDATE public_showcase SET name=?,quote=?,caption=? WHERE id=? AND consent=1 AND (has_image=1 OR length(?)>0)").bind(name,quote,caption,body.id,quote).run();
 if(!result.meta.changes)return Response.json({error:'Publicación no encontrada.'},{status:404});
 }else if(body.action==='publication-delete'&&typeof body.id==='string'){
 const row=await database().prepare('SELECT object_key FROM public_showcase WHERE id=? AND published=0').bind(body.id).first<{object_key:string}>();
 if(!row)return Response.json({error:'Retira la publicación de la web antes de eliminar el borrador.'},{status:409});
 await database().prepare('DELETE FROM public_showcase WHERE id=? AND published=0').bind(body.id).run();
 let keys=[row.object_key];if(row.object_key.startsWith('{')){try{const pair=JSON.parse(row.object_key) as {before:string;after:string};keys=[pair.before,pair.after]}catch{keys=[]}}
 for(const key of keys)if(key)await filesBucket().delete(key);
 }else if(body.action==='publication-toggle'&&typeof body.id==='string'&&typeof body.published==='boolean'){
 await database().prepare('UPDATE public_showcase SET published=? WHERE id=? AND consent=1').bind(body.published?1:0,body.id).run();
 }else return Response.json({error:'Acción inválida.'},{status:400});
 return Response.json({saved:true});
 }catch(e){console.error('CMS save failed',e);return Response.json({error:'No se pudo guardar. Si estás creando un código, comprueba que no exista.'},{status:400})}}
