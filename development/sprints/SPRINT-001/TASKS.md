# Tareas y secuencia de commits

## Regla de ejecución

Una tarea no empieza hasta que la anterior cumple su stop gate. Cada commit añade una capacidad coherente, sus pruebas y la documentación afectada. No usar `git add .`.

Este archivo cubre Tasks 01–06. Continuación: [chat, verificación y cierre](TASKS_CHAT_AND_CLOSE.md).

## Task 01 — Scaffolding y quality gates

**Objetivo:** crear el proyecto TypeScript sin comportamiento de producto.

**Trabajo:**

- Inicializar `package.json` y lockfile con Node.js LTS.
- Configurar TypeScript estricto, Vite, Vitest, Playwright, Firebase Emulator Suite, ESLint y Prettier.
- Enforce 180 líneas por archivo y 30 por función.
- Configurar dependency-cruiser para capas y ciclos.
- Crear `npm run dev`, `build`, `typecheck`, `lint`, `format:check`, `test`, `test:e2e`, `deps:check` y `verify`.
- Crear CI sobre checkout limpio.

**Prueba:** proyecto vacío compila; gates fallan con fixtures deliberadamente inválidos y pasan tras retirarlos.

**Stop gate:** `npm run verify` verde sin saltos.

**Commit:** `chore: scaffold strict TypeScript quality gates`

## Task 02 — Configuración y datos

**Objetivo:** convertir env y roster en entradas tipadas e inmutables.

**Trabajo:**

- Añadir los 16 equipos y cuatro divisiones como JSON declarativo.
- Implementar esquema Zod y reglas cross-field.
- Resolver `DRAW_START_AT=now` una sola vez usando Clock.
- Normalizar start time a UTC y conservar `Europe/Madrid` para presentación.
- Calcular fingerprint de configuración.
- Rechazar reset/now en producción, paths públicos y configuración cloud en local/CI.

**Prueba:** tabla completa de valores válidos, ausentes, inválidos y combinaciones prohibidas.

**Stop gate:** ninguna variable se lee fuera de `load-config.ts`.

**Commit:** `feat: validate draw configuration and roster`

## Task 03 — Motor del sorteo

**Objetivo:** producir un plan balanceado, reproducible y comprometido.

**Trabajo:**

- Implementar flujo HMAC-SHA-256 con separación de dominios.
- Implementar entero uniforme por rejection sampling.
- Implementar Fisher–Yates puro.
- Crear slots 4 × división y emparejarlos con equipos barajados.
- Calcular los 16 `revealAt`.
- Canonicalizar payload y calcular SHA-256.
- Implementar verificador independiente.

**Prueba:** vectores fijos, misma seed/mismo plan, seeds distintas, 10.000 planes con invariantes, detección de cualquier alteración.

**Stop gate:** dominio crítico con 100 % de branches y sin imports de infraestructura.

**Commit:** `feat: create verifiable balanced draw plan`

## Task 04 — Persistencia y bootstrap

**Objetivo:** bloquear el plan una vez y recuperarlo sin mutaciones.

**Trabajo:**

- Implementar repositorio JSON privado.
- Validar schema al leer.
- Escribir temp file, `fsync`, chmod `0600` y rename atómico.
- Crear o recuperar plan durante bootstrap.
- En local resetear solo con flag explícito y path permitido.
- En producción abortar si fingerprint o event id no coinciden.
- Evitar serializar estado privado en logs.

**Prueba:** primera creación, reinicio, archivo corrupto, mismatch, permisos y fallo simulado antes del rename.

**Stop gate:** reinicio conserva exactamente seed, hash y asignaciones.

**Commit:** `feat: persist locked draw state atomically`

## Task 05 — API pública read-only

**Objetivo:** entregar solo el estado que corresponde a la hora del servidor.

**Trabajo:**

- Implementar `get-public-draw` con Clock inyectado.
- Crear `GET /api/draw` y `GET /api/health`.
- Validar DTO de salida.
- Añadir `Cache-Control: no-store`, Helmet/CSP y manejo seguro de errores.
- Servir assets sin exponer state path.

**Prueba:** frontera `T0`, cada ±1 ms de reveal, completado, headers, concurrent reads y payload scan.

**Stop gate:** integración confirma que seed y asignaciones futuras no aparecen en body, headers o logs.

**Commit:** `feat: expose server-authoritative public draw API`

## Task 06 — Interfaz del sorteo

**Objetivo:** implementar la pantalla simple definida en UI spec.

**Trabajo:**

- HTML semántico, tokens CSS y grid 4/2/1.
- Cuenta atrás basada en offset del servidor.
- Renderizar cabecera, divisiones, pendientes, progreso y última asignación.
- Poll de cinco segundos y refresh en cero/focus/online.
- Rechazar regresión de respuestas antiguas.
- Estado reconectando sin resultados inventados.
- Live region y `prefers-reduced-motion`.

**Prueba:** unit tests de tiempo/view-model y Playwright desktop/mobile.

**Stop gate:** flujo usable a 360 px, teclado completo y cero scroll horizontal.

**Commit:** `feat: render responsive timed division draw`

## Política de desviaciones

- Bug necesario para cumplir spec: corregir dentro de la tarea y añadir regresión.
- Requisito imprescindible no contemplado: actualizar sprint antes de implementar.
- Mejora opcional: mover a backlog; no expandir el MVP.
- Cambio de stack o persistencia: requiere decisión explícita del propietario.
