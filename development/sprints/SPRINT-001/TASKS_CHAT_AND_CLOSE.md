# Tasks 07–10 — Chat, verificación y cierre

Continuación de [TASKS.md](TASKS.md). Mantener el mismo protocolo de stop gates y commits atómicos.

## Task 07 — Firebase y reglas

**Objetivo:** preparar el canal gestionado con seguridad deny-by-default.

**Trabajo:**

- Configurar Firebase Emulator Suite para Auth y Firestore.
- Añadir SDK modular Firebase y configuración pública validada.
- Conectar emuladores solo cuando el flag local está activo.
- Implementar anonymous sign-in.
- Crear rules con sala única, payload exacto, UID propio y timestamp servidor.
- Denegar update/delete y cualquier colección no declarada.
- Preparar App Check para producción sin ejecutarlo contra emuladores.

**Prueba:** rules-unit-testing cubre cada allow y deny de `CHAT_TEST_PLAN.md`.

**Stop gate:** CI usa únicamente project id `*-local`; reglas default-deny verdes.

**Commit:** `feat: secure managed league chat foundation`

## Task 08 — UI y lifecycle del chat

**Objetivo:** integrar un chat simple sin restar protagonismo al sorteo.

**Trabajo:**

- Selector de identidad local desde los 16 equipos.
- Repository subscribe/send, último bloque de 100 y client message id.
- Controller para connecting/ready/offline/error y unread.
- Sidebar desktop y bottom sheet móvil.
- Composer 500 caracteres, Enter/Shift+Enter y retry.
- Render con `textContent`, scroll inteligente y live region.
- Aislar todos los errores de Firebase del draw controller.

**Prueba:** unit + E2E con dos browser contexts, offline, XSS text fixture y foco móvil.

**Stop gate:** B recibe mensaje de A sin reload; bloquear Firebase no afecta timer/divisiones.

**Commit:** `feat: add responsive league chat`

## Task 09 — Verificación final del sorteo

**Objetivo:** hacer comprobable el sorteo después de la asignación 16.

**Trabajo:**

- Mostrar compromiso abreviado antes y durante el evento.
- Exponer payload de verificación solo al finalizar.
- Añadir acción de copiar y verificador local de hash/invariantes.
- Mostrar resultado claro de verificación sin jerga innecesaria.

**Prueba:** payload válido, hash alterado, seed alterada y assignment alterada.

**Stop gate:** modificar un byte produce verificación fallida.

**Commit:** `feat: publish completed draw verification`

## Task 10 — Auditoría y cierre

**Objetivo:** demostrar que el MVP completo cumple el contrato.

**Trabajo:**

- Ejecutar test acelerado de las 16 posiciones.
- Ejecutar prueba real con intervalo 120 s para fronteras iniciales.
- Simular caída/reentrada del servidor y caída aislada de Firebase.
- Revisar bundle/API/logs por resultados futuros y credenciales admin.
- Ejecutar audit de dependencias, Rules y App Check review.
- Actualizar README/runbook con comandos verificados.
- Registrar cualquier excepción explícita.

**Stop gate:** Definition of Done y trazabilidad en PASS, sin skips ocultos.

**Commit:** `docs: close sprint 001 implementation evidence`

## Prohibiciones

- No habilitar Firestore test mode en producción.
- No incluir service-account JSON, admin key o secret de reCAPTCHA en cliente/repositorio.
- No presentar el cooldown cliente como rate limit seguro.
- No bloquear el sorteo si el chat falla.
- No añadir presencia, DMs, adjuntos, reacciones o moderación dentro de este sprint.
