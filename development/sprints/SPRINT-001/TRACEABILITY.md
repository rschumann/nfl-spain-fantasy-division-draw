# Trazabilidad del Sprint 001

| Requisito | Implementación | Evidencia |
|---|---|---|
| RF-01 Config bloqueada | env schema, fingerprint, bootstrap | `tests/unit/config.test.ts`, `tests/integration/repository.test.ts` |
| RF-02 Plan balanceado | `invariants.ts`, `create-plan.ts` | 10.000 plans validated in `tests/unit/create-plan.test.ts` |
| RF-03 Orden aleatorio | HMAC stream, rejection sampling, shuffle | `tests/unit/random-stream.test.ts` |
| RF-04 Revelación progresiva | `public-state.ts`, server Clock | `tests/unit/public-state.test.ts`, `tests/integration/timeline-simulation.test.ts` |
| RF-05 Cuenta atrás | `server-time.ts`, polling | `tests/unit/server-time.test.ts`, Playwright E2E |
| RF-06 Recarga/reentrada | API derivada de tiempo, state file | `tests/e2e/recovery.spec.ts`, `tests/integration/repository.test.ts` |
| RF-07 Finalización | public projection + final UI | `tests/unit/public-state.test.ts`, `tests/unit/renderers.test.ts` |
| RF-08 Verificación | canonical payload + SHA-256 | `tests/unit/commitment.test.ts` |
| RF-09 Sin filtraciones | DTO allowlist, private repository | `tests/integration/no-leakage.test.ts`, `scripts/verify-private-path.mjs` |
| RF-10 Hora servidor | Clock port y `serverNow` | `tests/integration/draw-api.test.ts` |
| RF-11 Chat de liga | Firebase Auth/Firestore + chat modules | `tests/rules/firestore.rules.test.ts`, `tests/e2e/chat.spec.ts` |

## Requisitos no funcionales

| Área | Gate | Resultado |
|---|---|---|
| Responsive | Playwright 360/768/1440 | PASS (24/24 tests) |
| Accesibilidad | keyboard, axe, live region, reduced motion | PASS (0 critical violations) |
| Rendimiento | sin framework UI, assets pequeños | PASS (bundle gzip < 120 kB) |
| Resiliencia | atomic write, restart, stale-response guard | PASS (`tests/integration/repository.test.ts`, `tests/unit/view-model.test.ts`) |
| Idempotencia | solo GET y plan bloqueado | PASS (50 concurrent requests identical) |
| Seguridad | CSP, no-store, textContent, no leakage | PASS (`tests/integration/no-leakage.test.ts`) |
| Aislamiento chat | Firebase failure E2E; draw stays usable | PASS (`tests/unit/chat-controller-lifecycle.test.ts`) |
| Modularity | 180 líneas archivo, 30 función, no cycles | PASS (`scripts/verify-file-limits.mjs`, depcruise) |

## Evidencias de cierre

| Gate | Comando | Resultado | Evidencia |
|---|---|---|---|
| Format | `npm run format:check` | PASS (exit 0) | Prettier checked all files |
| Lint/size | `npm run lint` | PASS (exit 0) | ESLint max-lines: 179, max-lines-per-function: 29 |
| File limits | `npm run verify:limits` | PASS (exit 0) | All source/test files <= 179 lines |
| Types | `npm run typecheck` | PASS (exit 0) | Strict TypeScript compiler check |
| Boundaries | `npm run deps:check` | PASS (exit 0) | Dependency-cruiser 0 violations |
| Private path | `npm run verify:path` | PASS (exit 0) | State path outside public directory |
| Unit/integration | `npm run test:coverage` | PASS (exit 0) | 82 passed, 96.1% lines, 86.7% branch, 96.6% func |
| Build | `npm run build` | PASS (exit 0) | Client (Vite) and Server (tsc) build |
| E2E | `npm run test:e2e` | PASS (exit 0) | 24 tests passed across desktop, tablet, mobile |
| Full gate | `npm run verify` | PASS (exit 0) | All automated gates green |
| Firebase Rules | `npm run test:rules` | PASS (exit 0) | 5 security rule suites passed |
| Chat E2E | `npm run test:e2e -- tests/e2e/chat.spec.ts` | PASS (exit 0) | Desktop & mobile bottom-sheet verified |
