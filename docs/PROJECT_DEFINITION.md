# Definición del proyecto

## Nombre

**NFL Spain Fantasy — Sorteo de Divisiones**

Nombre técnico provisional: `nfl-spain-fantasy-division-draw`.

- Liga mostrada: `NFL Spain`.
- Temporada: `26-27`.
- Zona horaria: `Europe/Madrid`.

## Problema

La liga tiene 16 equipos y necesita repartirlos de forma aleatoria, transparente y entretenida entre cuatro divisiones de cuatro equipos. El resultado no debe publicarse de golpe: la experiencia debe parecerse a un sorteo deportivo en directo, con una nueva asignación cada dos minutos.

## Solución

Una página web pública, simple y responsive que:

1. muestra los 16 equipos pendientes;
2. muestra cuatro divisiones inicialmente vacías;
3. espera hasta la fecha programada;
4. inicia ciclos de dos minutos;
5. al finalizar cada ciclo revela un equipo y su división;
6. continúa hasta completar cuatro equipos por división;
7. deja visible el resultado final verificable.

## Objetivo principal

Ejecutar un único sorteo programado, equilibrado y auditable sin depender de que el navegador del organizador permanezca abierto.

## Principios

- **Aleatorio:** ningún equipo ni división recibe tratamiento preferente.
- **Equilibrado:** cada división termina con exactamente cuatro equipos.
- **Oculto:** ninguna asignación futura puede verse antes de su momento.
- **Recuperable:** recargar o abrir tarde muestra inmediatamente el estado correcto.
- **Simple:** una sola pantalla pública, sin navegación innecesaria.
- **Accesible:** el resultado no depende solo del color o de la animación.

## Alcance del MVP

### Incluido

- 16 equipos fijos y cuatro divisiones.
- Fecha/hora de inicio configurable antes del bloqueo.
- Zona horaria explícita.
- Intervalo de revelación de 120 segundos.
- Cuenta atrás antes del inicio y entre revelaciones.
- Asignación balanceada y aleatoria.
- Estado público sincronizado mediante hora del servidor.
- Recuperación correcta tras recarga o entrada tardía.
- Vista final del resultado.
- Prueba pública de integridad al terminar el sorteo.
- Diseño responsive para móvil y escritorio.

### Fuera de alcance

- Login de participantes.
- Integración o escritura automática en ESPN.
- Chat, votaciones o comentarios.
- Sorteos con restricciones deportivas complejas.
- Múltiples ligas o temporadas administrables desde una interfaz.
- App nativa móvil.
- Sonido obligatorio, vídeo en directo o gráficos 3D.

## Usuarios

- **Organizador:** entrega la fecha/hora y aprueba la lista antes del bloqueo.
- **Participante/espectador:** abre el enlace y sigue el sorteo en directo o consulta el resultado después.

## Resultado esperado

Al terminar, las cuatro divisiones contienen cuatro equipos cada una, los 16 equipos aparecen exactamente una vez y cualquier participante puede verificar que el plan no fue alterado durante el evento.

## Restricciones

- La simplicidad visual no puede comprometer la fiabilidad del proceso.
- El sorteo debe progresar aunque ningún navegador esté abierto.
- El reloj del dispositivo del espectador no puede adelantar revelaciones.
- Un despliegue o reinicio durante el evento no puede duplicar ni perder asignaciones.

## Decisiones pendientes

| Decisión | Estado | Propuesta |
|---|---|---|
| Fecha/hora de prueba local | Confirmada | `DRAW_START_AT=now` |
| Fecha/hora de producción | Pendiente | Se configurará en ISO 8601 antes del bloqueo |
| Zona horaria | Confirmada | `Europe/Madrid` |
| Nombre de liga | Confirmado | `NFL Spain` |
| Nombre de temporada | Confirmado | `26-27` |
| URL y alojamiento | Pendiente | Elegir durante arquitectura |
| Tecnología | Pendiente | Elegir la opción mínima que garantice estado servidor y persistencia |
