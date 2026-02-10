# BrainOS

## Sistema de Gestión del Conocimiento Aumentado por IA

BrainOS es un sistema de colaboración entre Obsidian y un runtime de agentes (OpenCode) para potenciar un flujo Zettelkasten con control humano.

## Estado Actual (MVP v0.1)

- Protocolo: **HTTP + SSE** (ADR-001).
- Estado de sesión: **in-memory** (ADR-003).
- Embeddings, multi-agente y persistencia durable: **post-MVP**.
- Implementación MVP integrada en `30-Implementation` (issues #1 a #8).

## Arquitectura MVP

```text
Obsidian Plugin
  -> HTTP requests
OpenCode serve
  -> SSE events
Obsidian Plugin
```

## Estructura del Proyecto

```text
BrainOS/
├── README.md
├── VISION-INTEGRATED.md
├── 00-Meta/
│   ├── README.md
│   ├── CANONICAL-SOURCE-OF-TRUTH-v0.1.md
│   ├── CANONICAL-CONTRADICTIONS-MAP.md
│   ├── TECH-DECISIONS-AUDIT.md
│   └── METHODOLOGY-GAPS.md
├── 10-Technical-Architecture/
│   ├── TECHNICAL-MASTER.md
│   ├── TECHNICAL-REALTIME.md
│   └── 01-Core-Architecture/
├── 20-Methodology-System/
│   ├── METHODOLOGY-VALIDATION-PLAYBOOK.md
│   └── INBOX-SYSTEM.md
├── 30-Implementation/
└── 90-Archive/
```

## Documentación Activa

- [Fuente Canónica v0.1](00-Meta/CANONICAL-SOURCE-OF-TRUTH-v0.1.md)
- [Mapa de Contradicciones](00-Meta/CANONICAL-CONTRADICTIONS-MAP.md)
- [Auditoría Técnica](00-Meta/TECH-DECISIONS-AUDIT.md)
- [Arquitectura Técnica (MVP)](10-Technical-Architecture/TECHNICAL-MASTER.md)
- [Realtime MVP](10-Technical-Architecture/TECHNICAL-REALTIME.md)
- [Playbook Metodológico](20-Methodology-System/METHODOLOGY-VALIDATION-PLAYBOOK.md)
- [Implementación MVP](30-Implementation/README.md)

## Siguiente Paso de Construcción

1. Integrar `mvp-http-client` y `mvp-sse-adapter` en un esqueleto real de plugin Obsidian.
2. Conectar flujo E2E operativo:
   nota actual -> runtime -> sugerencia -> aceptar/rechazar.
3. Integrar estado de sesión (`SessionStateManager`) en lifecycle de comando/sesión.
4. Integrar fallback `.canvas` con confirmación explícita en UI.
5. Ejecutar validación metodológica en vault real (2-3 semanas) y registrar fricciones.

## Archivo Histórico

La investigación inicial y documentos legacy están en `90-Archive/`.
