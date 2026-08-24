# Especificación del producto

## 0. Identidad del evento

- Liga: `NFL Spain`.
- Temporada: `26-27`.
- Zona horaria: `Europe/Madrid`.
- Intervalo: `120` segundos.

## 1. Entidades del sorteo

### Divisiones

1. `NORTH`
2. `EAST`
3. `WEST`
4. `SOUTH`

### Equipos

La lista inicial se toma de la captura de ESPN:

1. Madrid Steelers
2. Toledo Patriots
3. La Osera
4. London Viking
5. Nico
6. Ohio Dolphins
7. Camioneros
8. Wolverines
9. Barakaldo
10. Daniel
11. Samuel
12. Sant Boi Chargers
13. BCN Giants
14. Juanito
15. Navarra Colts
16. Xisko

Los grupos mostrados actualmente en ESPN no condicionan el nuevo sorteo.

## 2. Estados del evento

| Estado | Comportamiento público |
|---|---|
| `scheduled` | Muestra todos los equipos sin asignar y una cuenta atrás hasta el inicio |
| `running` | Muestra asignaciones reveladas y la cuenta atrás de dos minutos hasta la siguiente |
| `complete` | Muestra el resultado final y la prueba de integridad |
| `error` | Conserva el último estado válido y muestra un aviso sin inventar resultados |

## 3. Línea temporal

- `T0`: fecha y hora de inicio configuradas.
- `T0 + 02:00`: primera asignación.
- `T0 + 04:00`: segunda asignación.
- Continúa una asignación cada 120 segundos.
- `T0 + 32:00`: asignación 16 y final del sorteo.

Antes de `T0`, la interfaz muestra `El sorteo empieza en…`. Desde `T0`, muestra `Siguiente equipo en…`.

## 4. Requisitos funcionales

### RF-01 — Configuración bloqueable

El evento tiene roster, divisiones, capacidad, fecha/hora, zona horaria e intervalo. Antes de producción se bloquea la configuración; después no puede editarse silenciosamente.

### RF-02 — Plan balanceado

El sistema crea un plan con los 16 equipos exactamente una vez y cuatro plazas para cada división.

### RF-03 — Orden aleatorio

Tanto el orden de aparición de los equipos como sus plazas de división se determinan mediante aleatoriedad criptográficamente segura.

### RF-04 — Revelación progresiva

La API pública solo entrega las asignaciones cuyo `revealAt` sea igual o anterior a la hora autoritativa del servidor.

### RF-05 — Cuenta atrás

La interfaz actualiza la cuenta atrás cada segundo. Al llegar a cero solicita el estado autoritativo; no asigna equipos localmente.

### RF-06 — Reentrada y recarga

Si un usuario abre o recarga la página durante el evento, ve todas las asignaciones que ya deberían estar reveladas y el tiempo restante correcto.

### RF-07 — Finalización

Tras la asignación 16, desaparece la cuenta atrás activa, se anuncia que el sorteo terminó y permanece el cuadro final.

### RF-08 — Verificación

Antes del sorteo se publica un compromiso hash del plan secreto. Al finalizar se publica el material necesario para recalcular el plan y verificar que no cambió.

### RF-09 — Sin filtraciones

Resultados futuros no aparecen en el HTML, bundle, caché pública, respuestas de API, metadatos ni mensajes de error.

### RF-10 — Fuente de tiempo

El servidor determina qué debe estar visible. La hora local solo anima la cuenta atrás entre sincronizaciones.

## 5. Requisitos no funcionales

- **Responsive:** usable desde 360 px de ancho.
- **Accesible:** navegación por teclado, foco visible, contraste AA, región viva para anuncios y modo de movimiento reducido.
- **Rendimiento:** la pantalla principal debe ser ligera; no necesita vídeo ni librerías de animación pesadas.
- **Resiliencia:** una caída temporal no altera el plan; al volver, el estado se reconstruye por tiempo.
- **Idempotencia:** pedir el estado repetidamente nunca crea otra asignación.
- **Observabilidad segura:** registrar fallos y transiciones sin registrar resultados futuros antes de tiempo.
- **Compatibilidad:** últimas versiones estables de Chrome, Safari, Firefox y Edge.

## 6. Modelo lógico mínimo

### Draw

- `id`
- `seasonLabel`
- `status`
- `startAt`
- `timezone`
- `revealIntervalSeconds` = `120`
- `teamCount` = `16`
- `divisionCapacity` = `4`
- `commitmentHash`
- `lockedAt`

### Assignment

- `position` de `1` a `16`
- `teamId`
- `divisionId`
- `revealAt`

La representación pública omite cualquier `Assignment` futura.

## 7. Configuración del MVP

No se necesita panel de administración. La configuración se inyecta mediante variables de entorno validadas al arrancar el servidor, se revisa y se bloquea antes del evento.

En local, `DRAW_START_AT=now` resuelve `startAt` una sola vez durante el arranque. Así cada prueba empieza con la hora actual de Madrid. Este valor está prohibido en producción, donde `DRAW_START_AT` debe ser una fecha ISO 8601 explícita con offset.

## 8. Errores esperados

- **Sin conexión:** conservar último estado confirmado y mostrar `Reconectando…`.
- **Hora desincronizada:** corregir la cuenta atrás usando la siguiente respuesta del servidor.
- **Respuesta inválida:** no revelar nada nuevo; reintentar y registrar el error.
- **Evento no configurado:** mostrar una pantalla neutral, nunca datos parciales.
- **Evento terminado:** servir directamente el estado final.
