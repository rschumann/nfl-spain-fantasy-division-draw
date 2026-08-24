# Especificación de interfaz

## Dirección visual

Una sola pantalla, limpia y deportiva. Debe recordar el ritmo de un sorteo como el de la Champions League, sin copiar su marca ni convertir la experiencia en un espectáculo complejo.

## Estructura

### Cabecera

- Título: `NFL Spain`
- Subtítulo: `Sorteo de divisiones · Temporada 26-27`
- Estado breve: programado, en directo o finalizado

### Área principal de sorteo

- Cuenta atrás grande en formato `MM:SS`.
- Texto contextual: `El sorteo empieza en` o `Siguiente equipo en`.
- Última asignación destacada: `[Equipo] → [DIVISIÓN]`.
- Microanimación corta de entrada; no debe retrasar ni decidir la revelación.

### Cuadro de divisiones

Cuatro tarjetas iguales:

- `NORTH`
- `EAST`
- `WEST`
- `SOUTH`

Cada tarjeta muestra cuatro posiciones. Las vacías usan `Pendiente`; las ocupadas muestran el nombre del equipo y su número de revelación.

### Equipos pendientes

Lista compacta de los equipos aún no revelados. Un equipo desaparece de esta lista cuando su asignación queda confirmada por el servidor.

### Pie

- Progreso: `7 de 16 equipos sorteados`.
- Hash de compromiso en formato abreviado con opción de copiar.
- Tras finalizar: control `Verificar sorteo` y explicación breve.

### Chat de liga

- Escritorio: panel lateral derecho de 320–360 px, dentro del layout y sin tapar el sorteo.
- Cabecera: `Chat de la liga`, estado de conexión y botón para contraer.
- Cuerpo: mensajes en orden cronológico, nombre del equipo, hora y burbuja sobria.
- Composer fijo abajo, contador `0/500` y botón `Enviar`.
- El chat es secundario; cuenta atrás y última asignación mantienen prioridad visual.
- No copiar las pestañas `All`, `User Messages` o `League Assistant` de ESPN: solo existe una sala.

## Boceto textual

```text
NFL Spain                                 EN DIRECTO
Sorteo de divisiones · Temporada 26-27

                    SIGUIENTE EQUIPO EN
                           01:37
                Toledo Patriots  →  EAST

┌────────────────────────────────────────────────────┐ ┌──────────────────┐
│ NORTH       EAST        WEST         SOUTH         │ │ CHAT DE LA LIGA │
│ Madrid      Toledo      Pendiente    BCN Giants    │ │ Madrid · 20:02  │
│ Pendiente   Pendiente   Pendiente    Pendiente     │ │ Vamos allá      │
│ Pendiente   Pendiente   Pendiente    Pendiente     │ │                  │
│ Pendiente   Pendiente   Pendiente    Pendiente     │ │ [Mensaje…] Enviar│
└────────────────────────────────────────────────────┘ └──────────────────┘

Equipos pendientes: La Osera · London Viking · Nico · ...
3 de 16 equipos sorteados
```

## Responsive

- Escritorio: cuatro columnas.
- Tablet: sorteo 2 × 2 y chat contraído como botón inferior.
- Móvil: una columna; chat en bottom sheet de hasta 70vh con badge de no leídos.
- El panel móvil conserva el foco, se cierra con `Escape` y no bloquea permanentemente la cuenta atrás.
- No permitir scroll horizontal.

## Movimiento y sonido

- Animación de revelación entre 400 y 800 ms.
- Respetar `prefers-reduced-motion`.
- MVP sin sonido automático.

## Estados visuales

- **Programado:** fecha local explícita y cuenta atrás hasta el inicio.
- **En directo:** indicador sobrio, temporizador y última asignación.
- **Reconectando:** banner no bloqueante; no simular nuevas asignaciones.
- **Finalizado:** cuadro completo, sin temporizador activo y con verificación.

## Criterio de simplicidad

No usar navegación, carruseles, confeti continuo, vídeo de fondo, logos no licenciados ni panel de administración público.
