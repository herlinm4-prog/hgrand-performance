# Memoria maestra — HGrand Fitness & Performance

Actualizada: 24 de septiembre de 2026. Documento de continuidad para trabajar en ChatGPT Work y en este repositorio. La fuente de verdad del sitio publicado es el proyecto de Sites indicado abajo; este repositorio aún no contiene el código completo del sitio. Leer el estado real antes de cambiar o publicar algo.

## 1. Identidad y enlaces

- Marca: **HGrand Fitness & Performance**. Responsable: **Herlin Miranda**, preparador físico con más de 15 años de experiencia en fitness y bodybuilding, y experiencia como competidor.
- Servicio: preparación física premium, nutrición, entrenamiento, seguimiento y cambio de estilo de vida; modalidades online y presencial en Miami.
- Sitio público y dominio principal: https://hgrandperformance.com (también se ha referido como www.hgrandperformance.com). Dominio comprado en Namecheap y conectado al proyecto de Sites.
- Proyecto público de Sites: **HGrand Fitness & Performance**, identificador `appgprj_6ab48e62111481918fcd243e52e83015`, slug `h-grand-fitness-performance`. La consulta de Sites del 24/09/2026 indicó versión publicada 10 y URL principal anterior. El enlace original de Sites fue https://h-grand-fitness-performance.herlingym.chatgpt.site.
- Proyecto aislado de pruebas: **HGrand pruebas de alumnos**, `appgprj_6ab53af44e9c8191bda3d641ca300f7b`, https://hgrand-pruebas-alumnos.herlingym.chatgpt.site. Consulta del 24/09/2026: versión 4, acceso privado. No confundirlo con el sitio público.
- Repositorio oficial: https://github.com/herlinm4-prog/hgrand-performance. Al redactar esta memoria, su rama `main` contenía un README que describía la intención de alojar el CMS; **no es una copia verificada del código de Sites ni de toda la web**. Evitar decir que repo y web están sincronizados sin comprobarlo.

## 2. Preferencias firmes de producto y diseño

- Herlin aprobó la apariencia actual: minimalista, limpia y profesional. **No cambiar diseño, estructura visual ni identidad de la web pública sin pedirlo**. Trabajar en función y contenido dentro de su estilo.
- Logo original centrado y suficientemente visible en móvil; conservarlo sin manipularlo. Foto de Herlin en «Conoce a Herlin»: pequeña, sin fondo, al lado derecho del nombre; la preferencia era ajustar color y textura de piel para presentación moderna.
- Redacción principal en español; «online» puede quedar en inglés como término de modalidad. Sustituir expresiones vulgares como «aprende a comer» por «aprende a elegir tus alimentos».
- Precios de lanzamiento visibles y destacados; mostrar también continuidad: online US$85 por semana y presencial US$50 por sesión.
- Usar «HGrand», «H Grand Fitness & Performance» y el dominio con cuidado: no crear nuevas marcas por errores de transcripción como HGran, HGrant o AgeGrand.

## 3. Oferta y recorrido comercial decidido

- Online: bloque inicial de 4 semanas a precio regular **US$340**; oferta de lanzamiento **US$289** para las primeras cinco plazas confirmadas. Continuidad anunciada de **US$85/semana**.
- Presencial: bloque inicial de **12 sesiones por US$600**; oferta de lanzamiento **US$480** para plaza disponible. Después **US$50/sesión**.
- La oferta presencial requiere confirmar lugar y horarios disponibles antes de cobrar. Hay una consulta inicial de unos **30 minutos** por llamada o WhatsApp; en ella se acuerdan evaluación, análisis iniciales, ajustes de nutrición y comienzo.
- Recorrido objetivo: elegir plan → identificarse → revisar importe, condiciones y frecuencia → pagar en Stripe Checkout → confirmar el pago por el servidor → completar perfil y coordinar evaluación → acceder a fotos, PDF y chat. Cancelación o fallo de pago mantiene la selección para reintentar; no activa acceso de pago.
- Herlin quiere gestionar algunos precios y textos desde un **CMS** y publicar fotos de resultados y testimonios. Gestionar consentimiento y acceso adecuado antes de mostrar fotos o datos de alumnos.

## 4. Portal del alumno y CMS

- En `/cuenta` el alumno ve solo su perfil, sus fotos, sus planes de nutrición y entrenamiento en PDF y sus propios mensajes. Puede subir fotos, consultar las anteriores y descargar sus PDF.
- Incluso cuando Herlin entra en su propia cuenta, `/cuenta` debe mostrar solo su perfil. El selector de todos los alumnos pertenece a `/admin`, reservado al administrador.
- `/admin`: selección de alumnos, revisión de fotos, publicación de PDF de nutrición y entrenamiento, bandeja de conversaciones con nombre, extracto, fecha, búsqueda, historial paginado y respuesta.
- Chat privado «Chat con Herlin» como botón flotante en cuenta del alumno. Ventana adaptable a móvil/escritorio con historial, fecha/hora, envío y mensajes anteriores. Mismo historial para el alumno y la bandeja de Herlin; consultas periódicas mientras está abierta. Las consultas de datos verifican identidad y propiedad en servidor.
- Según el borrador de trabajo `HGrand_checkout_borrador.docx` (versión 4, 24/09/2026), separación de cuenta/admin, bandeja y chat flotante estaban preparados en desarrollo y compilaron; faltaba recorrido con usuarios reales antes de publicar. **No asumir que estas funciones ya están en el dominio público**. Verificar la versión actual del proyecto antes de reimplementar o desplegar.
- Mantener separados datos y archivos privados de alumnos respecto a la galería pública de resultados y testimonios.

## 5. Acceso e identidad

- La pantalla `/acceso` del proyecto de pruebas muestra «Iniciar sesión» y «Crear cuenta», pero según el borrador ambas acciones todavía comparten el proveedor de identidad de Sites. La pantalla «Continuar con ChatGPT» puede aparecer antes de la web privada.
- Herlin pidió un inicio de sesión y registro claros, sin «Continuar con ChatGPT». Para autenticar con correo/contraseña o enlace propio sin esa pantalla hay que integrar un proveedor de identidad real y revisar alojamiento/dominio. **No presentar dos botones visuales como dos métodos independientes si desembocan en el mismo proveedor**.
- El sitio de pruebas es privado; distinguir su pantalla de acceso del flujo que verá un cliente en el dominio público.

## 6. Stripe: estado real y requisitos

- Herlin indica que **su cuenta Stripe ya está configurada** y quiere conectar el checkout al sitio. Esto describe su cuenta comercial, no prueba que el checkout de producción esté enlazado.
- Stripe Checkout alojado por Stripe es la opción elegida. El servidor debe elegir un plan de una lista interna de importes; el navegador envía solo un identificador válido. La página de HGrand le comunica a Stripe qué producto/plan cobrar; Stripe recoge los datos de pago.
- Según el borrador del 24/09, el código de pruebas aceptaba **solo clave de prueba** de Stripe; sin ella señalaba que el pago de prueba no estaba conectado. La propuesta era un **pago único** por el primer bloque (Online US$289 o Presencial US$480), con verificación de pertenencia de sesión al usuario al regresar. **No había suscripción automática ni cobros reales confirmados**.
- Para pasar a real: configurar credenciales seguras en el proyecto adecuado; verificar pago y estado mediante webhook firmado e idempotente; asociar comprador, plan y pedido; probar pagos correctos, cancelados y fallidos; mostrar recibo y activar acceso únicamente tras confirmación. No colocar claves secretas ni datos de clientes en este repositorio.
- Definir por escrito antes de cobrar: renovación online de US$85/semana (manual o automática), frecuencia/fecha y política de cancelación o reembolso; disponibilidad presencial; reglas de plazas promocionales. El borrador recomendó contar las primeras cinco plazas por pagos confirmados y mostrar importe exacto antes de tarjeta.
- **Nueva petición del 24/09:** añadir sección de códigos de descuento administrada solo por Herlin. El cliente introduce código en checkout cuando Herlin se lo comparte, incluso fuera de promoción pública. Diseñar creación/desactivación, fechas de vigencia, límites de uso, planes admitidos y monto o porcentaje; validar en servidor y asegurar que el descuento que se presenta coincide con el importe de Stripe. Si se utilizan cupones/promotion codes de Stripe, sincronizar las reglas del CMS con Stripe y no confiar en cálculos del navegador. No se ha verificado implementación.
- No afirmar «Stripe conectado» hasta completar una prueba de extremo a extremo en el entorno correcto y comprobar webhook y activación.

## 7. Estado y prioridades para quien retome el trabajo

1. Leer este documento, el README, la versión actual de ambos proyectos de Sites y el borrador `HGrand_checkout_borrador.docx` antes de editar. Comprobar qué se publicó desde el último borrador: el sitio principal mostró versión 10 en la consulta del 24/09, por lo que las notas del documento pueden estar superadas.
2. Preservar la web pública que Herlin aprobó. Mantener desarrollo del alumno, CMS y checkout en un proyecto de pruebas hasta verificar el recorrido y obtener instrucción de publicación.
3. Identificar y documentar la fuente del código del sitio. **Traerla al repositorio con un método verificable** antes de afirmar que Work y GitHub comparten todo el producto. El README actual no la contiene. No reemplazar el sitio por reconstrucción incompleta.
4. Cerrar la brecha de identidad propia frente a «Continuar con ChatGPT»; conectar cuenta y pedido antes del pago.
5. Completar y probar checkout de Stripe, webhooks, promociones y códigos de descuento bajo control del administrador. Precisar renovación, cancelación, disponibilidad y cupos antes de cobros reales.
6. Completar CMS (textos, precios, fotos, testimonios), espacio privado del alumno (fotos, PDF, chat) y separación de permisos. Probar móvil y escritorio con cuentas diferentes.
7. Documentar cada cambio y su estado: preparado, en pruebas, publicado o pendiente. No confundir prueba con producción.

## 8. Fuentes y límites de esta memoria

- Conversaciones del 23–24/09/2026 sobre el sitio, oferta, CMS, portal, identidad, Stripe, descuento y petición de compartir memoria.
- `HGrand_checkout_borrador.docx` de la Biblioteca de ChatGPT, versión 4 consultada el 24/09/2026: diseño funcional y estado declarado de la rama de pruebas.
- Metadatos de Sites y repositorio GitHub consultados el 24/09/2026.
- Esto registra **decisiones y estado conocido**, no certifica una auditoría de código, pagos, sitio en vivo o sincronización entre Sites y GitHub. Si una fuente técnica más reciente contradice un estado descrito aquí, actualizar este documento con la verificación.
