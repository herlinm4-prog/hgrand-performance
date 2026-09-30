import {database} from './student-space';
import {defaultSettings,type SiteSettings,type PlanCatalog,type Showcase} from './cms-types';
import {plans} from './plans';
import {currentSupportTerms} from './contract-terms';
export async function getSettings():Promise<SiteSettings>{
 const row=await database().prepare("SELECT value FROM site_settings WHERE id='main'").first<{value:string}>();
 if(!row)return structuredClone(defaultSettings);
 const value=JSON.parse(row.value);return {...defaultSettings,...value,terms:currentSupportTerms(value.terms??defaultSettings.terms),plans:{online:{...defaultSettings.plans.online,...value.plans?.online},presencial:{...defaultSettings.plans.presencial,...value.plans?.presencial}}};
}
export async function getPublicSettings(){try{return await getSettings()}catch{return structuredClone(defaultSettings)}}
export function catalog(s:SiteSettings):PlanCatalog{return {online:{...plans.online,...s.plans.online},presencial:{...plans.presencial,...s.plans.presencial}}}
export async function getCatalog(){return catalog(await getPublicSettings())}
export async function publishedShowcase():Promise<Showcase[]>{try{return (await database().prepare("SELECT id,name,quote,caption,has_image,published,consent,created_at,CASE WHEN object_key LIKE '{%' THEN 1 ELSE 0 END AS has_before FROM public_showcase WHERE published=1 AND consent=1 ORDER BY created_at DESC LIMIT 50").all<Showcase>()).results}catch{return []}}
