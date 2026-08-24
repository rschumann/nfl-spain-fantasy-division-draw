# Runbook previsto

Este documento fija el comportamiento operativo que la implementación debe entregar. Los comandos aún no existen y deberán verificarse antes de cerrar el sprint.

## Prueba local normal

```bash
cp .env.example .env.local
npm ci
npm run emulators
npm run dev
```

Abrir `http://127.0.0.1:3000`. Con `DRAW_START_AT=now` y `DRAW_RESET_ON_START=true`, el servidor fija `T0` al arrancar y la primera asignación aparece 120 segundos después.

Los emuladores proporcionan Auth y Firestore locales. `npm run dev` debe abortar si el chat está activado y no puede alcanzar los emuladores, salvo feature flag explícita para probar solo el sorteo.

## Comprobaciones locales

```bash
curl -i http://127.0.0.1:3000/api/health
curl -i http://127.0.0.1:3000/api/draw
npm run verify
```

Esperado:

- health 200 sin datos privados;
- draw 200 con `Cache-Control: no-store`;
- hash constante durante la ejecución;
- progreso monotónico;
- `verify` con exit 0.

## Reiniciar una prueba local

Parar y arrancar de nuevo el servidor. El reset solo se permite cuando:

- `APP_ENV=local`;
- `DRAW_RESET_ON_START=true`;
- `DRAW_START_AT=now`;
- el path está dentro del directorio local permitido y fuera de assets.

La implementación debe imprimir que creó un evento local nuevo sin mostrar seed o plan.

## Simular recuperación

1. Usar un timestamp explícito en `DRAW_START_AT`.
2. Fijar `DRAW_RESET_ON_START=false`.
3. Arrancar y anotar el commitment hash.
4. Parar el proceso después de una revelación.
5. Esperar otro intervalo y arrancar de nuevo.
6. Confirmar mismo hash y progreso actualizado por hora.

## Configuración de producción futura

```dotenv
APP_ENV=production
DRAW_EVENT_ID=nfl-spain-26-27
LEAGUE_NAME="NFL Spain"
SEASON_LABEL="26-27"
DRAW_TIMEZONE=Europe/Madrid
DRAW_START_AT=2026-09-01T20:00:00+02:00
DRAW_REVEAL_INTERVAL_SECONDS=120
DRAW_RESET_ON_START=false
DRAW_STATE_PATH=/var/lib/nfl-spain-draw/draw-state.json
HOST=0.0.0.0
PORT=3000
VITE_CHAT_ENABLED=true
VITE_CHAT_ROOM_ID=nfl-spain-26-27
VITE_FIREBASE_USE_EMULATORS=false
VITE_FIREBASE_API_KEY=<firebase-web-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project>
VITE_FIREBASE_APP_ID=<firebase-web-app-id>
VITE_FIREBASE_APP_CHECK_SITE_KEY=<recaptcha-enterprise-site-key>
```

La fecha del ejemplo no está aprobada y debe reemplazarse.

## Checklist antes del evento

- [ ] Fecha/hora y offset aprobados.
- [ ] Roster comparado con ESPN.
- [ ] Volumen persistente montado y backup probado.
- [ ] Una sola instancia escritora.
- [ ] State path fuera de assets y con permisos privados.
- [ ] Servicio iniciado antes de `T0`.
- [ ] Health 200 y página accesible desde móvil.
- [ ] Commitment hash capturado y comunicado.
- [ ] Reloj del host sincronizado.
- [ ] Reinicio de recuperación probado en staging/local.
- [ ] Proyecto Firebase dedicado creado en región apropiada.
- [ ] Anonymous Auth habilitada y Rules desplegadas en deny-by-default.
- [ ] App Check monitorizado y después enforced.
- [ ] Dos navegadores verifican chat; sorteo funciona con Firebase bloqueado.

## Durante el evento

- Vigilar health, HTTP 5xx y disponibilidad.
- No editar env, state file, roster o assets del plan.
- No cambiar reglas/índices del chat durante el evento salvo incidente de seguridad.
- Un reinicio es aceptable si reutiliza mismo volumen/config.
- No publicar logs completos; pueden contener contexto operativo.

## Fallos

### Servicio caído

Reiniciar con misma configuración y volumen. El estado visible se pondrá al día por `serverNow`.

### Config mismatch

No borrar ni modificar state. Comparar env aprobada con fingerprint y corregir la configuración del proceso.

### Estado corrupto antes de T0

Detener, recuperar backup y verificar commitment. Si no existe compromiso publicado, el propietario decide si recrear y volver a comunicarlo.

### Estado perdido o corrupto después de T0

No regenerar. Declarar el sorteo inválido, conservar evidencias y decidir un nuevo evento con nuevo id/fecha.

### Cliente desincronizado

Comparar `/api/draw` con otra sesión. Si API es correcta, recargar assets; nunca insertar resultados manualmente.

### Chat caído

Mantener el sorteo visible y marcar solo el panel como `Chat no disponible`. No reiniciar ni regenerar el sorteo por un incidente de Firebase.

## Después del evento

- Confirmar estado `complete` y 16 asignaciones.
- Descargar/capturar payload de verificación y hash.
- Guardar backup privado del estado.
- Mantener la página final en modo read-only.
- No escribir automáticamente el resultado en ESPN.
