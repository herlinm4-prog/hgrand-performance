import {quotePlan} from '@/lib/checkout';
import {planKey} from '@/lib/plans';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export const dynamic='force-dynamic';
export async function POST(request:Request){if(!await getChatGPTUser())return Response.json({error:'Inicia sesión para aplicar tu código.'},{status:401});try{const body=await request.json() as Record<string,unknown>,plan=planKey(body.plan);if(!plan)return Response.json({error:'Plan inválido.'},{status:400});const q=await quotePlan(plan,body.code,body.sessionsPerWeek);const {p,discount,...safe}=q;return Response.json(safe,{headers:{'Cache-Control':'no-store'}})}catch(e){return Response.json({error:e instanceof Error?e.message:'No pudimos calcular el importe.'},{status:400})}}
