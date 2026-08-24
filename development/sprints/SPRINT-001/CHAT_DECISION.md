# Decisión técnica — Chat de liga

## Pregunta

¿Cómo añadir un chat grupal simple dentro de la misma página sin construir y operar otro backend?

## Respuesta corta

No existe un chat multiusuario, persistente y fiable hecho solo con JavaScript local. Para compartir mensajes entre navegadores hace falta infraestructura común. La opción elegida es **Firebase gestionado con una UI propia muy pequeña**.

## Opciones evaluadas

| Opción | Ventaja | Problema | Veredicto |
|---|---|---|---|
| `localStorage`/`BroadcastChannel` | Cero servicio | Solo pestañas/dispositivo local | Rechazada |
| WebRTC mesh | Peer-to-peer | Señalización/TURN, sin historial, recuperación pobre | Rechazada |
| Chat propio en Fastify/WebSocket | Control total | Más estado, protocolo, rate limits y operación | Rechazada para MVP |
| TalkJS Chatbox | Widget casi terminado y group chat | Servicio adicional; auth segura exige tokens generados en servidor | Alternativa futura |
| Supabase Auth + Realtime/Postgres | Flexible y buen RLS | Más esquema/políticas de las necesarias aquí | Viable, no elegida |
| Firebase Auth + Firestore | Cliente web directo, realtime, reglas y emuladores | UI propia y dependencia Google | **Elegida** |

## Por qué Firebase

- Authentication ofrece usuarios anónimos sin formulario de registro.
- Firestore entrega listeners realtime con la SDK web.
- Cada petición web pasa por Security Rules.
- App Check reduce abuso desde clientes no autorizados.
- La configuración web/API key identifica el proyecto; no sustituye reglas ni es un secreto de autorización.
- El Emulator Suite permite probar Auth, Firestore y reglas sin tocar cloud.
- Para 16 participantes y mensajes de texto, la cuota gratuita publicada es holgada, aunque debe vigilarse y puede cambiar.

## Por qué no TalkJS ahora

TalkJS es el plugin más cercano a “añadir un chat ya hecho”: su Chatbox se monta en un elemento y soporta group chat. Pero producción debe habilitar autenticación, y sus tokens deben firmarse de forma segura fuera del navegador. Añade proveedor, pricing y una capa visual menos controlable. Es válido si la prioridad futura cambia a cero código de UI.

## Trust boundary

La solución elegida evita un servidor de chat propio, no elimina el backend: Firebase es el backend gestionado. La autenticación anónima identifica un navegador, no demuestra que esa persona sea propietaria del equipo seleccionado.

## Coste y retención

No usar TTL automático: las eliminaciones TTL requieren billing según la documentación actual. Se leen los últimos 100 mensajes y el historial se limpia manualmente después de la temporada. Revisar cuotas antes de producción.

## Impacto arquitectónico

- El sorteo sigue funcionando si Firebase falla.
- El chat vive en módulos `src/web/chat/**` y no importa domain/application del sorteo.
- No se almacenan credenciales admin en el proyecto.
- `VITE_FIREBASE_*` es configuración pública; Security Rules y App Check son obligatorios.
- Local/CI usa emuladores; producción usa un proyecto Firebase dedicado.

## Fuentes primarias

- [Firebase anonymous authentication](https://firebase.google.com/docs/auth/web/anonymous-auth)
- [Firestore realtime listeners](https://firebase.google.com/docs/firestore/query-data/listen)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase API keys](https://firebase.google.com/docs/projects/api-keys)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [Firestore pricing and free quota](https://firebase.google.com/docs/firestore/pricing)
- [TalkJS Chatbox](https://talkjs.com/docs/Guides/JavaScript/Classic/Add_Chatbox/)
- [TalkJS authentication](https://talkjs.com/docs/Features/Security/Authentication/)
- [Supabase Realtime authorization](https://supabase.com/docs/guides/realtime/authorization)
