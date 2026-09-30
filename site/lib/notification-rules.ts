export type Category='pagos'|'checkins'|'mensajes'|'progreso'|'alumnos'|'documentos'|'solicitudes';
export type AlertCandidate={id:string;version:string;category:Category;studentId:string|null;email:string|null;name:string;title:string;description:string;priority:number;actionLabel:string;actionUrl:string;occurredAt:string;dueDate:string|null;requiresAction:boolean};
export const priorityNames=['URGENTE','ALTA','NORMAL','INFORMATIVA'] as const;
export function miamiDate(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}
export function validDate(s:string){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s}
export function daysUntil(date:string,today=miamiDate()){return Math.round((Date.parse(date+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400000)}
export function dueLabel(kind:'Pago'|'Check-in'|'Entrega de plan',days:number){return days<0?`${kind} vencido · ${-days} día${days===-1?'':'s'}`:days===0?`${kind} · VENCE HOY`:days===1?`${kind} mañana`:`${kind} en ${days} días`}
export function safeAdminLink(view:string,student?:string|null,email?:string|null){const q=new URLSearchParams();if(student)q.set('student',student);if(email)q.set('email',email);return '/admin'+(q.size?'?'+q.toString():'')+'#'+view}
export function visibleAlert(row:{resolved_at:string|null;snoozed_until:string|null},now=new Date().toISOString()){return !row.resolved_at&&(!row.snoozed_until||row.snoozed_until<=now)}
