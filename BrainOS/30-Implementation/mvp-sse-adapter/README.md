# MVP SSE Adapter

Implementación mínima local para Issue #2 (`MVP-02`): suscripción SSE por sesión, normalización de eventos y manejo de reconexión/cierre seguro.

## Alcance implementado
- Conexión a stream SSE por `sessionId`.
- Parser SSE desacoplado (`SSEParser`).
- Adaptador a contrato interno estable: `start | progress | message | error | end`.
- Trazabilidad por `sessionId` en eventos raw/normalizados.
- Reconexión exponencial y cierre seguro con `AbortController`.

## No objetivos
- Cambiar transporte MVP (se mantiene HTTP + SSE).
- Acoplar lógica de UI/Obsidian.
- Definir contrato estricto de nombres del runtime (eventos desconocidos se toleran).

## Uso rápido
```js
import { SSEClient, RuntimeEventAdapter } from './src/index.js';

const adapter = new RuntimeEventAdapter({
  onTrace(trace) {
    console.log(trace);
  },
});

const client = new SSEClient({ adapter });

await client.connect({
  url: 'http://localhost:4096/sse/session/<session_id>',
  sessionId: '<session_id>',
  reconnect: { enabled: true, initialDelayMs: 500, maxDelayMs: 5000 },
  onNormalizedEvent(event) {
    console.log(event.type, event.payload);
  },
});
```

## Validación local
```bash
npm test
```
