import {database} from "./student-space";
import {stripeMode} from "./stripe-config";
import type {PlanKey} from "./plans";
// Same source and eligibility as checkout quote. Unknown availability never advertises a limited offer.
export async function getLaunchAvailability(plan:PlanKey):Promise<number|null>{try{const row=await database().prepare("SELECT COUNT(*) AS n FROM checkout_orders WHERE plan=? AND mode=? AND launch=1 AND status IN ('pending','paid')").bind(plan,stripeMode()).first<{n:number}>();return Math.max(0,5-(row?.n||0))}catch{return null}}
