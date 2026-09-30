// Displayed before payment and copied into each checkout order.
export const initialBlockTerms = `HGrand Fitness & Performance · condiciones del primer bloque

1. El pago cubre un único bloque inicial de cuatro semanas. Online incluye plan de entrenamiento y nutrición, revisión semanal y los ajustes descritos en la ficha del plan. Presencial incluye las sesiones de una hora que elijas por semana, de una a cinco, durante cuatro semanas. El plan a medida ofrece sesiones de 60, 90 o 120 minutos. El acompañamiento de nutrición y suplementación añade US$60 por semana con una sesión, US$30 por semana con dos y no tiene cargo adicional desde tres. El importe exacto y cualquier descuento aparecen en el resumen antes de ir a Stripe.

2. Antes de iniciar, completa el cuestionario de salud inicial y comunica alergias, enfermedades, lesiones, medicamentos y cualquier indicación de tu médico que afecte el entrenamiento o la alimentación. Si hay señales o antecedentes que requieran valoración, podemos posponer el inicio hasta que un profesional sanitario te indique qué actividad es adecuada. Entrega esta información directamente a Herlin por un canal privado acordado.

3. La fecha de inicio se acuerda contigo después de confirmar el pago. El acompañamiento presencial se realiza en un lugar y horario acordados previamente, conforme a las reglas y autorizaciones aplicables del espacio. El precio cubre el servicio de HGrand; no incluye acceso o membresía de una instalación. Si no podemos prestar el servicio en las condiciones acordadas, podrás elegir otra opción o solicitar la devolución íntegra antes de comenzar.

4. Este pago no crea una suscripción ni autoriza cargos automáticos. Al terminar el bloque, la continuidad online se ofrece a US$85 por semana y la presencial a US$50 por sesión, con el cargo semanal de nutrición y suplementación cuando corresponda, únicamente si aceptas un nuevo acuerdo y pago. Puedes terminar al concluir el bloque sin hacer ningún trámite.

5. Puedes pedir la cancelación por escrito a herlingym@gmail.com o mediante WhatsApp al (786) 818-9448. Si cancelas antes del inicio acordado, devolveremos el pago íntegro. Si ya comenzó el bloque, devolveremos la parte correspondiente a semanas completas aún no iniciadas en online o sesiones no realizadas en presencial; nunca se renuncia a otros derechos de cancelación o reembolso que conceda la ley aplicable. La devolución se hará al método de pago original cuando sea posible.

6. Los cambios de cita presencial se coordinan directamente con Herlin según disponibilidad. Un cambio de horario no genera un cargo automático. Las pruebas de laboratorio y servicios médicos externos no están incluidos en el precio; cualquier coste externo se confirma por separado.

7. El programa se adapta a tu evaluación y progreso. No se garantiza un resultado físico específico. La orientación de ejercicio, nutrición y suplementación no sustituye atención, diagnóstico ni tratamiento médico. Para preguntas sobre estas condiciones, utiliza los datos de contacto anteriores.`;

const previousFeeClause='Con una o dos sesiones semanales se añaden US$85 por semana para nutrición y suplementación; con tres o más se incluyen.';
const currentFeeClause='El plan a medida ofrece sesiones de 60, 90 o 120 minutos. El acompañamiento de nutrición y suplementación añade US$60 por semana con una sesión, US$30 por semana con dos y no tiene cargo adicional desde tres.';
export function currentSupportTerms(terms:string):string{
 return terms.replace(previousFeeClause,currentFeeClause);
}
