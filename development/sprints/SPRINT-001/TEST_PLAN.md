# Plan de pruebas

## Estrategia

Probar el dominio con clock y seed fijos; probar infraestructura en directorios temporales; probar la UI contra un servidor real controlado. Ningún test depende de internet ni de la hora real salvo la prueba manual marcada.

El chat tiene un plan separado en [CHAT_TEST_PLAN.md](CHAT_TEST_PLAN.md) y usa Firebase Emulator Suite; CI nunca escribe en un proyecto cloud.

## Gates cuantitativos

- Cobertura global: 90 % lines/statements/functions y 85 % branches.
- `src/domain/**`: 100 % branches y funciones.
- Cero tests skipped en CI.
- Cero errores de consola en E2E.
- Cero violations críticas en axe sobre la pantalla principal.

## Matriz de dominio

### Invariantes

- 16 equipos únicos y cuatro divisiones únicas.
- Cuatro slots exactos por división.
- Cada equipo aparece una vez.
- Posiciones consecutivas 1–16.
- Fechas separadas exactamente 120 segundos.
- Rechazo de duplicados, cantidades incorrectas y tiempos inválidos.

### Aleatoriedad determinista

- Seed conocida produce vector conocido.
- Misma seed/config produce mismo plan/hash.
- Cambiar seed cambia plan.
- Dominios `teams` y `division-slots` generan flujos distintos.
- Rejection sampling no acepta valores fuera del rango uniforme.
- 10.000 seeds mantienen todas las invariantes; no se usa como prueba criptográfica estadística.

### Compromiso

- Serialización estable entre ejecuciones.
- UTF-8 y nombres con espacios conservados.
- Timestamps normalizados.
- Cambiar seed, equipo, división, posición o fecha cambia el hash.
- Payload final reproduce el plan y valida el compromiso.

## Matriz temporal

Para cada posición `n`:

- `revealAt(n) - 1 ms`: posición oculta.
- `revealAt(n)`: posición visible.
- `revealAt(n) + 1 ms`: posición visible.

Casos adicionales:

- Antes de `T0`: `scheduled`, cero revelados.
- Exactamente `T0`: `running`, cero revelados y 120 s restantes.
- `T0 + 1.920 s`: `complete`, 16 revelados y verificación presente.
- Clock del navegador adelantado/atrasado no altera API.
- Respuesta atrasada con menor progreso no hace regresión en UI.

## Configuración

- Cada variable obligatoria ausente.
- `now` permitido solo local.
- Reset permitido solo local.
- Zona IANA inválida.
- Timestamp sin offset o imposible.
- Intervalo cero, negativo, decimal o distinto de 120 en producción.
- State path dentro de raíz pública.
- Event id/config fingerprint distinto al estado guardado.
- Puerto y host inválidos.

## Persistencia

- Creación inicial y permisos `0600`.
- Segunda apertura devuelve bytes lógicamente equivalentes.
- Archivo corrupto falla cerrado.
- Fallo de escritura no destruye el archivo anterior.
- Temp file no se interpreta como estado confirmado.
- Reinicio en posiciones 0, 7 y 16 conserva plan.
- Logs no contienen `seedHex` ni objetos assignment futuros.

## API

- DTO scheduled/running/complete contra schema.
- `Cache-Control: no-store` en draw y errores.
- Health no revela paths/config/seed.
- Solo GET registrados.
- 404/500 con mensajes seguros.
- Cien reads concurrentes devuelven mismo progreso.
- Scan recursivo del payload antes de completar: ninguna pareja futura equipo/división.
- Bundle HTML/JS/CSS no contiene seed ni plan generado.

## UI E2E

### Programado

- Liga, temporada, 16 pendientes y cuatro tarjetas vacías.
- Texto `El sorteo empieza en`.
- Hash visible y copiable.

### En directo

- Timer decrementa sin números negativos.
- Al vencer actualiza una asignación confirmada.
- Última asignación y progreso correctos.
- Equipo asignado desaparece de pendientes.

### Recuperación

- Reload conserva estado.
- Abrir segunda pestaña produce mismo resultado.
- Offline muestra `Reconectando…` y no revela nada.
- Online recupera todas las posiciones vencidas en orden.
- Volver a foco fuerza sync.

### Final

- 4 × 4 equipos y cero pendientes.
- Sin temporizador activo.
- Payload verifica hash e invariantes.
- Tamper fixture muestra fallo.

### Responsive y accesibilidad

- Viewports 360×800, 768×1024 y 1440×900.
- Grids 1, 2 y 4 columnas.
- Sin scroll horizontal.
- Orden de headings, landmarks y labels correcto.
- Foco visible y navegación teclado.
- Live region anuncia solo revelaciones nuevas.
- Reduced motion evita animación.
- Contraste AA.

## Pruebas operativas

### Acelerada automatizada

Usar clock falso o intervalo permitido solo en test; no relajar validación de producción. Completar 16 pasos en segundos.

### Ritmo real manual

Arrancar local con `now`, observar primera revelación a 120 s y una segunda a 240 s. Registrar timestamps del servidor y screenshot; no es necesario esperar 32 minutos para cada ejecución CI.

### Recuperación manual

Con configuración explícita y reset desactivado, reiniciar el servidor entre revelaciones. Confirmar mismo compromiso y progreso derivado.

## Comando final

`npm run verify` debe ejecutar formato, lint, límites, tipos, arquitectura, unidad/integración, cobertura, build y E2E. El runbook solo puede documentar comandos que hayan terminado con exit 0.
