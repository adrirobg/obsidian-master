# Obsidian Templates Research - 2026-02-09

## Objetivo
Definir templates iniciales para Zettelkasten en Obsidian, alineados con:
- decisiones cerradas en `AGENTS.md`
- stack de skills de Kepano
- capacidades oficiales de Obsidian Core (sin plugins comunitarios)

## Alcance de investigacion
Se revisaron tres bloques de evidencia:
1. Documentacion oficial de Obsidian.
2. Skill set de `kepano/obsidian-skills`.
3. Fuente metodologica externa de Zettelkasten para reforzar criterios de diseño.

## Hallazgos clave

### 1) Obsidian oficial (implementacion tecnica)
- `Templates` soporta variables nativas `{{title}}`, `{{date}}`, `{{time}}` y formatos Moment.
- `Templates` aplica y fusiona properties/frontmatter al insertar.
- `Properties` usa YAML frontmatter; lista y fechas tienen formato definido.
- `Daily notes` puede crear notas por fecha con template asociado.
- `Unique note creator` crea nombres basados en timestamp (en la propia doc se referencia uso Zettelkasten).
- `Bases` consume properties de notas para vistas/tablas de triage y seguimiento.

Implicacion para estas plantillas:
- Mantener frontmatter simple y consistente.
- Usar solo variables nativas de Templates.
- Preparar metadatos compatibles con futuras `.base`.

### 2) Kepano skills (capacidad del agente)
- `obsidian-markdown`: cubre edicion de `.md` con frontmatter, wikilinks y sintaxis Obsidian.
- `obsidian-bases`: cubre `.base` para filtros, formulas y vistas operativas.
- `json-canvas`: util pero opcional para v0.1.

Implicacion para estas plantillas:
- Las plantillas se diseñan para `.md` + properties primero.
- Se evita dependencia de herramientas externas o flujos no validados.

### 3) Fuente metodologica externa
- Enfoque tradicional de Zettelkasten: notas atomicas, trazabilidad de fuente y enlaces entre ideas.
- La propia documentacion de Obsidian asocia `Unique note creator` con nombres por timestamp para notas tipo Zettelkasten.

Implicacion para estas plantillas:
- `permanent` incluye `zettel_id` obligatorio.
- `literature` incluye `source_ref` obligatorio.
- `index` y `project` quedan como soportes operativos, no sustitutos de `permanent`.

## Decisiones de diseño aplicadas
- Se crearon 5 templates iniciales:
  - `01-Fleeting.md`
  - `02-Literature.md`
  - `03-Permanent.md`
  - `04-Index.md`
  - `05-Project.md`
- Contrato de metadatos aplicado:
  - `kind`, `state`, `created`, `updated` en todos.
  - `zettel_id` en `permanent`.
  - `source_ref` obligado por contenido en `literature` y campo disponible en `permanent`.
- Guardrail cognitivo:
  - `permanent` incluye recordatorio explicito de redaccion propia del usuario.

## Riesgos controlados
- Sobreestructura: mitigado con templates breves y campos minimos.
- Rigidez excesiva: mitigado con placeholders no bloqueantes.
- Perdida de trazabilidad: mitigado con `source_ref`, `project_ref` y secciones de evidencia/enlaces.

## Siguiente paso recomendado
Crear las primeras vistas `.base` de operacion:
- cola de captura (`state = captured`)
- cola de procesado (`kind in [fleeting, literature]`)
- revision de permanentes con pocos enlaces

## Fuentes consultadas (2026-02-09)
- https://help.obsidian.md/plugins/templates
- https://help.obsidian.md/properties
- https://help.obsidian.md/plugins/daily-notes
- https://help.obsidian.md/plugins/unique-note
- https://help.obsidian.md/bases
- https://help.obsidian.md/bases/syntax
- https://github.com/kepano/obsidian-skills
- https://raw.githubusercontent.com/kepano/obsidian-skills/main/skills/obsidian-markdown/SKILL.md
- https://raw.githubusercontent.com/kepano/obsidian-skills/main/skills/obsidian-bases/SKILL.md
- https://zettelkasten.de/introduction/
- https://zettelkasten.de/overview/
