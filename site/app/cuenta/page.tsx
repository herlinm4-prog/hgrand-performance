import type {Metadata} from "next";
export const metadata:Metadata={robots:{index:false,follow:false},title:"Espacio del alumno"};
import {Header,Footer} from '@/app/site-shell';
import {requireChatGPTUser,chatGPTSignOutPath} from '@/app/chatgpt-auth';
import {isCoach} from '@/lib/student-space';
import {getCatalog} from '@/lib/cms';
import PaymentHistory from './payment-history';
import {getProfile,claimEnrollment} from '@/lib/profile';
import {planKey,type PlanKey} from '@/lib/plans';
import ProfileForm from './profile-form';
import StudentSpace from './student-space';
import NextSteps from './next-steps';
import {quotePlan} from '@/lib/checkout';
export const dynamic='force-dynamic';
async function AccountContent({selected,sessionsPerWeek}:{selected:PlanKey|null;sessionsPerWeek:number|null}){
 const selectionQuery=selected?'?plan='+selected+(selected==='presencial'&&sessionsPerWeek?'&sessions='+sessionsPerWeek:''):'';
 const user=await requireChatGPTUser('/cuenta'+selectionQuery);let profile=null;let unavailable=false;
 try{await claimEnrollment(user.userId,user.email);profile=await getProfile(user.userId)}catch(e){unavailable=true;console.error('Profile read failed',e instanceof Error?e.message:'unknown')}
 const catalog=await getCatalog();
 let presencialSelection=null;
 if(selected==='presencial'&&sessionsPerWeek)try{const quote=await quotePlan(selected,'',sessionsPerWeek);presencialSelection={sessionsPerWeek:quote.sessionsPerWeek!,sessionCount:quote.sessionCount,trainingCents:quote.trainingCents,supportCents:quote.supportCents,totalCents:quote.totalCents}}catch{}
 return <>{isCoach(user)&&<a className="btn-dark" href="/admin">Abrir administración ↗</a>}<div className="account-heading"><div><div className="eyebrow">Tu cuenta HGrand</div><h1>{profile?'Qué bueno tenerte aquí.':'Empecemos por ti.'}</h1><p>{profile?'Tus planes, avances y mensajes en un solo lugar.':'Crea tu perfil para abrir el seguimiento privado con Herlin.'}</p></div><a className="secondary-link" href={chatGPTSignOutPath('/')} target="_top">Cerrar sesión</a></div><nav className="account-shortcuts" aria-label="Accesos de tu cuenta">{profile&&<><a href="#seguimiento">Seguimiento y fotos</a><a href="#documentos">Mis documentos</a><a href="#pagos">Pagos</a></>}<a href="#perfil">Mi perfil</a><a href="#ficha-salud">Ficha inicial</a><a href="/planes/a-medida">Plan a medida ↗</a></nav>{unavailable?<div className="form-error" role="alert"><strong>No podemos cargar tu perfil en este momento.</strong><p>Inténtalo de nuevo en unos minutos. No se han modificado tus datos.</p><a href={'/cuenta'+selectionQuery}>Volver a intentar</a></div>:<>{!profile&&<section id="perfil"><ProfileForm availablePlans={catalog} presencialSelection={presencialSelection} profile={profile} selected={selected||null} displayName={user.fullName||''} email={user.email}/></section>}<NextSteps email={user.email}/>{profile&&<StudentSpace coach={false} userId={user.userId}/>}<section id="pagos"><PaymentHistory userId={user.userId} email={user.email}/></section>{profile&&<section id="perfil"><ProfileForm availablePlans={catalog} presencialSelection={presencialSelection} profile={profile} selected={selected||profile.selected_plan} displayName={user.fullName||''} email={user.email}/></section>}<section id="ficha-salud" className="health-intake"><h2>Ficha de salud inicial</h2><p>Antes de comenzar, completa esta ficha para revisar alergias, antecedentes, lesiones y medicación. Entrégala directamente a Herlin por un canal privado acordado. No la subas a la galería de fotos ni al chat general.</p><a href="/downloads/HGrand_Cuestionario_de_Salud_Inicial.docx" download>Descargar cuestionario de salud ↗</a></section></>}</>
}
export default async function Account({searchParams}:{searchParams:Promise<{plan?:string;sessions?:string}>}){const query=await searchParams;return <><Header account/><main className="section wrap account"><AccountContent selected={planKey(query.plan)} sessionsPerWeek={/^[1-5]$/.test(query.sessions||'')?Number(query.sessions):null}/></main><Footer/></>}
