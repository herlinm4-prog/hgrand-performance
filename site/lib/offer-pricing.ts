import type {SiteSettings} from './cms-types';
import {weeklySupportCents} from './support-pricing';
import {validPaymentWeeks} from './monthly-payment';
import type {PlanKey} from './plans';

export function calculateOfferCents(settings:SiteSettings,plan:PlanKey,weeks:number,sessionsPerWeek:number){
 if(!validPaymentWeeks(weeks)||!Number.isInteger(sessionsPerWeek)||sessionsPerWeek<1||sessionsPerWeek>5)throw new Error('Plazo o sesiones inválidos.');
 if(plan==='online')return Math.round(settings.plans.online.price*100*weeks/4);
 return Math.round(settings.plans.presencial.price*100*weeks*sessionsPerWeek/12)+weeklySupportCents(sessionsPerWeek)*weeks;
}
