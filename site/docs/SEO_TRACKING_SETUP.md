# Configuración pendiente para HGrand

El sitio ya incluye Open Graph, iconos PWA, JSON-LD y eventos. Para activar analítica, configurar en el despliegue:

- `NEXT_PUBLIC_GA4_ID`: identificador GA4 (`G-...`).
- `NEXT_PUBLIC_META_PIXEL_ID`: ID del píxel de Meta.
- `NEXT_PUBLIC_GOOGLE_ADS_ID`: ID `AW-...`; para conversiones reales de Ads añadir la etiqueta de conversión `AW-.../label` y emitirla al confirmar una reserva o un pago, no al pulsar un botón.

Los eventos definidos son `checkout_click`, `whatsapp_request` y `email_contact_prepare`. Estos representan interacciones; preparar un correo o abrir WhatsApp no demuestra que se haya enviado un mensaje ni que se haya comprado un plan. Antes de habilitar tecnologías de remarketing, actualizar la política de privacidad y el mecanismo de consentimiento aplicable.

No se publican dirección exacta, coordenadas, horario, perfiles sociales, certificaciones, número de clientes, valoraciones o videos sin datos confirmados. Para agregar una reserva directa hace falta una URL pública real de Calendly o Cal.com. Añadir `/en/` y hreflang solo al publicar páginas traducidas completas.
