# 30-Implementation

Código de implementación de BrainOS.

Estado actual:

- `mvp-http-client/`: cliente HTTP mínimo para `opencode serve` (issue #1).

Primer objetivo:

- Plugin Obsidian -> OpenCode (`opencode serve`) con flujo HTTP + SSE.

Implementación local inicial:

- `mvp-sse-adapter/`: cliente SSE MVP con adaptador de eventos y pruebas smoke locales.
