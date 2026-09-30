# Continuidad HGrand — 24/09/2026

## Adiciones de esta versión
- /admin/contenido: CMS privado para textos de presentación, precios y notas de planes; borradores/publicación de fotografías y testimonios con autorización; códigos de descuento por plan, valor, vigencia y límite de usos; configuración comercial del checkout.
- /cuenta: enlace a administración solo para el coach; historial de pagos reales confirmados. Se preservan fotos privadas, PDF, chat y perfil existentes.
- /checkout: campo de código, total calculado en servidor, aceptación de condiciones y pago inicial único de cuatro semanas. No hay renovación automática.
- Webhook firmado registra pagos de forma idempotente. Las plazas promocionales y los descuentos se reservan atómicamente al crear el pedido y se liberan al recibir checkout.session.expired. Modo de prueba y real separados.
- Migración 0004 solo añade tablas e índices. No elimina datos ni modifica las tablas anteriores.
- El diseño y los valores iniciales del inicio se mantienen. La sección de testimonios solo aparece al publicar contenido real.

## Configuración pendiente
La consulta de variables del proyecto principal devolvió cero entradas. Para cobrar hacen falta STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET configuradas como secretos de Sites; el webhook es /api/webhooks/stripe y necesita checkout.session.completed, checkout.session.async_payment_succeeded y checkout.session.expired. Después, el coach debe guardar las condiciones de contratación y habilitar el checkout en el CMS. Presencial tiene un interruptor de disponibilidad. La renovación semanal se coordina manualmente; no se implementó una suscripción automática.

Se conserva la identidad actual de Sites. Un acceso independiente mediante correo todavía no está implementado: la guía actual de Sites requiere confirmar soporte de identidad externa antes de montar otra autenticación. No cambiar solo etiquetas ni romper el acceso existente.

## Verificación
- TypeScript y compilación Workers.
- Inicio y navegación a checkout revisados en navegador de desarrollo.
- Pruebas locales de rutas con identidad y D1 simulados: bloqueo a visitantes/alumnos en CMS; guardar precios; descuentos válidos, de otro plan y desactivados; bloqueo de pagos sin configuración; firma webhook, importe incorrecto y repetición idempotente.
- Pruebas SQLite: límite de cinco promociones, usos de descuento reservados, liberación por vencimiento, límite de pedidos abiertos, aislamiento prueba/real.
- No se ejecutó una transacción real ni una prueba externa de Stripe; no hay credenciales configuradas. El recorrido autenticado del CMS no se probó visualmente con la cuenta real.

## Recuperación
Conservar la versión 10 como punto anterior. No borrar tablas de la migración 0004 al volver a una versión anterior. El repositorio GitHub de memoria sigue siendo independiente del repositorio fuente de Sites; no afirmar sincronización automática.
