# MVP SSE Adapter Smoke Test (Issue #2)

## Objetivo
Validar en ejecución real el flujo SSE por `session_id`, normalización estable y degradación segura ante eventos desconocidos.

## Prerrequisitos
- Runtime local levantado: `opencode serve`.
- Endpoint SSE accesible por sesión (definido por runtime/plugin).
- Node.js 20+.

## Pasos
1. Crear sesión en runtime (HTTP) y guardar `session_id`.
2. Conectar `SSEClient` al endpoint SSE de esa sesión con `RuntimeEventAdapter`.
3. Enviar prompt por HTTP para disparar eventos incrementales.
4. Verificar en logs:
- trazas de `session_id` en eventos raw y normalizados,
- eventos normalizados con tipos `start/progress/message/error/end`,
- eventos desconocidos no detienen stream ni rompen flujo,
- cierre controlado (`close()`) termina la lectura sin excepción no manejada.
5. Cortar conexión de red/runtime y confirmar estado `reconnecting`.

## Resultado esperado
- Flujo end-to-end con eventos incrementales durante una ejecución real.
- Adaptador estable ante cambios menores de forma/nombre de evento.
- Sin crash por eventos desconocidos o cierre de stream.
