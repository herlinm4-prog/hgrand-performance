# H GRAND Food Science — MVP aislado

## Estado
Desarrollo en `feature/food-science-mvp`. **No está publicado en hgrandperformance.com**. El sitio público funciona en Sites; este repositorio no tiene una copia verificada de la fuente de producción. No fusionar ni desplegar como sustitución del sitio actual.

## Incluye
- `/alimentos`: búsqueda por nombre, atajos, búsqueda por código de barras, selección de coincidencia y porciones de 1 a 10.000 g.
- `/api/alimentos`: Open Food Facts y USDA FoodData Central cuando exista `USDA_API_KEY` en entorno del servidor.
- Valores faltantes marcados como N/D, nunca rellenados por IA. IG y carga glucémica quedan sin calcular cuando no hay mediciones verificadas.
- Citas y advertencias de terceros, fuente individual, diseño blanco/plata/negro, móvil y escritorio.

## Configuración
1. Definir `USDA_API_KEY` (crear clave gratuita en https://fdc.nal.usda.gov/api-key-signup).
2. Definir `OFF_USER_AGENT` como `HGrandFoodScience/0.1 (contacto@dominio-propio)`, con un correo real bajo control del propietario. El User-Agent por defecto es temporal.
3. Instalar dependencias del repositorio y ejecutar `npm run build` y pruebas de integración en un entorno con acceso a red.
4. Revisar los términos Open Food Facts ODbL/atribución, así como la calidad de datos, límites de API y derechos de imágenes. Activar límites y caché distribuidos antes de tráfico alto.

## Pruebas necesarias
- Búsqueda por nombre, unicode, consultas vacías y límite de longitud.
- Código de barras EAN/UPC válido, código no encontrado.
- Sin API USDA, clave USDA errónea, proveedores caídos y límites de petición.
- Producto con nutrientes ausentes, valores cero y conversiones de 50/100/150/250 g.
- Móvil y escritorio; navegación por teclado; verificación de la API.
- Confirmar campos USDA basados en 100 g para cada tipo de registro y priorizar verificación del envase.
- No exponer claves en el cliente; evitar compartir datos privados de usuarios.

## Integración posterior
Tras conseguir una copia verificable del código de Sites, adaptar esta página a sus componentes globales y añadir el enlace de navegación. Hacerlo en rama de pruebas con reversión; validar el sitio, pagos, cuentas y el módulo antes de desplegar. No reemplazar producción con este repositorio.

## Restricciones
La interfaz no afirma exactitud absoluta. No se ha podido ejecutar un build ni pruebas funcionales en esta sesión, y el repositorio no es la fuente del sitio publicado.
