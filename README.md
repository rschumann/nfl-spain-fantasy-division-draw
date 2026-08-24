# NFL Spain Fantasy — Sorteo de Divisiones

Aplicación pública y minimalista para sortear los 16 equipos de la liga NFL Spain Fantasy entre cuatro divisiones equilibradas. El sorteo empieza en una fecha programada y revela una asignación nueva cada dos minutos.

## Estado

**Fase actual: definición y especificación.** Todavía no hay implementación.

## Documentación

- [Definición del proyecto](docs/PROJECT_DEFINITION.md)
- [Especificación del producto](docs/specs/PRODUCT_SPEC.md)
- [Reglas del sorteo](docs/specs/DRAW_RULES.md)
- [Configuración por entorno](docs/specs/CONFIGURATION.md)
- [Especificación de interfaz](docs/specs/UI_SPEC.md)
- [Criterios de aceptación](docs/specs/ACCEPTANCE_CRITERIA.md)

## Configuración confirmada

- Liga: `NFL Spain`.
- Temporada: `26-27`.
- Zona horaria: `Europe/Madrid`.
- Pruebas locales: `DRAW_START_AT=now`, resuelto al arrancar el servidor local.
- Producción: fecha y hora todavía pendientes.

La plantilla versionada está en [`.env.example`](.env.example). La configuración local activa vive en `.env.local` y no se versiona.
