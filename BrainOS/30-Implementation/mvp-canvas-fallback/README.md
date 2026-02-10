# MVP-07 Canvas Fallback (.canvas file)

Implementación local mínima del fallback de Canvas para MVP:

- Genera propuesta segura como `*-suggested.canvas`.
- Valida estructura JSON Canvas antes de escribir/aplicar.
- Exige confirmación explícita para sobrescribir (`--approve`).
- Hace backup y rollback seguro ante error de escritura.

## Estructura

- `src/canvas-fallback.js`: lógica principal.
- `src/cli.js`: CLI para `validate`, `propose`, `apply`.
- `tests/canvas-fallback.test.js`: pruebas unitarias + rollback.
- `smoke/run-smoke.sh`: smoke end-to-end local.

## Uso rápido

```bash
# Validar canvas actual
node BrainOS/30-Implementation/mvp-canvas-fallback/src/cli.js validate /ruta/board.canvas

# Generar propuesta en /ruta/board-suggested.canvas
node BrainOS/30-Implementation/mvp-canvas-fallback/src/cli.js propose \
  /ruta/board.canvas \
  BrainOS/30-Implementation/mvp-canvas-fallback/fixtures/sample-proposed.json

# Aplicar propuesta (requiere aprobación explícita)
node BrainOS/30-Implementation/mvp-canvas-fallback/src/cli.js apply /ruta/board.canvas --approve
```

## Validación local

```bash
node --test BrainOS/30-Implementation/mvp-canvas-fallback/tests/canvas-fallback.test.js
BrainOS/30-Implementation/mvp-canvas-fallback/smoke/run-smoke.sh
```
