export const plans = {
 online: {
  slug:"online", name:"Acompañamiento online", shortName:"Online", tag:"Donde estés", price:340, launch:289, period:"primeras 4 semanas", renewal:"Después, US$85 por semana", sessions:"Acompañamiento y revisión semanal",
  intro:"Aprende a elegir tus alimentos, a entrenar y a construir disciplina con una guía que se adapta a tu rutina, estés donde estés.",
  forWho:"Para ti si buscas una estructura clara, puedes entrenar por tu cuenta y quieres contar con orientación y seguimiento profesional durante el proceso.",
  includes:["Plan de entrenamiento según tu nivel, objetivo y equipo disponible","Plan nutricional adaptado a tus hábitos, horarios y preferencias","Orientación sobre suplementación cuando corresponda","Revisión semanal de tu evolución y ajustes del programa","Revisión semanal con tres fotografías y medición de composición corporal por bioimpedancia","Coordinación de análisis con tu médico y revisión trimestral según tu caso"],
  note:"El inicio cubre cuatro semanas completas. Después, la continuidad del plan es semanal. Los análisis se realizan mediante tu médico; su coste se confirma por separado."
 },
 presencial: {
  slug:"presencial", name:"Preparación presencial", shortName:"Presencial", tag:"Entrenamos juntos", price:600, launch:480, period:"primeras 4 semanas", renewal:"Después, US$50 por sesión", sessions:"Elige entre 1 y 5 días por semana · 1 hora por sesión",
  intro:"Entrena conmigo, aprende la técnica y gana confianza mientras construimos una rutina que puedas sostener.",
  forWho:"Para ti si valoras la guía durante cada sesión, necesitas corregir tu técnica o quieres un acompañamiento más directo en tu entrenamiento.",
  includes:["Elige entre una y cinco sesiones de entrenamiento por semana, de una hora cada una","El bloque de cuatro semanas incluye de 4 a 20 sesiones, según tu elección","Revisión semanal de 30 minutos para evaluar tu evolución","Plan nutricional y orientación sobre suplementación","Ajustes de entrenamiento y alimentación según tu respuesta","Evaluaciones y coordinación de análisis con tu médico, según corresponda"],
  note:"Coordinamos contigo el lugar y los horarios en Miami antes de comenzar. El precio corresponde a un bloque de cuatro semanas. Nutrición y suplementación: US$60 por semana con un día, US$30 con dos y sin cargo adicional desde tres. Los análisis externos se confirman por separado."
 }
} as const;
export type PlanKey=keyof typeof plans;
export function planKey(value:unknown):PlanKey|null { return value==='online'||value==='presencial'?value:null; }
export const whatsapp="https://wa.me/17868189448";
