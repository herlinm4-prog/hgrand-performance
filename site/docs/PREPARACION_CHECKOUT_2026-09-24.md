# Preparación del checkout · 24 de septiembre de 2026

- Se redactaron condiciones para el bloque inicial único de cuatro semanas. La misma versión aparece en `/legal/condiciones`, antes de pagar y queda copiada en cada pedido. Se puede editar desde `/admin/contenido`.
- La configuración inicial habilita el checkout online **solo cuando** Stripe tenga clave y secreto de webhook válidos. Mientras falten, la interfaz y el servidor siguen bloqueando el cobro.
- Los códigos privados se aplican al precio normal del primer bloque; no se combinan con la promoción de lanzamiento.
- El presencial permanece sin cobro en línea hasta que Herlin confirme lugar y horarios y active disponibilidad en la administración. La web ofrece contacto para coordinarlo.
- La fuente de esta versión todavía usa identidad de ChatGPT Sites en el servidor. Los dos enlaces visuales de acceso llevan a ese proveedor. No se sustituyó la autenticación porque cambiar solo la pantalla rompería la identidad de los alumnos.
- Faltan `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y registrar `/api/webhooks/stripe` en Stripe; realizar una transacción de prueba y verificar el webhook, el pedido, el acceso y los estados cancelado/fallido. Sin un segundo usuario real autorizado no se puede certificar el aislamiento de cuentas en producción.
- La continuidad posterior al bloque inicial se acuerda y cobra aparte, sin renovación automática. El checkout no tiene una suscripción activa ni debe presentarse como tal.

## Ajuste posterior

- El acompañamiento presencial se describe como un servicio en un lugar y horario acordados, sujeto a las reglas y autorizaciones del espacio. El precio no incluye acceso ni membresía. No se afirma que HGrand esté autorizado por un gimnasio concreto.
- Las condiciones piden un cuestionario de salud antes del inicio. La cuenta ofrece una plantilla Word en blanco para antecedentes, síntomas, enfermedades, lesiones, medicamentos, alergias y hábitos. El sitio no recibe sus respuestas por ese enlace; se entregan por el canal privado que acuerden Herlin y el alumno.
