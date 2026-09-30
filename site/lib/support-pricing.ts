// Weekly nutrition and supplementation fee for sessions of at least one hour.
export function weeklySupportCents(daysPerWeek:number):number{
 return daysPerWeek===1?6000:daysPerWeek===2?3000:0;
}
