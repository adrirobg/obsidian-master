# ZETTELKASTEN VIDEO SYNTHESIS - ACTIONABLE

- Fuentes: VIDEO 1 (`00LKsV8h6zY`) + VIDEO 2 (`worpx0LOeII`)
- Estado: sintesis accionable para diseno de agente/skills v0.1
- Regla de control: no se cierran decisiones metodologicas conflictivas sin tu validacion explicita.

## Apply Now
- `[VIDEO-1 01:42.32]` "external information separate from your internal knowledge" -> Separar en vault `source-derived` vs `own-insight`.
- `[VIDEO-1 09:10.64]` "always two systems" -> Operar doble flujo: caja externa (captura/citas) y caja interna (ideas conectadas).
- `[VIDEO-1 13:27.68]` "convert it into your own word" -> Promocion exige reescritura en palabras propias.
- `[VIDEO-1 49:36.92]` "value connecting over collecting" -> KPI principal: conexiones utiles por proyecto.
- `[VIDEO-2 05:00.32]` "reference link section" -> Campo obligatorio `reference_link` en notas de fuente.
- `[VIDEO-2 09:23.32]` "as a fleeting note the daily note" -> Habilitar inbox daily para captura rapida.
- `[VIDEO-2 10:20.20]` "new blank note" -> Mantener canal de captura sin friccion.
- `[VIDEO-2 15:20.20]` "atom tag ... page number ... reference link" -> Definir plantilla minima de atom con trazabilidad.
- `[VIDEO-2 17:48.96]` "change this tag to hashtag molecule" -> Estado de promocion explicito atom -> molecule.
- `[VIDEO-2 25:30.24]` "thread them together" -> Componer entregables desde secuencia de molecules.

## Defer
- `[VIDEO-1 06:56.20]` "fleeting notes are meant to be destroyed" -> Diferir purga agresiva hasta politica de retencion.
- `[VIDEO-1 52:33.32]` "we don't want to have any orphan notes" -> Tratar como recomendacion de calidad, no regla estricta.

## Reject
- `[VIDEO-1 51:35.00]` "we want to build in public" -> Rechazar como default (privacidad/contexto BrainOS).
- `[VIDEO-2 22:39.76]` "measure the number of permanent notes" -> Rechazar KPI por cantidad; priorizar utilidad en proyectos.
- `[VIDEO-2 11:47.36]` "auto note mover plugin" -> Rechazar para v0.1 (sin recomendaciones de plugins).
- `[VIDEO-2 36:06.12]` "using Google's notebook LM" -> Rechazar (IA/fuentes externas fuera del alcance).
- `[VIDEO-2 37:23.72]` "without giving my information and data away for training" -> Rechazar dependencia de este claim para el diseno.

## Riesgos si se adopta mal
- Sobrecarga de estructura: demasiados tipos/tags antes de validar uso real.
- Falsa productividad: producir "mas notas" sin mejorar decisiones/proyectos.
- Perdida de control: automatizaciones de movimiento sin vista previa.
- Fuga de contexto sensible: uso de IA externa sin politica de datos.
- Friccion en captura: reglas anti-huerfanas muy duras bloquean ideas tempranas.

## Reglas operativas concretas

### Captura
- Registrar idea/fuente en <60s en uno de cuatro inboxes: `source`, `daily`, `blank`, `project`.
- Si viene de fuente externa, incluir `reference_link` obligatorio.
- No bloquear captura por formato perfecto.

### Triage
- Marcar cada nota como `external` o `internal`.
- Decidir destino: `descartar`, `atomizar`, `mantener en inbox`.
- Exigir al menos una pregunta/proyecto destino para priorizar distilacion.

### Desarrollo
- Convertir insight a atom en palabras propias.
- Promover a molecule solo si conecta con al menos 1 nota existente o 1 proyecto activo.
- Mantener evidencia de origen (link/cita) en cadena source -> atom.

### Promocion
- Crear salida (alloy) desde secuencia de molecules.
- Rellenar gaps solo en etapa de salida, no contaminando atomos fuente.
- Registrar reusable fragments de vuelta al vault para uso interno.

## Implicaciones para AGENTS.md
- Agregar guardrail: ningun movimiento/renombrado masivo sin `preview` y `confirm`.
- Definir estados de nota obligatorios para el agente: `captured`, `triaged`, `atom`, `molecule`, `output`.
- Forzar trazabilidad: si nota deriva de fuente, requerir `reference_link`.
- Priorizar tareas guiadas por proyecto/pregunta; evitar coleccion pasiva.
- Regla de seguridad: operaciones reversibles por defecto (`undo-log`/journal).

## Implicaciones para skills
- `vault-bootstrap`: crear plantillas minimas (`source`, `daily`, `atom`, `molecule`, `output`) y taxonomia de estados.
- `zettelkasten-operator`: implementar comandos `capture`, `triage`, `distill`, `promote`, `compose-output`.
- `obsidian-safe-editor`: garantizar edicion no destructiva, diff previo y rollback.
- Skill nueva sugerida `claim-trace-auditor`: validar que toda recomendacion tenga `timestamp + cita + decision`.

## Decisiones validadas por usuario (2026-02-09)
- Regla anti-huerfanas: recomendacion, no estricta.
- Plugins: no hacer recomendaciones de plugins en este diseno.
- IA/fuentes externas: fuera del alcance.
- Publicacion: no es objetivo de este sistema.
