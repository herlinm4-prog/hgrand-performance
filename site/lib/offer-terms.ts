import {blockEnd} from './monthly-payment';

/** Snapshot attached to one offer; later CMS edits cannot change what was accepted. */
export function offerTerms(startDate:string,amountCents:number,details:string,weeks:number){
 const endDate=blockEnd(startDate,startDate,weeks);
 return `HGrand Fitness & Performance · confirmación de pago individual

Servicio: ${details}
Período cubierto: ${weeks} ${weeks===1?'semana':'semanas'} desde ${startDate}. Próximo vencimiento: ${endDate}.
Importe total de este período: US$${(amountCents/100).toFixed(2)}.

Al aceptar, autorizas solamente esta propuesta y el pago indicado para este período. La aceptación no efectúa el cargo: el pago se realiza por separado o se registra cuando Herlin lo recibe. No se crea una suscripción, no se guarda autorización para hacer cargos futuros y no se cobra automáticamente al terminar el período. Si deseas continuar, Herlin te enviará una nueva propuesta y un nuevo enlace de pago para que decidas si aceptas.

El servicio empieza en la fecha indicada si las condiciones y la disponibilidad acordadas están confirmadas. El entrenamiento presencial se presta en el horario y lugar acordados, sujeto a las reglas del gimnasio; su membresía no está incluida. Antes de comenzar, comunica a Herlin por un canal privado cualquier limitación de salud relevante para el entrenamiento. El acompañamiento físico y nutricional no sustituye atención médica ni garantiza un resultado específico.

Puedes solicitar cancelar por escrito a herlingym@gmail.com o por WhatsApp al (786) 818-9448. Si cancelas antes de comenzar el servicio, se devuelve el importe pagado. Una vez iniciado, se devuelve la parte correspondiente a semanas completas no iniciadas del programa online o a sesiones presenciales no realizadas, sin limitar los derechos que te correspondan por ley. La devolución se realizará al método original cuando sea posible.

Conservamos el nombre de quien acepta, su respuesta y la fecha como constancia de esta propuesta. Para dudas sobre los servicios o el pago, contacta a Herlin antes de aceptarla.`;
}
