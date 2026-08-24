# Especificación del chat de liga

## Decisión

Usar Firebase Authentication anónima + Cloud Firestore en tiempo real + Security Rules + App Check. Es un backend gestionado, no un chat puramente local. No se construye otro servidor, WebSocket ni base de datos propios.

Un chat real entre dispositivos no puede funcionar solo con JavaScript aislado en una página estática: necesita un punto compartido para autenticar, distribuir y conservar mensajes. `localStorage` y `BroadcastChannel` solo sirven en el mismo dispositivo; WebRTC todavía requiere señalización y normalmente TURN.

## Alcance MVP

- Una única sala: `nfl-spain-26-27`.
- Autenticación anónima sin registro visible.
- Selección local de identidad entre los 16 equipos.
- Mensajes de texto de 1–500 caracteres.
- Últimos 100 mensajes ordenados por timestamp del servidor.
- Actualizaciones en tiempo real.
- Estado conectando, conectado y sin conexión.
- Contador de no leídos cuando el panel está cerrado.
- Historial conservado durante la temporada.

## Fuera de alcance

- Mensajes privados, archivos, imágenes, GIFs, reacciones o menciones.
- Edición o borrado por usuarios.
- Presencia/contador online exacto.
- Notificaciones push.
- Moderación automática.
- Identidad fuerte o exclusividad garantizada de un equipo.

## Trust model

Firebase asigna un UID anónimo por navegador. El usuario elige un equipo y ese label se asocia localmente al UID. Security Rules garantizan que un mensaje declara el mismo UID autenticado y un team id permitido, pero no pueden impedir que otra persona elija el mismo equipo.

Esto es aceptable para una liga privada de confianza. Si se exige impedir suplantación, se necesitarán invitaciones firmadas o PINs validados por el servidor existente; eso queda fuera del MVP backendless.

## Modelo de datos

Ruta: `rooms/{roomId}/messages/{clientMessageId}`.

```text
uid: Firebase Auth UID
teamId: id de uno de los 16 equipos
body: texto normalizado, 1–500 caracteres
createdAt: server timestamp
```

`clientMessageId` es único por intento para evitar duplicados al reintentar.

## Reglas de acceso

- Deny by default.
- Solo usuarios autenticados pueden leer la sala aprobada.
- Create exige keys exactas, `uid == request.auth.uid`, `teamId` permitido, texto válido y `createdAt == request.time`.
- Update y delete siempre denegados desde clientes.
- Otras salas y colecciones quedan denegadas.
- Reglas cubiertas con Firebase Emulator Suite y rules-unit-testing.

## Comportamiento cliente

1. Conectar a emuladores en local o Firebase real en producción.
2. Crear/restaurar sesión anónima.
3. Si no hay team id local, abrir selector de equipo.
4. Suscribirse a query de los últimos 100 mensajes.
5. Resolver el nombre desde el roster local y renderizar con `textContent` y timestamps de Madrid.
6. Enviar con `serverTimestamp`; deshabilitar composer durante submit.
7. Aplicar cooldown visual de un segundo; no considerarlo control de seguridad.
8. Si falla Firebase, marcar chat offline sin tocar estado del sorteo.

## Layout

- Desktop ≥ 1024 px: sidebar sticky de 340 px junto al sorteo.
- Tablet/móvil: botón `Chat` con badge; abre bottom sheet de máximo 70vh.
- Lista de mensajes con scroll propio; composer siempre visible.
- `Enter` envía y `Shift+Enter` crea salto.
- `Escape` cierra el sheet; foco vuelve al botón.
- Live region anuncia mensajes nuevos sin repetir el historial.

## Privacidad y retención

No pedir email, teléfono ni nombre real. Mostrar aviso corto: los mensajes son visibles para quienes tengan acceso a la página. No usar TTL automático en el MVP; se archiva o elimina manualmente al cerrar la temporada.

## Controles de abuso mínimos

- Firebase Auth anónima.
- App Check con reCAPTCHA Enterprise en producción.
- Security Rules estrictas.
- Máximo 500 caracteres y payload exacto.
- Cooldown cliente y límite de 100 mensajes cargados.
- El acceso por URL no constituye identidad fuerte.

## Referencias oficiales

- [Firebase anonymous authentication](https://firebase.google.com/docs/auth/web/anonymous-auth)
- [Cloud Firestore realtime listeners](https://firebase.google.com/docs/firestore/query-data/listen)
- [Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase App Check for web](https://firebase.google.com/docs/app-check/web/recaptcha-provider)
- [Firebase API key guidance](https://firebase.google.com/docs/projects/api-keys)
