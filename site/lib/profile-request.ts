type Identity={userId:string}|null;
type Saver=(id:string,name:string,phone:string,plan:'online'|'presencial')=>Promise<void>;
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function handleProfilePost(request:Request,user:Identity,save:Saver):Promise<Response>{
 if(!user)return reply({error:'Tu sesión ha terminado. Vuelve a iniciar sesión.'},401);
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return reply({error:'No se pudo validar la solicitud. Recarga la página.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'Formato de solicitud no válido.'},415);
 if(Number(request.headers.get('content-length')||0)>4000)return reply({error:'La solicitud es demasiado larga.'},413);
 try{
  const raw=await request.text();if(raw.length>4000)return reply({error:'La solicitud es demasiado larga.'},413);
  let input;try{input=JSON.parse(raw)}catch{return reply({error:'No se pudo leer la solicitud.'},400)}
  if(!input||typeof input!=='object')return reply({error:'Revisa tus datos.'},400);
  const name=typeof input.name==='string'?input.name.trim():'';const phone=typeof input.phone==='string'?input.phone.trim():'';const selected=input.plan==='online'||input.plan==='presencial'?input.plan:null;
  if(name.length<2||name.length>100||!selected||phone.length>30||!/^[+()\d\s.-]{7,30}$/.test(phone)||phone.replace(/\D/g,'').length<7)return reply({error:'Revisa tu nombre, teléfono y plan antes de continuar.'},400);
  await save(user.userId,name,phone,selected);return reply({saved:true});
 }catch(error){console.error('Profile save failed',error instanceof Error?error.message:'unknown');return reply({error:'No pudimos guardar tu perfil. Tus datos siguen aquí; inténtalo de nuevo.'},503)}
}
