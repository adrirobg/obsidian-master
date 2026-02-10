# MVP-05 Validation

## Automated

Run:

```bash
node --test BrainOS/30-Implementation/mvp-review-ui/review-state.test.mjs
```

What it validates:
- deterministic accept flow (cannot be overridden after final decision)
- deterministic reject flow (keeps original content)
- runtime error fallback message
- cancel action keeps user control and resets to idle

## Manual UI Smoke

1. Open `BrainOS/30-Implementation/mvp-review-ui/index.html` in a browser.
2. Click `Procesar sugerencia` and wait ~0.5s.
3. Verify state changes from `processing` to `ready` and suggestion preview is filled.
4. Click `Aceptar` and verify result preview equals suggested content.
5. Reload page. Repeat processing and click `Rechazar`; verify result preview equals original content.
6. Reload page and click `Simular error runtime`; verify error text + fallback appear and no original content is lost.
7. Click `Cancelar`; verify final decision is `cancelled` and status returns to `idle`.
