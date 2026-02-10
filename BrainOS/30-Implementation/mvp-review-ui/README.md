# MVP-05: UI de Revisión de Sugerencias

Implementación local de referencia para la capa de revisión user-in-control del MVP:

- Preview de contenido original vs sugerido.
- Estados de operación: `idle`, `processing`, `ready`, `error`.
- Acciones explícitas: `Aceptar`, `Rechazar`, `Cancelar`.
- Fallback cuando runtime (`opencode serve`) no está disponible.

## Archivos

- `index.html`: shell UI de revisión.
- `styles.css`: estilos responsivos básicos.
- `app.mjs`: integración entre UI y estado.
- `review-state.mjs`: máquina de estados determinística.
- `review-state.test.mjs`: cobertura mínima de interacción.
- `TESTING.md`: validación automática + smoke manual.

## Uso local

Abrir en navegador:

```bash
open BrainOS/30-Implementation/mvp-review-ui/index.html
```

Validar lógica:

```bash
node --test BrainOS/30-Implementation/mvp-review-ui/review-state.test.mjs
```
