# Trazabilidad del Sprint 001

| Requisito | Implementación prevista | Evidencia requerida |
|---|---|---|
| RF-01 Config bloqueada | env schema, fingerprint, bootstrap | config + recovery tests |
| RF-02 Plan balanceado | `invariants`, `create-plan` | 10.000 seeds válidas |
| RF-03 Orden aleatorio | HMAC stream, rejection sampling, shuffle | vectors + reproducibility |
| RF-04 Revelación progresiva | `public-state`, server Clock | boundary tests por posición |
| RF-05 Cuenta atrás | `server-time`, polling | unit + Playwright |
| RF-06 Recarga/reentrada | API derivada de tiempo, state file | recovery integration/E2E |
| RF-07 Finalización | public projection + final UI | completed E2E |
| RF-08 Verificación | canonical payload + SHA-256 | tamper tests |
| RF-09 Sin filtraciones | DTO allowlist, private repository | recursive payload/bundle scan |
| RF-10 Hora servidor | Clock port y `serverNow` | skew tests |
| RF-11 Chat de liga | Firebase Auth/Firestore + chat modules | rules + two-browser E2E |

## Requisitos no funcionales

| Área | Gate |
|---|---|
| Responsive | Playwright 360/768/1440 |
| Accesibilidad | keyboard, axe, live region, reduced motion |
| Rendimiento | sin framework UI, assets pequeños, sin vídeo |
| Resiliencia | atomic write, restart, stale-response guard |
| Idempotencia | solo GET y plan bloqueado |
| Seguridad | CSP, no-store, textContent, no leakage |
| Aislamiento chat | Firebase failure E2E; draw stays usable |
| Modularity | 180 líneas archivo, 30 función, no cycles |

## Evidencias de cierre

Al terminar la implementación, completar esta tabla con comando, exit code y archivo de evidencia. Un merge o commit no sustituye pruebas.

| Gate | Comando | Resultado | Evidencia |
|---|---|---|---|
| Format | `npm run format:check` | PENDING | — |
| Lint/size | `npm run lint` | PENDING | — |
| Types | `npm run typecheck` | PENDING | — |
| Boundaries | `npm run deps:check` | PENDING | — |
| Unit/integration | `npm run test:coverage` | PENDING | — |
| Build | `npm run build` | PENDING | — |
| E2E | `npm run test:e2e` | PENDING | — |
| Full gate | `npm run verify` | PENDING | — |
| Real 120 s check | Manual | PENDING | — |
| No-leakage audit | Automated + manual | PENDING | — |
| Firebase Rules | `npm run test:rules` | PENDING | — |
| Chat E2E | `npm run test:e2e -- chat.spec.ts` | PENDING | — |

## Estado actual

Todos los gates están `PENDING` porque este sprint contiene planificación, no implementación. No declarar el sprint completado hasta que cada fila tenga evidencia reproducible.
