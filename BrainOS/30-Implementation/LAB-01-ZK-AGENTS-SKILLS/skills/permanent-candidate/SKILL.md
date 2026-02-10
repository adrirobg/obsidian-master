---
name: permanent-candidate
description: Evalúa si una nota merece promoción a permanent y propone siguiente paso con revisión humana.
---

# Skill: permanent-candidate

## Cuándo usar

- Cuando una literature o fleeting madura muestra tesis reutilizable.
- Cuando el usuario solicita evaluar promoción a permanent.

## Entrada esperada

- Nota fuente (fleeting/literature).
- Enlaces existentes y contexto de uso reciente (si disponible).

## Criterios mínimos de candidateo

1. Tesis clara en 1-2 frases.
2. Argumento breve en palabras propias.
3. Al menos 2 conexiones potenciales útiles (una puede ser literature).

## Salida obligatoria

1. Veredicto: `apto` | `aun-no-apto`.
2. Evidencia por criterio (cumple/no cumple).
3. Próxima acción concreta para cerrar brecha.
4. Confirmación explícita antes de crear o promover nota permanent.

## Reglas

1. Nunca auto-crear permanent.
2. Si faltan conexiones, proponer búsqueda dirigida antes de promoción.
3. Evitar candidatear por volumen; priorizar calidad semántica.
