import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const OFF = "https://world.openfoodfacts.org";
const USDA = "https://api.nal.usda.gov/fdc/v1";
const ua = process.env.OFF_USER_AGENT || "HGrandFoodScience/0.1 (https://hgrandperformance.com)";
const limited = new Map<string, number>();
type Nutrients = { kcal:number|null; protein:number|null; carbs:number|null; fat:number|null; fiber:number|null; sugars:number|null; saturatedFat:number|null; sodium:number|null };
type Food = { id:string; name:string; brand:string|null; barcode:string|null; source:"Open Food Facts"|"USDA FoodData Central"; sourceUrl:string; image:string|null; basis:"100g"; nutrients:Nutrients; dataQuality:string[]; glycemicIndex:null };
const num=(v:unknown):number|null=> typeof v==="number"&&Number.isFinite(v)&&v>=0?v:null;
const nutrient=(p:Record<string,unknown>, k:string)=>num(p[k]);
const normalizeOff=(p:Record<string,any>):Food|null=>{
  if(!p || !p.product_name && !p.product_name_es && !p.product_name_en)return null;
  const n=p.nutriments||{};
  const barcode=String(p.code||"").replace(/\D/g,"")||null;
  const k=n["energy-kcal_100g"] ?? (typeof n["energy_100g"]==="number"? n["energy_100g"]/4.184:null);
  const quality:string[]=[];
  if(!p.product_name)quality.push("Nombre adaptado de campos multilingües");
  if(!p.nutriments)quality.push("Sin tabla nutricional disponible");
  if(p.data_quality_errors_tags?.length)quality.push("El proveedor marca problemas de calidad");
  return {id:"off:"+String(p.code||p._id||p.product_name),name:String(p.product_name_es||p.product_name||p.product_name_en).trim(),brand:p.brands?String(p.brands):null,barcode,source:"Open Food Facts",sourceUrl:barcode?"https://world.openfoodfacts.org/product/"+barcode:"https://world.openfoodfacts.org",image:typeof p.image_front_small_url==="string"?p.image_front_small_url:null,basis:"100g",nutrients:{kcal:num(k),protein:nutrient(n,"proteins_100g"),carbs:nutrient(n,"carbohydrates_100g"),fat:nutrient(n,"fat_100g"),fiber:nutrient(n,"fiber_100g"),sugars:nutrient(n,"sugars_100g"),saturatedFat:nutrient(n,"saturated-fat_100g"),sodium:nutrient(n,"sodium_100g")},dataQuality:quality,glycemicIndex:null};
};
const nutrientNumber=(ns:any[], ids:number[])=>{for(const id of ids){const n=ns.find(x=>Number(x.nutrientId??x.nutrient?.id)===id);if(n){const value=num(n.value??n.amount);if(value!==null)return value;}}return null;};
const normalizeUsda=(p:Record<string,any>):Food|null=>{
 if(!p?.description||!p.fdcId)return null;
 const n=Array.isArray(p.foodNutrients)?p.foodNutrients:[];
 const brand=[p.brandOwner,p.brandName].filter(Boolean).join(" / ")||null;
 return {id:"usda:"+p.fdcId,name:String(p.description),brand,barcode:p.gtinUpc?String(p.gtinUpc):null,source:"USDA FoodData Central",sourceUrl:"https://fdc.nal.usda.gov/food-details/"+p.fdcId+"/nutrients",image:null,basis:"100g",nutrients:{kcal:nutrientNumber(n,[1008]),protein:nutrientNumber(n,[1003]),carbs:nutrientNumber(n,[1005]),fat:nutrientNumber(n,[1004]),fiber:nutrientNumber(n,[1079]),sugars:nutrientNumber(n,[2000]),saturatedFat:nutrientNumber(n,[1258]),sodium:(()=>{const mg=nutrientNumber(n,[1093]);return mg===null?null:mg/1000;})()},dataQuality:["Valores por 100 g reportados por USDA; confirmar la presentación específica del alimento"],glycemicIndex:null};
};
async function json(url:string,init?:RequestInit){const response=await fetch(url,{...init,headers:{"User-Agent":ua,"Accept":"application/json",...init?.headers},signal:AbortSignal.timeout(9000),next:{revalidate:3600}});if(!response.ok)throw new Error("Proveedor no disponible ("+response.status+")");return response.json();}
export async function GET(request:NextRequest){
 const query=(request.nextUrl.searchParams.get("q")||"").trim().slice(0,100);
 const code=(request.nextUrl.searchParams.get("barcode")||"").replace(/\D/g,"");
 if(!query&&!code)return NextResponse.json({error:"Introduce un alimento o código de barras"},{status:400});
 if(code && (code.length<8||code.length>14))return NextResponse.json({error:"Código de barras no válido"},{status:400});
 if(query && query.length<2)return NextResponse.json({error:"Escribe al menos dos caracteres"},{status:400});
 const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"anonymous";
 const now=Date.now();if(now-(limited.get(ip)||0)<1200)return NextResponse.json({error:"Demasiadas solicitudes. Reintenta en unos segundos."},{status:429});limited.set(ip,now);
 if(limited.size>5000)for(const [k,t] of limited)if(now-t>60000)limited.delete(k);
 const foods:Food[]=[];const warnings:string[]=[];
 if(code){
  try {const data=await json(OFF+"/api/v2/product/"+encodeURIComponent(code)+".json");if(data.status===1){const food=normalizeOff(data.product);if(food)foods.push(food);} }
  catch {warnings.push("No fue posible consultar Open Food Facts");}
 }else{
  // Open Food Facts explicitly rate-limits search to 10 requests/minute per IP: requests happen only on submit.
  try {const url=OFF+"/cgi/search.pl?search_terms="+encodeURIComponent(query)+"&search_simple=1&action=process&json=1&page_size=12&fields=code,product_name,product_name_es,product_name_en,brands,nutriments,image_front_small_url,data_quality_errors_tags";const data=await json(url);for(const p of (data.products||[])){const food=normalizeOff(p);if(food)foods.push(food);}}
  catch {warnings.push("No se pudo consultar el catálogo de productos envasados");}
  const key=process.env.USDA_API_KEY;
  if(key){
   try {const data=await json(USDA+"/foods/search?api_key="+encodeURIComponent(key),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query,pageSize:12,dataType:["Foundation","SR Legacy","Survey (FNDDS)","Branded"]})});for(const p of data.foods||[]){const food=normalizeUsda(p);if(food)foods.push(food);}}
   catch {warnings.push("La fuente USDA no respondió");}
  }else warnings.push("USDA no está configurada; por ahora se muestran productos de Open Food Facts");
 }
 const unique=Array.from(new Map(foods.map(f=>[f.id,f])).values()).slice(0,24);
 return NextResponse.json({foods:unique,warnings,notice:"Datos procedentes de terceros. Confirma envase, preparación, porción y fecha. IG no disponible sin medición validada."},{headers:{"Cache-Control":"public, max-age=60, s-maxage=3600"}});
}
