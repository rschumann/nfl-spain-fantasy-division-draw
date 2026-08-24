# Configuración por entorno

## Contrato

| Variable | Local | Producción | Regla |
|---|---|---|---|
| `APP_ENV` | `local` | `production` | Controla validaciones, nunca el resultado |
| `DRAW_EVENT_ID` | `nfl-spain-26-27` | `nfl-spain-26-27` | Identificador estable e inmutable del evento |
| `LEAGUE_NAME` | `NFL Spain` | `NFL Spain` | Obligatoria y no vacía |
| `SEASON_LABEL` | `26-27` | `26-27` | Obligatoria y no vacía |
| `DRAW_TIMEZONE` | `Europe/Madrid` | `Europe/Madrid` | Debe ser una zona IANA válida |
| `DRAW_START_AT` | `now` | Fecha ISO 8601 | `now` solo está permitido en local |
| `DRAW_REVEAL_INTERVAL_SECONDS` | `120` | `120` | Entero positivo; producción exige 120 |
| `DRAW_RESET_ON_START` | `true` | `false` | `true` queda prohibido en producción |
| `DRAW_STATE_PATH` | `.data/draw-state.json` | Ruta persistente privada | Nunca puede estar dentro del directorio público |
| `HOST` | `127.0.0.1` | Según alojamiento | Dirección de escucha |
| `PORT` | `3000` | Según alojamiento | Puerto entero válido |
| `VITE_CHAT_ENABLED` | `true` | `true` | Feature flag pública del chat |
| `VITE_CHAT_ROOM_ID` | `nfl-spain-26-27` | Igual | Sala única por temporada |
| `VITE_FIREBASE_USE_EMULATORS` | `true` | `false` | Producción no puede usar emuladores |
| `VITE_FIREBASE_*` | Valores locales | Config web real | Configuración pública, nunca credenciales admin |

## Semántica de `DRAW_START_AT`

### Local

`DRAW_START_AT=now` significa:

1. leer la hora actual al arrancar el proceso;
2. interpretarla con la zona `Europe/Madrid`;
3. convertirla inmediatamente en un instante UTC inmutable;
4. usar ese mismo instante durante toda la ejecución;
5. crear la primera revelación 120 segundos después.

Recargar el navegador no recalcula la fecha. Con `DRAW_RESET_ON_START=true`, reiniciar el servidor local sí inicia una prueba nueva.

### Producción

`DRAW_START_AT` debe contener una fecha ISO 8601 explícita con offset, por ejemplo:

```dotenv
DRAW_START_AT=2026-09-01T20:00:00+02:00
```

El servidor debe rechazar el arranque si producción recibe `now`, `DRAW_RESET_ON_START=true`, una fecha inválida, una zona desconocida, un intervalo distinto de 120 segundos o un estado persistido que no coincide con la configuración.

## Archivos

- `.env.example`: contrato versionado y seguro para copiar.
- `.env.local`: valores usados en esta máquina; ignorado por Git.
- Las variables de sorteo se leen y validan exclusivamente en el servidor; las `VITE_*` se validan en un único módulo cliente.
- Semillas, planes secretos y asignaciones futuras no pertenecen a ningún archivo `.env` público.
- Las variables `VITE_*` se incluyen en el bundle. Solo contienen ids/configuración web de Firebase; la seguridad depende de Auth, Security Rules y App Check.

## Configuración local actual

```dotenv
APP_ENV=local
DRAW_EVENT_ID=nfl-spain-26-27
LEAGUE_NAME="NFL Spain"
SEASON_LABEL="26-27"
DRAW_TIMEZONE=Europe/Madrid
DRAW_START_AT=now
DRAW_REVEAL_INTERVAL_SECONDS=120
DRAW_RESET_ON_START=true
DRAW_STATE_PATH=.data/draw-state.json
HOST=127.0.0.1
PORT=3000
VITE_CHAT_ENABLED=true
VITE_CHAT_ROOM_ID=nfl-spain-26-27
VITE_FIREBASE_USE_EMULATORS=true
VITE_FIREBASE_API_KEY=local-emulator
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_FIREBASE_PROJECT_ID=nfl-spain-draw-local
VITE_FIREBASE_APP_ID=local-app
VITE_FIREBASE_APP_CHECK_SITE_KEY=disabled-in-local
```
