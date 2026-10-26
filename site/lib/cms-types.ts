import {plans,type PlanKey} from './plans';
import {initialBlockTerms} from './contract-terms';
export type EditablePlan={price:number;launch:number;renewal:string;intro:string;note:string;launchEnabled:boolean};
export type SiteSettings={plans:Record<PlanKey,EditablePlan>;heroText:string;bioQuote:string;checkoutEnabled:boolean;presencialAvailable:boolean;terms:string};
export type DisplayPlan=Omit<(typeof plans)[PlanKey],'price'|'launch'|'renewal'|'intro'|'note'>&EditablePlan;
export type PlanCatalog=Record<PlanKey,DisplayPlan>;
export type Discount={code:string;kind:'percent'|'fixed';value:number;plan:'all'|PlanKey;starts_at:string;expires_at:string;max_uses:number;active:number;used?:number;reserved?:number};
export type Showcase={id:string;name:string;quote:string;caption:string;has_image:number;has_before?:number;published:number;consent:number;created_at:string};
export const defaultSettings:SiteSettings={plans:{online:{...plans.online,launchEnabled:true},presencial:{...plans.presencial,launchEnabled:true}},heroText:'Aprende a elegir tus alimentos, a entrenar y a construir hábitos que encajen en tu vida. Te acompaño paso a paso para transformar tu físico, sentirte mejor y avanzar con confianza.',bioQuote:'Quiero que entiendas tu proceso y aprendas a cuidar de ti.',checkoutEnabled:true,presencialAvailable:false,terms:initialBlockTerms};
