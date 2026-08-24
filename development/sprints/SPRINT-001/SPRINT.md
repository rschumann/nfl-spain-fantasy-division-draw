# Sprint 001 — Implementación del sorteo

## Estado

**READY FOR REVIEW — planificación únicamente.** No hay código de producto en este sprint todavía.

## Objetivo

Construir una aplicación web de una sola pantalla que ejecute el sorteo programado de los 16 equipos de `NFL Spain`, temporada `26-27`, entre cuatro divisiones de cuatro equipos. El servidor determina el estado, revela una asignación cada 120 segundos y permite verificar el plan al finalizar.

## Resultado del sprint

Al cerrar el sprint debe existir una aplicación local completa y verificable que:

1. arranca con `DRAW_START_AT=now` en `Europe/Madrid`;
2. muestra los 16 equipos y cuatro divisiones vacías;
3. revela el primer resultado a los dos minutos;
4. revela exactamente un resultado cada dos minutos;
5. conserva cuatro equipos por división;
6. recupera el estado correcto tras recarga o caída temporal;
7. no filtra asignaciones futuras;
8. publica la prueba de integridad al terminar;
9. permite a los equipos chatear en una sala común dentro de la página;
10. supera todos los quality gates con archivos pequeños.

## Decisiones cerradas

- **Runtime:** Node.js LTS y TypeScript estricto.
- **Servidor:** Fastify.
- **Cliente:** HTML semántico, CSS y TypeScript vanilla con Vite; sin React.
- **Chat:** Firebase Auth anónima, Cloud Firestore, Security Rules y App Check; sin servidor de chat propio.
- **Persistencia:** un archivo JSON privado mediante repositorio atómico intercambiable.
- **Aleatoriedad:** semilla de 256 bits, HMAC-SHA-256 determinista, muestreo uniforme y Fisher–Yates.
- **Tiempo:** reloj del servidor inyectable; ningún cron decide las revelaciones.
- **Interfaz:** una pantalla responsive, sin panel admin, login visible, sonido automático ni animación pesada.
- **Proceso:** un solo servicio y una sola instancia escritora para el MVP.
- **Pruebas:** Vitest para unidad/integración y Playwright para E2E/accesibilidad básica.
- **Calidad:** ESLint, Prettier, TypeScript, dependency-cruiser y CI.

Las versiones exactas se fijarán en el lockfile al iniciar Task 01, usando versiones estables compatibles con el Node.js LTS vigente. No se cambia de stack sin actualizar este sprint.

## Entregables del plan

- [Arquitectura](ARCHITECTURE.md)
- [Mapa de archivos](FILE_MAP.md)
- [Tareas y commits](TASKS.md)
- [Decisión del chat](CHAT_DECISION.md)
- [Pruebas del chat](CHAT_TEST_PLAN.md)
- [Plan de pruebas](TEST_PLAN.md)
- [Runbook local y producción](RUNBOOK.md)
- [Trazabilidad](TRACEABILITY.md)

## Alcance incluido

- Scaffolding, comandos de desarrollo y CI.
- Validación completa de variables de entorno.
- Roster y divisiones declarativos.
- Motor puro de sorteo y verificador.
- Estado privado persistido de forma atómica.
- API pública read-only.
- Cuenta atrás sincronizada y cuatro tarjetas de división.
- Estados programado, directo, reconectando, finalizado y error.
- Chat común de texto integrado con Firebase Emulator Suite en local.
- Pruebas de invariantes, tiempo, recuperación, filtración y UI.
- Documentación operativa para fijar la fecha de producción más adelante.

## Fuera de alcance

- Despliegue a producción o compra de dominio.
- Escritura en ESPN.
- Panel de administración, cuentas registradas o endpoints Fastify públicos mutables.
- Múltiples sorteos simultáneos.
- WebSockets; polling es suficiente para un intervalo de dos minutos.
- Identidad fuerte de equipos, moderación, DMs, adjuntos o reacciones.
- Base de datos propia para el sorteo, colas, cron, microservicios o framework frontend.
- Cambios de diseño que no estén en `docs/specs/UI_SPEC.md`.

## Orden de ejecución

1. Quality gates y scaffolding.
2. Configuración, tipos y datos.
3. Motor determinista y compromiso hash.
4. Persistencia, bootstrap y recuperación.
5. API pública sin filtraciones.
6. Cliente y cuenta atrás.
7. Firebase, reglas y chat responsive.
8. Verificación, accesibilidad y E2E.
9. Auditoría final y documentación.

Cada paso termina con pruebas verdes y un commit pequeño antes de pasar al siguiente.

## Definition of Done

- [ ] Todos los criterios de `docs/specs/ACCEPTANCE_CRITERIA.md` aplicables a local están automatizados o documentados como UAT.
- [ ] `npm run verify` termina con código 0 desde un checkout limpio.
- [ ] Archivos escritos a mano por debajo de 180 líneas y funciones por debajo de 30.
- [ ] No hay ciclos ni importaciones contra la arquitectura.
- [ ] Cobertura global mínima cumplida y dominio crítico cubierto al 100 %.
- [ ] Playwright verifica móvil y escritorio.
- [ ] Dos navegadores intercambian mensajes usando emuladores y las reglas bloquean payloads inválidos.
- [ ] Una caída de Firebase no afecta al sorteo.
- [ ] La auditoría demuestra que la API y el cliente no contienen resultados futuros.
- [ ] Una prueba acelerada completa asigna 16 equipos sin duplicados y cuatro por división.
- [ ] Una prueba real de 120 segundos confirma el comportamiento temporal.
- [ ] Estado persistido recuperado correctamente tras reinicio.
- [ ] README y runbook reflejan comandos reales.
- [ ] Árbol Git limpio y commits atómicos.

## Stop gates

- No implementar hasta que el propietario apruebe este sprint.
- No desplegar sin fecha/hora ISO 8601 explícita y alojamiento con volumen persistente.
- No desplegar chat con reglas de test, App Check desactivado o configuración de emuladores.
- No usar `Math.random()`, estado completo en cliente o temporizador de navegador como autoridad.
- No regenerar un sorteo de producción después del bloqueo.
- Si una futura plataforma no ofrece almacenamiento persistente privado, cambiar solo el adaptador de repositorio y revisar el runbook antes del despliegue.
