# Configuración por entorno

## Contrato

| Variable | Local | Producción | Regla |
|---|---|---|---|
| `APP_ENV` | `local` | `production` | Controla validaciones, nunca el resultado |
| `LEAGUE_NAME` | `NFL Spain` | `NFL Spain` | Obligatoria y no vacía |
| `SEASON_LABEL` | `26-27` | `26-27` | Obligatoria y no vacía |
| `DRAW_TIMEZONE` | `Europe/Madrid` | `Europe/Madrid` | Debe ser una zona IANA válida |
| `DRAW_START_AT` | `now` | Fecha ISO 8601 | `now` solo está permitido en local |
| `DRAW_REVEAL_INTERVAL_SECONDS` | `120` | `120` | Entero positivo; producción exige 120 |

## Semántica de `DRAW_START_AT`

### Local

`DRAW_START_AT=now` significa:

1. leer la hora actual al arrancar el proceso;
2. interpretarla con la zona `Europe/Madrid`;
3. convertirla inmediatamente en un instante UTC inmutable;
4. usar ese mismo instante durante toda la ejecución;
5. crear la primera revelación 120 segundos después.

Recargar el navegador no recalcula la fecha. Reiniciar el servidor local sí inicia una prueba nueva.

### Producción

`DRAW_START_AT` debe contener una fecha ISO 8601 explícita con offset, por ejemplo:

```dotenv
DRAW_START_AT=2026-09-01T20:00:00+02:00
```

El servidor debe rechazar el arranque si producción recibe `now`, una fecha inválida, una zona desconocida o un intervalo distinto de 120 segundos.

## Archivos

- `.env.example`: contrato versionado y seguro para copiar.
- `.env.local`: valores usados en esta máquina; ignorado por Git.
- Las variables se leen y validan exclusivamente en el servidor.
- Semillas, planes secretos y asignaciones futuras no pertenecen a ningún archivo `.env` público.

## Configuración local actual

```dotenv
APP_ENV=local
LEAGUE_NAME="NFL Spain"
SEASON_LABEL="26-27"
DRAW_TIMEZONE=Europe/Madrid
DRAW_START_AT=now
DRAW_REVEAL_INTERVAL_SECONDS=120
```
