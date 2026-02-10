# Protocolo de Validación Colaborativa (LAB-01)

Estado: Activo para pruebas con notas reales.

## Objetivo

Validar que el baseline de agente + skills mejora el flujo Zettelkasten sin sobre-automatización y con control del usuario.

## Escenario de prueba (meta-trabajo)

Sesión real de Codex dentro de la vault sobre un lote pequeño de inbox (3-8 notas).

## Checklist de pruebas meta-trabajo

1. Se ejecutó una sesión completa `captura -> triage -> organización -> candidateo -> cierre`.
2. Cada ítem del lote terminó con decisión explícita.
3. No hubo auto-creación de permanent sin confirmación.
4. No hubo auto-eliminación de ítems de inbox.
5. Cada sugerencia incluyó justificación breve y confirmación requerida.
6. Se registró al menos una fricción y una mejora propuesta.
7. Se documentó el tiempo aproximado por fase (continuidad vs fricción).

## Formato mínimo de log de sesión

| Fecha | Tamaño lote | Decisiones explícitas (%) | Confirmaciones sensibles | Fricciones | Acción siguiente |
|---|---:|---:|---:|---|---|
| YYYY-MM-DD | n | n% | n | texto breve | texto breve |

## Guardrails anti sobre-automatización (must-pass)

1. No auto-crear permanent.
2. No auto-eliminar inbox.
3. No conexiones automáticas por coincidencia lexical sin validación.
4. No cambios masivos sin paso de confirmación del usuario.

## Pendientes para validar con supervisor (obligatorio antes de v1)

1. Definir umbral aceptable de calidad para candidateo a permanent (`apto` vs `aun-no-apto`).
2. Confirmar nivel de detalle mínimo esperado en justificaciones por sugerencia.
3. Acordar volumen óptimo de lote por sesión (balance continuidad/calidad).
4. Priorizar primeras automatizaciones permitidas tras 2-3 semanas de evidencia.

## Regla de cierre

Este LAB no puede marcarse como final hasta completar al menos una ronda colaborativa con supervisor y registrar decisiones resultantes en este archivo o en acta vinculada.
