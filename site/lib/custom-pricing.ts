export const CUSTOM_FEE_CENTS=2500;
import {weeklySupportCents} from './support-pricing';
export const HOURLY_SESSION_CENTS=5000;
export function customPlanPrice(daysPerWeek:number,durationMinutes:number){
 const sessions=daysPerWeek*4;
 const trainingCents=Math.round(sessions*HOURLY_SESSION_CENTS*durationMinutes/60);
 const supportWeeklyCents=weeklySupportCents(daysPerWeek);
 const supportCents=supportWeeklyCents*4;
 return {sessions,trainingCents,supportWeeklyCents,supportCents,customFeeCents:CUSTOM_FEE_CENTS,totalCents:trainingCents+supportCents+CUSTOM_FEE_CENTS};
}
