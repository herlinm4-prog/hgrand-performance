# H GRAND — contexto maestro

Actualizado: 2026-09-29. Fuente auditada: Sites, proyecto appgprj_6ab48e62111481918fcd243e52e83015, versión publicada 41. Esta copia conserva el sitio completo. GitHub herlinm4-prog/hgrand-performance contenía solo un prototipo CMS local y documentación antigua; no estaba sincronizado con producción.

## Decisiones vigentes
- Conservar diseño, CMS, portal, identidad y checkout existentes.
- Los planes públicos son pagos únicos por bloque, sin renovación automática. El usuario lo confirmó en esta sesión. Las antiguas notas sobre suscripciones obligatorias están obsoletas.
- Los pagos manuales nunca se convierten automáticamente en suscripciones. No afirmar soporte de suscripciones sin una integración real.
- No almacenar información privada en localStorage ni incluirla en cachés PWA o notificaciones push.
- No publicar cambios sin validar migraciones, permisos y recorridos afectados.

## Arquitectura encontrada — IMPLEMENTADO
Vinext/React/TypeScript, Cloudflare Worker, D1 (`DB`) y R2 (`BUCKET`). Migraciones Drizzle aditivas 0000–0012. Identidad Sites/SIWC; autorización del entrenador en servidor mediante `isCoach`. Website público, checkout, páginas de planes, condiciones y privacidad.

H Grand Admin: escritorio con agenda, altas, propuestas de cobro, solicitudes personalizadas, conversaciones, contenido/precios/cupones y expedientes. Portal `/cuenta`: perfil, fotos privadas, PDF de nutrición/entrenamiento/suplementación, comparación de fotos, chat e historial de pagos.

Tablas existentes: student_profiles, student_enrollments, enrollment_offers, consultation_slots, student_files, student_messages, student_payments, site_settings, discount_codes, checkout_orders, public_showcase, custom_plan_requests. No hay credenciales ni datos de alumnos en este documento.

## Pagos — IMPLEMENTADO / PARCIAL
Stripe Checkout de pago único con importes autorizados en servidor, webhooks firmados e idempotencia. Propuestas por 1–16 semanas; registro manual/Zelle y siguiente vencimiento. El 29/09 se verificó apertura de Stripe real por US$289 online, sin ejecutar pago. Presencial mostraba pago no disponible. No se verificó confirmación pospago ni transferencia bancaria. Suscripciones automáticas: PENDIENTE; no existen en el código auditado.

## Antes de esta intervención
- Check-ins: PARCIAL, fecha programada en ficha; sin registros estructurados de peso/bioimpedancia/medidas ni revisión.
- Fotos y documentos: IMPLEMENTADO, D1/R2, autorización por alumno.
- Mensajería: IMPLEMENTADO, historial compartido alumno/entrenador; espera de respuesta calculada por último remitente.
- Notification Center / Action Inbox: PENDIENTE, solo contadores aislados y lista de vencimientos.
- PWA / push: PARCIAL: existían iconos y manifest público, sin instalación específica de Admin ni envío push.

## Estado de trabajo
Auditoría completada del código fuente. Cambios preparados en fuente; NO publicados ni aplicados a la base de producción.

### IMPLEMENTADO en esta revisión
- Notification Center / Action Inbox integrado en el escritorio y `/admin/alertas`.
- Estados duraderos en D1: leído, resuelto, pospuesto e historial de acciones.
- Derivación de pagos próximos/vencidos/completados/fallidos, onboarding, mensajes, fotos agrupadas, documentos, solicitudes y check-ins. Prioridad/fecha, filtros y contadores.
- Apertura directa de alumno, conversación, expediente y cobros existentes.
- Registros de check-in con peso/bioimpedancia/cintura/comentarios, comparación anterior, revisión y siguiente fecha. Fotos reutilizadas desde R2.
- Edición de ficha ampliada; pago manual continúa usando el registro de propuestas existente.
- Evento firmado de fallo de pago asíncrono Stripe.
- Manifest Admin, iconos reutilizados, service worker sin caché privada, registro/revocación push y endpoint de envío autenticado con deduplicación.
- Migración Drizzle 0013: solo tablas nuevas.

### PARCIAL / PENDIENTE
- PWA/push: código preparado; claves VAPID, trabajo programado, permisos e iPhone real pendientes. No se enviaron avisos reales.
- Suscripciones automáticas: PENDIENTE, el producto conserva pago único/manual. No inventar que existen.
- Historial de actividad: historial de alertas y fuentes existentes; auditoría global de todas las acciones del CMS pendiente.
- TypeScript completo sin errores con las versiones fijadas; compilación Worker y prueba visual en móvil/escritorio pendientes de cerrar antes de publicar.

### Validación
17 pruebas de reglas/handlers pasaron con SQLite en memoria y migraciones reales. Incluyen permisos, aislamiento entre alumnos, deduplicación, idempotencia, vencimientos de Miami, revisión y webhook firmado de fallo. Ver `docs/ADMIN_ALERTAS_OPERACION.md` para operación y límites. Actualizar el resultado final de build/TypeScript antes de publicar.
