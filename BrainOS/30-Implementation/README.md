# 30-Implementation

Entregables de implementación MVP integrados (issues #1 a #8).

## Estado

- Bloque MVP de módulos y documentación: completado.
- Estado técnico: validado localmente con tests/smoke por módulo.
- Siguiente fase: integración real en plugin/runtime y validación en uso real.

## Entregables por issue

- Issue #1: `mvp-http-client/`
  cliente HTTP mínimo para `opencode serve`, errores tipados, logger y smoke local.
- Issue #2: `mvp-sse-adapter/`
  parser SSE, cliente con reconexión cancelable, normalización de eventos y pruebas.
- Issue #3: `session/SessionStateManager.js`
  gestor de estado in-memory con límites, TTL opcional y reset determinístico.
- Issue #4: `MVP-04-PROCESAR-NOTA-ACTUAL.md` + `mvp-04-demo/`
  flujo E2E documentado y artefactos de demo.
- Issue #5: `mvp-review-ui/`
  UI de revisión aceptar/rechazar con estado determinístico y pruebas.
- Issue #6: `MVP-06-INBOX-BATCH-FLOW.md`
  flujo de inbox batch pequeño con control explícito del usuario.
- Issue #7: `mvp-canvas-fallback/`
  fallback `.canvas` con validación, backup/rollback y smoke/test.
- Issue #8: `LAB-01-ZK-AGENTS-SKILLS/`
  baseline colaborativo de AGENTS + skills + protocolo de validación.

## Validación rápida

```bash
# Issue #1
cd BrainOS/30-Implementation/mvp-http-client
npm test
npm run smoke

# Issue #2
cd ../mvp-sse-adapter
npm test

# Issue #3
cd ../../..
node --test BrainOS/30-Implementation/session/SessionStateManager.test.js

# Issue #5
node --test BrainOS/30-Implementation/mvp-review-ui/review-state.test.mjs

# Issue #7
node --test BrainOS/30-Implementation/mvp-canvas-fallback/tests/canvas-fallback.test.js
BrainOS/30-Implementation/mvp-canvas-fallback/smoke/run-smoke.sh
```

## Próximo bloque (integración real)

1. Conectar `mvp-http-client` + `mvp-sse-adapter` en un plugin Obsidian mínimo ejecutable.
2. Integrar `SessionStateManager` y `mvp-review-ui` en flujo de nota actual.
3. Integrar `mvp-canvas-fallback` detrás de confirmación explícita.
4. Ejecutar validación metodológica en vault real y registrar fricciones.
