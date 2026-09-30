# HGrand Fitness & Performance

La fuente completa recuperada de Sites está en [`site/`](site/). Lee primero [HGRAND_MASTER_CONTEXT.md](HGRAND_MASTER_CONTEXT.md) y [operación de Alertas](site/docs/ADMIN_ALERTAS_OPERACION.md).

El sitio publicado sigue alojado en Sites: https://hgrandperformance.com. Esta rama prepara la integración de H GRAND ALERTAS; no modifica la publicación actual ni la base de producción.

## Estructura
- `site/`: copia verificable de la fuente real de Sites, con la integración propuesta y pruebas. Ejecutar instalaciones, pruebas y build desde este directorio.
- `app/`, `cms/` y `package.json` de la raíz: prototipo histórico de CMS local, conservado para no destruir trabajo previo. **No es el CMS de producción y no debe desplegarse como sustituto del sitio.**
- `docs/MEMORIA_MAESTRA_HGRAND.md`: memoria histórica; las decisiones actuales y los pagos únicos se documentan en HGRAND_MASTER_CONTEXT.md.

## Validación
Desde `site/`, instalar con el `pnpm-lock.yaml` existente y ejecutar `pnpm test:admin`, `pnpm exec tsc --noEmit` y `pnpm build`.

La acción de GitHub ejecuta estas verificaciones sin desplegar. No colocar claves Stripe, VAPID, tokens o datos reales de alumnos en el repositorio.
