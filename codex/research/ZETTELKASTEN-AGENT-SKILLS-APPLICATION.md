# ZETTELKASTEN AGENT - SKILLS APPLICATION

## Base de diseno
- Fuente 1: transcripts analizados en:
- `codex/research/VIDEO-1-TRANSCRIPT-ANALYSIS.md`
- `codex/research/VIDEO-2-TRANSCRIPT-ANALYSIS.md`
- Fuente 2: skills tecnicas de:
- `https://github.com/kepano/obsidian-skills`

## Decisiones de marco (validadas por usuario, 2026-02-09)
- Regla anti-huerfanas: recomendacion, no regla estricta.
- No recomendar plugins en este diseno.
- Fuentes/IA externa: fuera del alcance del agente.
- Publicar no es objetivo del sistema.

## Objetivo del agente
Gestionar metodo Zettelkasten en Obsidian con control total del usuario y foco en utilidad practica del vault:
- Capturar rapido.
- Triage trazable.
- Distilar en palabras propias.
- Promover a conocimiento reutilizable para trabajo interno.

## Skills que debe usar el agente

### Skill 1 (obligatoria): `obsidian-markdown`
- Uso: creacion/edicion de notas `.md`.
- Se usa en: captura, triage, distill, promocion.
- Razones desde transcript:
- `VIDEO-1 13:27.68`: "convert it into your own word"
- `VIDEO-2 05:00.32`: "reference link section"
- `VIDEO-2 09:23.32`: "as a fleeting note the daily note"

### Skill 2 (obligatoria): `obsidian-bases`
- Uso: vistas operativas `.base` para colas y revision.
- Se usa en: triage y seguimiento de progreso/calidad.
- Razones desde transcript:
- `VIDEO-1 49:36.92`: "value connecting over collecting"
- `VIDEO-1 27:34.52`: proyectos guian insights
- `VIDEO-2 13:50.24`: distill como fase critica

### Skill 3 (opcional/defer): `json-canvas`
- Uso: mapas visuales de relaciones.
- Estado v0.1: no bloqueante.
- Motivo: agrega visualizacion, pero no es necesaria para operar el flujo base.

## Flujo operativo del agente (sin automatizaciones destructivas)

### Captura
- Crear nota en `source|daily|blank|project`.
- Si viene de fuente externa, exigir `reference_link`.
- No bloquear por estructura completa.

### Triage
- Clasificar nota: `external` o `internal`.
- Decidir `drop|keep-inbox|to-atom`.
- Si va a `to-atom`, registrar proyecto/pregunta destino.

### Desarrollo
- Reescribir insight en palabras propias (`atom`).
- Mantener trazabilidad a fuente (si aplica).
- Recomendar enlaces; no exigirlos como bloqueo.

### Promocion interna
- Promover `atom -> molecule` cuando tenga valor para proyecto/pregunta.
- Componer `output interno` desde secuencia de molecules.
- No incluir pasos de publicacion externa.

## Contrato minimo de datos (properties)
- `kind`: `source|daily|blank|project|atom|molecule|output`
- `state`: `captured|triaged|distilled|promoted`
- `origin`: `external|internal`
- `reference_link`: obligatorio si `origin=external`
- `project_ref`: opcional pero recomendado
- `created`: fecha

## Mapeo a componentes internos
- `AGENTS.md`: guardrails de control, reversibilidad y no estricto.
- `vault-bootstrap`: plantillas minimas + bases de cola.
- `zettelkasten-operator`: comandos `capture/triage/distill/promote`.
- `obsidian-safe-editor`: preview diff, confirmacion y rollback.

## Skill stack recomendada para v0.1
- `obsidian-markdown` + `obsidian-bases` como stack minimo operativo.
- `json-canvas` solo cuando el flujo base este estable.
