# Plan de pruebas del chat

## Entorno

Todas las pruebas automatizadas usan Firebase Emulator Suite con proyectos efímeros. CI falla si cualquier test intenta conectarse a un project id que no termina en `-local` o si `VITE_FIREBASE_USE_EMULATORS` no es `true`.

## Security Rules

### Permitido

- Usuario anónimo autenticado lee los últimos mensajes de la sala aprobada.
- Usuario crea un documento con keys exactas.
- `uid` coincide con `request.auth.uid`.
- `teamId` pertenece al roster aprobado; el nombre no se acepta desde Firestore.
- `body` tiene entre 1 y 500 caracteres después de normalizar.
- `createdAt` usa timestamp del servidor.

### Denegado

- Usuario sin autenticar lee o escribe.
- Sala distinta a `nfl-spain-26-27`.
- UID de otra sesión.
- Equipo desconocido o label alterado.
- Body vacío, solo espacios o mayor de 500.
- Campos extra, tipos incorrectos o timestamp del cliente.
- Update/delete de cualquier mensaje.
- Lectura/escritura de cualquier otra colección.

## Unit tests

### Identidad

- Primer uso exige seleccionar equipo.
- Team id válido persiste en localStorage.
- Valor corrupto/obsoleto se descarta.
- Cambiar de navegador crea otro UID.
- El UI declara claramente que la identidad no está verificada.

### Controller

- Estados `connecting`, `ready`, `offline`, `error`.
- Suscripción se libera al desmontar.
- Mensajes snapshot se ordenan y deduplican.
- Respuesta pending no se cuenta dos veces.
- Unread aumenta solo con panel cerrado y mensajes remotos nuevos.
- Abrir panel resetea unread.
- Fallo send conserva texto y permite reintentar.
- Cooldown visual no bloquea accesibilidad.

### Render

- Nombres/body usan `textContent`.
- Payload `<img onerror=...>` aparece como texto.
- Fecha inválida muestra fallback.
- 500 caracteres no rompen layout.
- Error/offline no elimina mensajes ya confirmados.

## Integration tests

- Dos auth UIDs conectan a la misma sala.
- A envía y B recibe mediante snapshot sin reload.
- Repetir mismo `clientMessageId` no duplica.
- Mensajes concurrentes se ordenan por `createdAt` y tie-break id.
- Query carga como máximo 100 mensajes.
- Reconectar recupera mensajes perdidos.
- Rules tests usan deny-by-default desplegado desde el repo.

## E2E desktop

- Sidebar 320–360 px y sorteo mantiene ancho usable.
- Selección de equipo aparece solo la primera vez.
- Enviar por botón y Enter; Shift+Enter no envía.
- Contador llega de 0 a 500 y bloquea exceso.
- Scroll permanece en último mensaje si usuario ya estaba abajo.
- Si usuario lee historial arriba, mensaje nuevo no fuerza scroll; muestra indicador.
- Chat contraído libera espacio sin desmontar el sorteo.

## E2E móvil

- Botón abre bottom sheet de máximo 70vh.
- Focus entra al sheet y vuelve al trigger al cerrar.
- `Escape`, botón cerrar y backdrop funcionan.
- Badge de unread se actualiza.
- Teclado virtual no tapa permanentemente composer.
- Cuenta atrás queda accesible al cerrar chat.
- No hay scroll horizontal a 360 px.

## Aislamiento

- Bloquear dominios Firebase: sorteo sigue cargando y avanzando.
- Firestore permission denied: panel explica error; no error global.
- Auth timeout: chat puede reintentar; API draw continúa.
- App Check rejected: no fallback inseguro.
- Un mensaje malformado en snapshot se ignora y registra sin romper lista.

## Abuse/safety smoke tests

- Burst rápido respeta feedback cliente, aunque el control no se presenta como seguridad fuerte.
- HTML/script no se ejecuta.
- Firebase config pública no incluye admin/service-account credentials.
- Bundle no contiene seed del sorteo ni estado privado.
- Firestore export no contiene datos personales fuera de UID anónimo/team label/body.

## Evidencia de cierre

- Exit 0 de `npm run test:rules`.
- Exit 0 de unit/integration chat.
- Playwright con dos browser contexts.
- Screenshot desktop y móvil.
- Log de una prueba Firebase bloqueado con sorteo operativo.
- Revisión manual de rules desplegadas y App Check enforcement antes de producción.
