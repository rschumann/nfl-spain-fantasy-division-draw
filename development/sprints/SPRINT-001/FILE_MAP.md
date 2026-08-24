# Mapa de archivos previsto

## Límites

- Objetivo por módulo: 80–120 líneas físicas.
- Máximo source/test/script/CSS: 179 líneas.
- Máximo función: 29 líneas.
- Sin archivos `utils.ts`, `helpers.ts`, `common.ts` o `misc.ts` genéricos.
- Un módulo nuevo necesita una responsabilidad concreta y pruebas cercanas.

## Configuración raíz

| Archivo | Responsabilidad |
|---|---|
| `package.json` | Scripts y dependencias mínimas |
| `tsconfig.json` | TypeScript estricto compartido |
| `vite.config.ts` | Build cliente y proxy local |
| `vitest.config.ts` | Unidad, integración y cobertura |
| `eslint.config.js` | Calidad, tamaños e importaciones |
| `.dependency-cruiser.cjs` | Capas y ciclos |
| `.prettierrc.json` | Formato único |
| `playwright.config.ts` | Navegadores y servidor E2E |
| `config/teams.json` | Los 16 nombres aprobados |
| `config/divisions.json` | `NORTH`, `EAST`, `WEST`, `SOUTH` |
| `firebase.json` | Emuladores y deploy de reglas/índices |
| `firestore.rules` | Acceso deny-by-default y validación de mensajes |
| `firestore.indexes.json` | Query aprobada del chat |

## Dominio y aplicación

| Archivo | Responsabilidad |
|---|---|
| `src/domain/types.ts` | Tipos de equipo, división, plan y estado |
| `src/domain/invariants.ts` | Validar 16/4/4, unicidad y fechas |
| `src/domain/random-stream.ts` | Flujo HMAC determinista y entero uniforme |
| `src/domain/shuffle.ts` | Fisher–Yates puro |
| `src/domain/create-plan.ts` | Construir las 16 asignaciones |
| `src/domain/commitment.ts` | Canonicalizar, hash y verificación |
| `src/domain/public-state.ts` | Filtrar por tiempo y crear DTO seguro |
| `src/application/ports.ts` | Interfaces Clock, Entropy y Repository |
| `src/application/initialize-draw.ts` | Crear o recuperar el evento bloqueado |
| `src/application/get-public-draw.ts` | Caso de uso de lectura pública |

## Adaptadores y servidor

| Archivo | Responsabilidad |
|---|---|
| `src/config/env-schema.ts` | Esquema y reglas cross-field |
| `src/config/load-config.ts` | Convertir env a configuración tipada |
| `src/adapters/system-clock.ts` | Implementación de reloj real |
| `src/adapters/node-entropy.ts` | Semilla segura de 32 bytes |
| `src/adapters/file-draw-repository.ts` | Read/write atómico y permisos privados |
| `src/server/bootstrap.ts` | Composition root y lifecycle |
| `src/server/app.ts` | Crear Fastify, seguridad y estáticos |
| `src/server/routes/draw-route.ts` | `GET /api/draw` |
| `src/server/routes/health-route.ts` | `GET /api/health` |
| `src/server/index.ts` | Entry point mínimo y errores fatales |

## Cliente

| Archivo | Responsabilidad |
|---|---|
| `src/web/index.html` | Estructura semántica y mounts |
| `src/web/main.ts` | Composition root del navegador |
| `src/web/api.ts` | Fetch, validación y no-regresión |
| `src/web/server-time.ts` | Offset y segundos restantes |
| `src/web/polling.ts` | Ciclo de actualización y eventos de red |
| `src/web/view-model.ts` | DTO a modelo presentable |
| `src/web/render-header.ts` | Estado, título y temporizador |
| `src/web/render-divisions.ts` | Cuatro tarjetas y slots |
| `src/web/render-pending.ts` | Equipos pendientes y progreso |
| `src/web/render-verification.ts` | Hash y verificación final |
| `src/web/chat/firebase-client.ts` | Inicializar SDK, emuladores y App Check |
| `src/web/chat/chat-auth.ts` | Sesión anónima y UID |
| `src/web/chat/chat-identity.ts` | Selección/persistencia local de equipo |
| `src/web/chat/chat-repository.ts` | Subscribe/send de mensajes tipados |
| `src/web/chat/chat-controller.ts` | Estado, unread y lifecycle |
| `src/web/chat/render-chat.ts` | Lista, composer y estados seguros |
| `src/web/chat/chat-sheet.ts` | Sidebar/bottom sheet y foco |
| `src/web/styles/tokens.css` | Colores, tipografía y espacios |
| `src/web/styles/layout.css` | Grid responsive y contenedores |
| `src/web/styles/components.css` | Tarjetas, timer y estados |

## Pruebas y automatización

| Archivo | Responsabilidad |
|---|---|
| `tests/fixtures/draw-fixtures.ts` | Datos tipados reutilizables, sin lógica |
| `tests/unit/config.test.ts` | Matriz de env válida/inválida |
| `tests/unit/random-stream.test.ts` | Vectores y ausencia de sesgo observable básico |
| `tests/unit/create-plan.test.ts` | Invariantes y reproducibilidad |
| `tests/unit/commitment.test.ts` | Canonicalización y tamper detection |
| `tests/unit/public-state.test.ts` | Fronteras temporales exactas |
| `tests/integration/repository.test.ts` | Escritura atómica, permisos y recuperación |
| `tests/integration/draw-api.test.ts` | Contrato, no-store y estado por tiempo |
| `tests/integration/no-leakage.test.ts` | Ausencia de seed/resultados futuros |
| `tests/rules/firestore.rules.test.ts` | Auth, schema, sala y permisos |
| `tests/unit/chat-identity.test.ts` | Team ids y local persistence |
| `tests/unit/chat-controller.test.ts` | Estado, retry y unread |
| `tests/e2e/draw-flow.spec.ts` | Programado, directo y finalizado |
| `tests/e2e/recovery.spec.ts` | Recarga, red y reentrada |
| `tests/e2e/accessibility.spec.ts` | Teclado, anuncios y viewport móvil |
| `tests/e2e/chat.spec.ts` | Dos sesiones, envío, offline y sheet |
| `scripts/verify-private-path.mjs` | Bloquear state path dentro de assets |
| `.github/workflows/ci.yml` | Quality gate reproducible |

## Dependencias permitidas

Producción: `fastify`, plugins oficiales mínimos de estáticos/seguridad, `zod` y SDK modular `firebase`. Cliente sin dependencias de framework. Desarrollo: TypeScript, Vite, Vitest, Playwright, `@axe-core/playwright`, Firebase CLI/rules testing, ESLint, Prettier y dependency-cruiser.

No añadir una librería para funciones cubiertas claramente por Node, DOM o `Intl`.
