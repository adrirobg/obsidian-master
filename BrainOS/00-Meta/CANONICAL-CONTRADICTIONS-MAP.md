# BrainOS - Canonical Contradictions Map (v0.1)

Fecha: 2026-02-08

| Archivo | Contradicción | Estado | Cambio aplicado | Nota |
|---|---|---|---|---|
| `BrainOS/README.md` | Arquitectura y roadmap del MVP centrados en WebSocket, en conflicto con ADR-001 | resuelta | Diagrama, roadmap y sección de documentación actualizados a HTTP+SSE + referencia canónica | Mantiene visión realtime sin cambiar alcance técnico |
| `BrainOS/VISION-INTEGRATED.md` | Flujo y configuración con `WebSocket`/`ws://localhost:4096` para MVP | resuelta | Secciones de protocolo, stack, flujo de datos y config migradas a HTTP+SSE (`http://localhost:4096`) | Se preserva visión futura, pero se separa explícitamente MVP vs post-MVP |
| `BrainOS/10-Technical-Architecture/TECHNICAL-MASTER.md` | ADR-001 y ADR-003 marcados como pendientes; comunicación preferida MCP | resuelta | ADR-001/003 sincronizados a DECIDIDO; stack y próximos pasos alineados al baseline MVP | Añadida nota de alcance para evitar interpretar vector/graph como requisito MVP |
| `BrainOS/00-Meta/README.md` | Lista de pendientes incluía ADR-001/003 y narrativa de memoria persistente en MVP | resuelta | Estado y pendientes actualizados; ADR abiertos reducidos a 002/004/005; memoria persistente movida a post-MVP | Incluye enlaces a documentos canónicos y playbook |
| `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md` | Documento modelaba WebSocket y dependencias avanzadas como base | resuelta | Se archivó versión legacy y se creó baseline realtime MVP alineado a HTTP+SSE | Legacy disponible en `BrainOS/90-Archive/TECHNICAL-REALTIME-WEBSOCKET-LEGACY.md` |
| `BrainOS/20-Methodology-System/METHODOLOGY-MASTER.md` | Convive visión de evolución amplia sin checklist operativo de validación | parcial | No se reescribió; se consolidó baseline operativo en documento canónico + referencia al playbook | La fuente operativa v0.1 es el playbook de validación |

## Resumen operativo

- Contradicciones críticas de protocolo en documentos principales: **cerradas**.
- Contradicciones de persistencia MVP en documentos principales: **cerradas**.
- Deuda documental crítica de protocolo: **cerrada** en documentos principales y realtime MVP.
