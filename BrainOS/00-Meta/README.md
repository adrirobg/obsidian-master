# BrainOS Meta

Este directorio contiene la documentación de gobierno del proyecto.

## Documentos Canónicos

- `CANONICAL-SOURCE-OF-TRUTH-v0.1.md`: decisiones cerradas MVP y alcance real.
- `CANONICAL-CONTRADICTIONS-MAP.md`: contradicciones detectadas y estado de resolución.
- `TECH-DECISIONS-AUDIT.md`: auditoría técnica que respalda decisiones MVP.
- `METHODOLOGY-GAPS.md`: brechas metodológicas detectadas y priorizadas.

## Estado de Decisiones

- Cerradas en MVP:
  - ADR-001 (protocolo HTTP+SSE)
  - ADR-003 (estado in-memory)
- Pendientes:
  - ADR-002 (embeddings)
  - ADR-004 (orquestación multi-agente)
  - ADR-005 (deployment)

## Regla de Prioridad

Si hay conflicto entre documentos de visión y baseline técnico, prevalece:

1. `CANONICAL-SOURCE-OF-TRUTH-v0.1.md`
2. ADRs en `10-Technical-Architecture/01-Core-Architecture/`
3. `TECHNICAL-MASTER.md`

## Historial

La documentación de investigación inicial, peer review y planificación temprana fue movida a `../90-Archive/`.
