# Criterios de aceptación

## Datos y equilibrio

- [ ] Se cargan exactamente los 16 equipos definidos.
- [ ] Se muestran exactamente las divisiones `NORTH`, `EAST`, `WEST` y `SOUTH`.
- [ ] Al finalizar, cada equipo aparece una vez.
- [ ] Al finalizar, cada división contiene cuatro equipos.
- [ ] El orden original de equipos no determina el orden de revelación.

## Programación y tiempo

- [ ] Antes de `startAt`, no hay asignaciones visibles.
- [ ] La primera asignación aparece en `startAt + 120 segundos`.
- [ ] Cada asignación posterior aparece 120 segundos después de la anterior.
- [ ] La asignación 16 aparece en `startAt + 1.920 segundos`.
- [ ] Cambiar manualmente la hora del dispositivo no adelanta resultados.
- [ ] Entrar tarde muestra todas y solo las asignaciones ya vencidas.
- [ ] Cerrar todos los navegadores no detiene el sorteo.

## Integridad

- [ ] La configuración queda bloqueada antes del evento.
- [ ] Se publica un compromiso hash antes de la primera revelación.
- [ ] No hay resultados futuros en respuestas públicas ni recursos cliente.
- [ ] Al finalizar, el material publicado reproduce el plan y su hash.
- [ ] Dos clientes simultáneos ven las mismas asignaciones.
- [ ] Repetir una petición no duplica ni modifica resultados.

## Interfaz

- [ ] El temporizador se entiende sin instrucciones adicionales.
- [ ] La última asignación se anuncia visualmente y a tecnologías de asistencia.
- [ ] La interfaz funciona a 360 px sin scroll horizontal.
- [ ] La cuadrícula usa cuatro, dos o una columna según el ancho.
- [ ] Todos los controles funcionan con teclado y tienen foco visible.
- [ ] El modo de movimiento reducido elimina animaciones innecesarias.
- [ ] Una pérdida de conexión muestra un estado honesto y conserva datos confirmados.

## Pruebas límite

- [ ] Recarga un segundo antes y un segundo después de una revelación.
- [ ] El servicio se recupera tras estar fuera durante varios intervalos.
- [ ] Dos revelaciones vencidas durante una caída aparecen en el orden correcto.
- [ ] La respuesta del servidor contiene una fecha inválida o un payload incompleto y el cliente no inventa estado.
- [ ] El evento ya terminó cuando un usuario lo abre por primera vez.

## Stop gates antes de producción

- [ ] Fecha, hora y zona horaria aprobadas explícitamente.
- [ ] Nombres de los 16 equipos aprobados explícitamente.
- [ ] Ensayo completo con otra semilla y horario acelerado.
- [ ] Auditoría de filtración de resultados futuros superada.
- [ ] Verificación independiente del hash superada.
- [ ] Copia persistente del plan y procedimiento de recuperación probados.
