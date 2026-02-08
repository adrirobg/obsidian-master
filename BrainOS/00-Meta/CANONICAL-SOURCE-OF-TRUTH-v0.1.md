# BrainOS - Canonical Source of Truth v0.1

Fecha: 2026-02-08  
Estado: Activo (fuente de verdad para MVP)

Este documento define la verdad canónica de BrainOS v0.1.  
Si existe conflicto con otros documentos de alto nivel, **prevalece este documento** junto con ADR-001 y ADR-003.

## 1) MVP confirmado (decisiones cerradas)

| Tema | Decisión cerrada MVP v0.1 | Fuente | Post-MVP |
|---|---|---|---|
| Protocolo Obsidian ↔ OpenCode | **HTTP + SSE** (HTTP para comandos, SSE para eventos) | `10-Technical-Architecture/01-Core-Architecture/ADR-001-Communication-Protocol.md` | Evaluar MCP/WebSocket solo con evidencia de necesidad real |
| Persistencia de estado | **In-memory** durante sesión; persistencia durable fuera de alcance MVP | `10-Technical-Architecture/01-Core-Architecture/ADR-003-Memory-Persistence.md` | Evaluar JSON/SQLite en v1.1+ |
| Persistencia mínima permitida | Solo configuración del plugin (`data.json` + SecretStorage) | ADR-003 | Mantener separación entre config y memoria conversacional |
| Modo metodológico de validación | Ciclo **manual-asistido de 2-3 semanas** con usuario en control | `20-Methodology-System/METHODOLOGY-VALIDATION-PLAYBOOK.md` | Automatizar solo fricciones repetibles |
| Guardrails de validación | No auto-crear permanent, no auto-eliminar inbox, no sobre-automatizar | `20-Methodology-System/METHODOLOGY-VALIDATION-PLAYBOOK.md` | Revisar guardrails tras evidencia de uso |

## 2) Pendientes reales (abiertos)

Solo se consideran abiertos los siguientes puntos:

1. **ADR-002 (Embeddings)**
Motivo: no hay umbral validado de activación ni evidencia de ROI en el flujo MVP.

2. **ADR-004 (Orquestación multi-agente)**
Motivo: el MVP prioriza flujo base y control del usuario; especialización de agentes se valida después.

3. **ADR-005 (Modelo de deployment)**
Motivo: decisión dependiente de estabilidad del flujo MVP y necesidades reales de operación.

4. **Integración Canvas runtime no documentada oficialmente**
Motivo: alto riesgo de dependencia en API interna; para MVP se privilegia flujo seguro y confirmable.

5. **Persistencia durable de memoria conversacional**
Motivo: explícitamente postergada por ADR-003 hasta validar necesidad concreta.

## 3) Metodología baseline (resumen operativo)

Resumen operativo aprobado para v0.1:

- Ejecutar un ciclo de validación de **2-3 semanas** enfocado en continuidad y calidad, no en volumen bruto.
- Seguir bucle diario: **captura → procesamiento inbox → development literature → promoción a permanent → revisión de conexiones**.
- Definir notas por criterio de “hecho” (fleeting, literature, permanent, structure) antes de automatizar.
- Registrar fricciones con formato único y automatizar solo cuando la regla sea estable y repetible.
- Mantener principios no negociables: **user-in-control, local-first, agnosticismo, Zettelkasten nativo**.

Referencia primaria:
- `BrainOS/20-Methodology-System/METHODOLOGY-VALIDATION-PLAYBOOK.md`

## 4) Do / Don’t del MVP

### Do

- Implementar integración base con `opencode serve` por HTTP+SSE.
- Mantener estado transitorio in-memory con límites explícitos.
- Exigir confirmación del usuario antes de aplicar cambios relevantes en notas/canvas.
- Priorizar flujo mínimo completo: prompt → evento → sugerencia → aceptar/rechazar.
- Medir continuidad del flujo y calidad de conexiones antes de sumar complejidad.

### Don’t

- No construir bridge WebSocket custom como base del MVP.
- No tratar MCP como transporte principal de v0.1.
- No introducir persistencia durable (SQLite/vector DB) en el critical path MVP.
- No depender de APIs internas no estables de Canvas como requisito del flujo base.
- No automatizar decisiones cognitivas críticas sin validación humana explícita.

## 5) Orden de implementación recomendado

1. **Transporte MVP**: health check + sesión + prompt por HTTP; stream de eventos por SSE.
2. **Flujo funcional mínimo**: mostrar sugerencia en Obsidian y aplicar con confirmación.
3. **Estado de sesión**: gestor in-memory con límites y limpieza en cierre.
4. **Loop metodológico**: ejecutar playbook 2-3 semanas y registrar fricciones/decisiones.
5. **Cierre de pendientes**: decidir ADR-002/004/005 con evidencia de uso real, no por anticipación.

---

Relación con la visión:
- La visión post-MVP (multi-agente, persistencia avanzada, mayor autonomía) **se conserva**.
- Esa visión no bloquea ni redefine el alcance del MVP v0.1.
