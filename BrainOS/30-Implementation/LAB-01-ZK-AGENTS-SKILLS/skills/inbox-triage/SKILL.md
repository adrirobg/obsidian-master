---
name: inbox-triage
description: Clasifica entradas de inbox con decisiones explícitas y sin automatización irreversible.
---

# Skill: inbox-triage

## Cuándo usar

- Cuando hay nuevas notas en `00-Inbox`.
- Cuando hay backlog sin decisión en <= 72h.

## Entrada esperada

- Lista de notas o rutas de notas en inbox.
- Contexto mínimo de foco actual del usuario (opcional).

## Salida obligatoria por ítem

1. Tipo sugerido: `fleeting` | `literature` | `candidato-permanent` | `descartar`.
2. Decisión propuesta: `procesar ahora` | `review later` | `descartar`.
3. Justificación breve (1-2 líneas).
4. Confirmación requerida del usuario.

## Reglas

1. No borrar ni mover archivos automáticamente.
2. No convertir a permanent en esta skill.
3. Priorizar claridad de decisión sobre completitud de metadatos.

## Checklist de calidad

- Cada ítem termina con una decisión explícita.
- Las ambigüedades quedan marcadas como pregunta abierta.
- No hay acciones irreversibles sin aprobación.
