# Templates v0.1 - Vault Agent Core

## Objetivo
Plantillas iniciales para empezar a operar Zettelkasten en Obsidian sin plugins comunitarios.

Tipos cubiertos:
- `fleeting`
- `literature`
- `permanent`
- `index`
- `project`

## Configuracion minima en Obsidian (core)
1. Activar `Templates` (Core plugins).
2. Configurar `Template folder location` hacia esta carpeta:
   - `BrainOS/30-Implementation/Vault-Agent-Core/Templates`
3. (Opcional) Activar `Unique note creator` para notas tipo `permanent`.
4. (Opcional) En `Unique note creator -> Template file location` usar:
   - `BrainOS/30-Implementation/Vault-Agent-Core/Templates/03-Permanent.md`

## Contrato de metadatos aplicado
- `kind`: `fleeting|literature|permanent|index|project`
- `state`: `captured|processed|linked|reviewed`
- `created`: fecha ISO
- `updated`: fecha ISO
- `zettel_id`: obligatorio en `permanent`
- `source_ref`: obligatorio en `literature` y en `permanent` derivada de fuente

## Nota operativa
- Las plantillas reducen friccion estructural, no sustituyen procesamiento cognitivo del usuario.
- La nota `permanent` incluye recordatorio explicito de autoria intelectual del usuario.
