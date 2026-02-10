# MVP HTTP Client (`opencode serve`)

Cliente HTTP mínimo para BrainOS MVP alineado con ADR-001 (HTTP + SSE) y ADR-003 (in-memory).

## Incluye

- `OpenCodeHttpClient` con `baseUrl` configurable.
- `healthCheck()` para validar conectividad al runtime.
- `createSession()` y `sendPrompt()` por HTTP.
- Timeout por request (`AbortSignal.timeout`) y mapeo de errores de red/runtime.
- Logging estructurado JSON para debugging.

## Uso rápido

```bash
npm test
npm run smoke
```

Smoke contra runtime real (opcional):

```bash
SMOKE_USE_REAL_RUNTIME=1 SMOKE_BASE_URL=http://localhost:4096 npm run smoke
```

## API

```js
import { OpenCodeHttpClient } from './src/index.js'

const client = new OpenCodeHttpClient({
  baseUrl: 'http://localhost:4096',
  timeoutMs: 10_000
})

await client.healthCheck()
```
