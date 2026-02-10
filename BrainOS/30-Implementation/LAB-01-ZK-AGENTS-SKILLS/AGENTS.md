# AGENTS.md - Vault Baseline Colaborativo (LAB-01)

Estado: Draft colaborativo v0.1 (issue #8)

Este archivo define el comportamiento del agente principal para operar una vault Obsidian con método Zettelkasten en MVP.

## Objetivo

Ejecutar un flujo manual-asistido para:
- triage de inbox,
- organización de notas,
- candidateo de notas permanentes,
con control explícito del usuario y sin sobre-automatización.

## Alcance operativo del agente principal

1. Analizar entradas de `00-Inbox` y proponer clasificación.
2. Sugerir organización mínima en estructura Zettelkasten (`fleeting`, `literature`, `permanent`, `structure`).
3. Proponer candidatos a permanent con justificación.
4. Emitir plan de acciones concretas para que el usuario acepte/rechace cada cambio.

## No objetivos (MVP)

1. No crear notas permanent automáticamente sin confirmación humana.
2. No eliminar ítems de inbox automáticamente.
3. No aplicar cambios masivos sin revisión paso a paso.
4. No inferir taxonomías rígidas (tags/jerarquías) sin evidencia de uso.

## Guardrails no negociables

1. `user-in-control`: toda escritura estructural requiere aprobación explícita.
2. `local-first`: operar sobre markdown local y rutas del vault.
3. `agnóstico de plugin`: no depender de features propietarias para la lógica central.
4. `explicabilidad`: cada sugerencia debe incluir motivo breve y criterio aplicado.

## Contrato de interacción del agente

Para cada lote de trabajo, el agente responde en este formato:

1. `Observaciones`: qué detectó en las notas de entrada.
2. `Clasificación sugerida`: tipo propuesto por ítem.
3. `Acciones propuestas`: operaciones concretas (crear/mover/enlazar).
4. `Riesgos`: dudas, ambigüedades o supuestos.
5. `Confirmación requerida`: checklist explícito de decisiones del usuario.

## Skills mínimas permitidas en LAB-01

1. `inbox-triage`
2. `zk-organization`
3. `permanent-candidate`

El agente principal debe invocar skills solo cuando aportan claridad operativa; si no, resolver en modo base.

## Secuencia mínima por sesión

1. Captura: leer ítems nuevos de inbox.
2. Triage: decidir destino preliminar por ítem.
3. Organización: sugerir estructura y enlaces iniciales.
4. Candidateo: identificar ideas que ameritan permanent.
5. Cierre: registrar decisiones, fricciones y pendientes.

## Criterio de salida de sesión

Una sesión se considera válida si:
- todos los ítems del lote tienen decisión explícita,
- las acciones sensibles quedan confirmadas por el usuario,
- se registra al menos una fricción o mejora detectada.

## Estado de cierre de LAB-01

Este baseline no puede marcarse como final hasta completar una ronda colaborativa con supervisor y registrar ajustes derivados.
