# KEPANO OBSIDIAN SKILLS - RESEARCH

## Objetivo
Investigar `kepano/obsidian-skills` y extraer que skills son utiles para un agente que opere Zettelkasten en Obsidian.

## Fuentes primarias usadas
- Repo: `https://github.com/kepano/obsidian-skills`
- Commit auditado: `34c2cda8b29eaeec6793e342b8b56e96ac29f15c` (`2026-01-27`)
- README del repo (scope general).
- `skills/obsidian-markdown/SKILL.md`
- `skills/obsidian-bases/SKILL.md`
- `skills/json-canvas/SKILL.md`
- Docs oficiales de Obsidian:
- `https://help.obsidian.md/properties`
- `https://help.obsidian.md/plugins/templates`
- `https://help.obsidian.md/plugins/daily-notes`
- `https://help.obsidian.md/bases`
- `https://help.obsidian.md/plugins/unique-note`

## Hallazgos clave del repo
- El paquete `obsidian-skills` define 3 skills estandar para agentes:
- `obsidian-markdown`: edicion de `.md` con sintaxis Obsidian (wikilinks, embeds, callouts, properties/frontmatter).
- `obsidian-bases`: edicion de `.base` con filtros, formulas y vistas (table/cards/list/map).
- `json-canvas`: edicion de `.canvas` en formato JSON Canvas.
- El scope es de formato/edicion de archivos, no de metodologia Zettelkasten por si solo.
- La skill mas alineada con operacion diaria de notas es `obsidian-markdown`.
- La skill mas alineada con triage y paneles operativos es `obsidian-bases`.

## Relacion con tus restricciones (ya validadas)
- Sistema no estricto: compatible con skills de formato, porque no fuerzan flujo rigido.
- Sin recomendaciones de plugins: compatible (skills de agente != plugin community).
- Fuentes/IA externa fuera: compatible si el agente opera solo sobre archivos locales del vault.
- Publicar no es objetivo: compatible, ninguna skill obliga publish.

## Evaluacion por fase Zettelkasten

### Captura
- Skill principal: `obsidian-markdown`.
- Motivo: crear notas rapidas (`source`, `daily`, `blank`, `project`) y metadata minima.

### Triage
- Skills: `obsidian-markdown` + `obsidian-bases`.
- Motivo: cambiar estado y propiedades + vistas para cola de trabajo.

### Desarrollo (distill)
- Skill principal: `obsidian-markdown`.
- Motivo: convertir fuente a `atom` en palabras propias y enlazar evidencia.

### Promocion interna (atom -> molecule -> output interno)
- Skills: `obsidian-markdown` + `obsidian-bases`.
- Motivo: promocion de estado y seguimiento de cobertura/reuse por vista.

### Mapeo visual (opcional)
- Skill: `json-canvas`.
- Estado recomendado: `defer` para v0.1, por no ser critica para operar el flujo base.

## Conclusiones practicas
- Skills minimas para el agente v0.1:
- `obsidian-markdown` (obligatoria)
- `obsidian-bases` (obligatoria)
- `json-canvas` (opcional, no bloqueante)
- `kepano/obsidian-skills` cubre bien la capa de formato/estructura.
- La capa metodologica (reglas de captura/triage/desarrollo/promocion) debe vivir en tus skills internas (`vault-bootstrap`, `zettelkasten-operator`, `obsidian-safe-editor`), usando estas skills de Kepano como base tecnica.
