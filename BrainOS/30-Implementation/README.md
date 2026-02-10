# 30-Implementation

Código de implementación de BrainOS.

Estado actual:

- `mvp-http-client/`: cliente HTTP mínimo para `opencode serve` (issue #1).

Primer objetivo:

- Plugin Obsidian -> OpenCode (`opencode serve`) con flujo HTTP + SSE.

## MVP-03: Session State Manager (in-memory)

Implementación local del issue #3 (ADR-003):

- `session/SessionStateManager.js`
- `session/SessionStateManager.test.js`

Validación local:

```bash
node --test BrainOS/30-Implementation/session/SessionStateManager.test.js
```
Implementación local inicial:

- `mvp-sse-adapter/`: cliente SSE MVP con adaptador de eventos y pruebas smoke locales.
