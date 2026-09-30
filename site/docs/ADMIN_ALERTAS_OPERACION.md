# H GRAND ALERTAS — operación y validación

## Fuente y despliegue
El código parte de la fuente real de Sites, commit `324344abe4fbeea94f19a7ffd7a9b27cce7264fe`. No publicar el antiguo prototipo CMS del directorio raíz de GitHub. La copia completa se conserva en `site/` en GitHub para revisión; Sites sigue siendo el alojamiento de producción.

Aplicar migraciones Drizzle a través del despliegue normal de Sites. `0013_hgrand_alertas.sql` es aditiva: cinco tablas nuevas, sin borrar o alterar tablas anteriores. Nunca ejecutar los fixtures de pruebas sobre producción.

## Qué cambia
- `/admin/alertas` y sección Alertas del escritorio: filtros, prioridad, contadores, lectura, resolución, posposición 24 h e historial manual.
- Las alertas se derivan de las tablas existentes; una conversación tiene una alerta que reaparece cuando llega otro mensaje. Las fotos del mismo alumno/día se agrupan. Un pago manual se gestiona mediante las propuestas existentes, nunca creando una suscripción.
- Los vencimientos usan fechas de Miami y aparecen desde siete días antes. Se cierran cuando cambia su condición de origen o por acción del administrador. Resolver una alerta no registra un pago.
- Los enlaces incluyen alumno/correo para abrir directamente chat, expediente, ficha o cobro.
- Check-ins privados: peso, grasa corporal, masa muscular, cintura, comentario, revisión y próxima fecha. Las fotos siguen en R2; no se duplican. Un check-in por alumno/fecha, con idempotencia de reintentos.
- El administrador puede editar nombre, teléfono, plan, inicio y notas privadas en la ficha existente.
- Stripe conserva pagos únicos. Se añade reconocimiento firmado de `checkout.session.async_payment_failed`; este evento nunca inserta un pago confirmado.

## PWA / Web Push
Manifest específico de Admin, iconos existentes reutilizados y service worker sin caché de páginas/API/archivos privados. Inicio `/admin/alertas`, ámbito `/admin/`. Mantiene el manifest público previo.

En iPhone requiere instalar desde Safari en pantalla de inicio. Web Push requiere iOS 16.4+, apertura desde el icono y permiso solicitado tras tocar el botón. No hay widget nativo ni soporte offline para expedientes.

Infraestructura de envío preparada, NO configurada en producción:
- `WEB_PUSH_PUBLIC_KEY`: clave pública VAPID P-256, base64url.
- `WEB_PUSH_PRIVATE_JWK`: JWK privada P-256, solo secreto en servidor.
- `WEB_PUSH_SUBJECT`: contacto VAPID `mailto:` o HTTPS válido.
- `HGRAND_ALERT_JOB_TOKEN`: secreto aleatorio independiente para el trabajo programado.
- Programar externamente `POST /api/admin/push/dispatch` con `Authorization: Bearer <HGRAND_ALERT_JOB_TOKEN>`, p. ej. cada 5 minutos. No se creó ningún trabajo cloud ni se modificaron secretos.
- Generar las claves mediante Web Crypto P-256 y guardarlas mediante la gestión de secretos de Sites; no incluirlas en GitHub.
- Registrar cada dispositivo desde el botón de la PWA, probar entrega con la app cerrada y revocación del permiso.

El envío usa Web Push con cuerpo vacío y VAPID; el worker muestra solo un aviso genérico. No envía nombres, importes ni datos médicos a la pantalla bloqueada. Los destinos push están limitados a los servicios de Apple, Mozilla y Google, sin redirecciones. Se deduplica por dispositivo, evento, versión y nivel de prioridad; los endpoints expirados se eliminan. Las reservas interrumpidas se recuperan tras diez minutos. Se requiere prueba real de proveedores/dispositivo antes de declarar push operativo.

Fuentes de plataforma: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ y https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers

## Pruebas
`node --import ./tests/runtime-hooks.mjs --test tests/*.test.mjs`

Las pruebas usan SQLite en memoria, migraciones reales y handlers de producción con identidad/runtime de prueba aislados. No realizan peticiones Stripe ni push reales.

Antes de publicar:
1. Instalación con el lockfile existente, TypeScript y build de Worker.
2. Probar interfaz en escritorio y en iPhone: apertura de alertas, enlace al alumno, respuesta en chat, revisión de check-in, posposición y navegación.
3. Verificar permisos con dos alumnos y entrenador en el entorno alojado.
4. Configurar y probar Web Push si se desea activarlo.
5. Confirmar que el sitio público, login y checkout siguen funcionando. No ejecutar un cobro real como prueba automática.

## Límites pendientes
- Suscripciones automáticas: no existen en la base auditada y no se implementan silenciosamente sobre los pagos únicos. Requieren flujo explícito de contratación, eventos de suscripción y precios recurrentes de Stripe.
- Falta pago real completo/webhook/activación verificados en producción.
- No se ha validado PWA instalada ni entrega push en un iPhone real.
- La actualización de la bandeja se hace al abrir y cada 30 segundos en primer plano. Para avisos con la app cerrada es obligatorio programar el endpoint de envío.
- El historial de notificaciones registra acciones de la bandeja; no pretende reemplazar un registro completo de auditoría de todas las modificaciones antiguas del CMS.
