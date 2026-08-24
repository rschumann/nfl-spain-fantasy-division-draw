# Reglas del sorteo

## Invariantes

1. Hay exactamente 16 equipos únicos.
2. Hay exactamente cuatro divisiones únicas.
3. Cada división tiene exactamente cuatro plazas.
4. Cada equipo ocupa una sola plaza.
5. Hay exactamente 16 momentos de revelación.
6. Los momentos están separados por 120 segundos.
7. Ningún resultado futuro se publica antes de tiempo.

## Preparación aleatoria

En el bloqueo del evento:

1. validar roster, divisiones y capacidades;
2. generar una semilla secreta con un generador criptográficamente seguro;
3. derivar de esa semilla un flujo pseudoaleatorio criptográficamente seguro y reproducible;
4. barajar los 16 equipos con Fisher–Yates y selección uniforme sin sesgo de módulo;
5. crear 16 plazas: cuatro para cada división;
6. barajar de forma independiente las 16 plazas usando otro dominio del mismo flujo;
7. emparejar equipo y plaza por posición;
8. asignar `revealAt = startAt + position × 120 segundos`;
9. serializar el plan de manera canónica;
10. publicar su compromiso SHA-256 y mantener secreto el plan completo;
11. publicar plan y semilla de verificación solo al finalizar.

No se permite usar `Math.random()` en producción.

## Equilibrio y aleatoriedad

Barajar una lista que contiene cuatro plazas de cada división garantiza el equilibrio sin favorecer a ninguna división. Barajar los equipos por separado evita que el orden original de ESPN determine el orden de revelación.

## Autoridad temporal

El avance no depende de un proceso que se ejecute exactamente cada dos minutos. El estado visible se deriva de `serverNow`:

- una asignación es pública si `revealAt <= serverNow`;
- si el servicio estuvo caído, al recuperarse publica todas las asignaciones ya vencidas;
- varias peticiones simultáneas obtienen el mismo resultado;
- cerrar todos los navegadores no pausa el evento.

## Compromiso verificable

Antes de la primera revelación se muestra el hash del plan bloqueado. Después de la última se muestra el plan canónico y los datos de verificación. Un verificador debe poder:

1. recalcular el hash;
2. confirmar que coincide con el compromiso previo;
3. reproducir el orden;
4. comprobar las siete invariantes.

El mecanismo exacto de serialización y derivación deberá fijarse en la especificación técnica antes de implementar para evitar diferencias entre plataformas.

## Prohibiciones

- Rebarajar después del bloqueo.
- Editar manualmente una asignación sin invalidar públicamente el evento.
- Enviar todo el plan al cliente y ocultarlo solo con CSS o JavaScript.
- Usar la hora del navegador como fuente de autorización.
- Crear resultados nuevos desde cada navegador.
