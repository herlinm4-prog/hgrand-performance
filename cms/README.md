# HGrand CMS

CMS mínimo y desacoplado para HGrand Performance.

## Alcance

### Resultados / Galería
- Subir fotografías
- Título y descripción opcionales
- Orden de publicación
- Estado borrador/publicado
- Ocultar sin eliminar
- Eliminar

### Testimonios
- Nombre del cliente
- Testimonio
- Fotografía opcional
- Resultado o transformación opcional
- Estado borrador/publicado
- Orden

## Regla principal
El CMS no controla ni modifica el diseño, textos, precios ni estructura general del website. Solo suministra datos para las secciones de Resultados y Testimonios.

## Rutas previstas
- /admin
- /admin/resultados
- /admin/testimonios

## Arquitectura prevista
- Panel responsive mobile-first
- Autenticación privada
- Base de datos para metadatos
- Object storage para imágenes
- API de lectura pública
- API administrativa protegida
