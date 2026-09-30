import {database} from './student-space';
export function validPaymentWeeks(value:number){return Number.isInteger(value)&&value>=1&&value<=16}
export function blockEnd(startDate:string|null,paidAt:string,weeks=4){if(!validPaymentWeeks(weeks))throw new Error('Período inválido.');const base=startDate&&/^\d{4}-\d{2}-\d{2}$/.test(startDate)?new Date(startDate+'T12:00:00Z'):new Date(paidAt);base.setUTCDate(base.getUTCDate()+weeks*7);return base.toISOString().slice(0,10)}
export async function markOfferPaid(id:string,method:'stripe'|'manual'|'zelle',paidAt:string){
 const db=database();const offer=await db.prepare('SELECT email,start_date,duration_weeks,payment_status,status FROM enrollment_offers WHERE id=?').bind(id).first<{email:string;start_date:string|null;duration_weeks:number;payment_status:string;status:string}>();
 if(!offer||offer.status!=='accepted'||offer.payment_status!=='unpaid')return false;
 if(method!=='stripe'&&await db.prepare("SELECT id FROM checkout_orders WHERE offer_id=? AND status='pending'").bind(id).first())return false;
 const due=blockEnd(offer.start_date,paidAt,offer.duration_weeks);
 const results=await db.batch([
  db.prepare("UPDATE enrollment_offers SET payment_status=?,paid_at=? WHERE id=? AND status='accepted' AND payment_status='unpaid' AND (?='stripe' OR NOT EXISTS (SELECT 1 FROM checkout_orders WHERE offer_id=? AND status='pending'))").bind(method,paidAt,id,method,id),
  db.prepare("UPDATE student_enrollments SET next_payment_date=?,billing='manual',updated_at=? WHERE email=? AND (next_payment_date IS NULL OR next_payment_date < ?) AND EXISTS (SELECT 1 FROM enrollment_offers WHERE id=? AND payment_status=?)").bind(due,paidAt,offer.email,due,id,method),
 ]);
 return !!results[0].meta.changes;
}
