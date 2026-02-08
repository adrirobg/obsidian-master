# BrainOS Technical Realtime - Baseline MVP (HTTP + SSE)

## Estado

Documento activo para el MVP v0.1.

Fuente canónica relacionada:
- `BrainOS/00-Meta/CANONICAL-SOURCE-OF-TRUTH-v0.1.md`
- `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-001-Communication-Protocol.md`
- `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-003-Memory-Persistence.md`

Documento legacy movido a:
- `BrainOS/90-Archive/TECHNICAL-REALTIME-WEBSOCKET-LEGACY.md`

---

## 1. Alcance del Realtime en MVP

El MVP no implementa colaboración full-duplex con bridge WebSocket propio.

El modelo realtime confirmado para MVP es:
- Plugin Obsidian -> OpenCode: request HTTP
- OpenCode -> Plugin Obsidian: stream SSE

Objetivo práctico del realtime MVP:
- Mostrar estado de procesamiento en tiempo real
- Mostrar sugerencias del asistente de forma incremental
- Confirmación explícita del usuario antes de aplicar cambios sensibles

---

## 2. Arquitectura de Comunicación MVP

```text
Obsidian Plugin
  ├─ HTTP requests (crear sesión, enviar prompt, acciones)
  └─ SSE subscriber (eventos de progreso y output)
        ⇅
OpenCode serve (:4096)
```

### Principios

1. Simplicidad sobre complejidad de transporte.
2. Compatibilidad con SDK oficial de OpenCode.
3. Trazabilidad de eventos y facilidad de debug.

---

## 3. Contrato de Eventos MVP

Los nombres exactos de eventos deben alinearse con la documentación oficial del SDK/API de OpenCode en cada release.

Tipos de eventos esperados para el plugin:
- inicio/fin de ejecución
- actualización de progreso
- actualización incremental de mensaje/salida
- error recuperable/no recuperable

Regla de implementación:
- No codificar eventos inventados como contrato estable.
- Añadir adaptador de eventos en el plugin para aislar cambios de versión del SDK.

---

## 4. Flujos Realtime Prioritarios

### 4.1 Flujo A - Procesar nota actual

1. Usuario invoca "Procesar nota actual".
2. Plugin envía request HTTP a OpenCode.
3. Plugin abre/usa stream SSE de la sesión.
4. UI muestra progreso incremental.
5. Se presentan sugerencias.
6. Usuario acepta/rechaza.

### 4.2 Flujo B - Procesamiento de Inbox

1. Usuario invoca "Procesar siguiente" o lote pequeño.
2. OpenCode analiza ítems y emite eventos de avance.
3. Plugin muestra avance por ítem.
4. Usuario confirma acciones de organización.

---

## 5. Canvas en MVP (Regla de Riesgo)

Para MVP, Canvas runtime API interna de Obsidian no es requisito.

Camino seguro MVP:
- Trabajar con archivo `.canvas` (JSON Canvas)
- Generar sugerencias como cambios de archivo o archivo `*-suggested.canvas`
- Aplicar solo bajo confirmación del usuario

Esto evita dependencia temprana en API interna no estable.

---

## 6. Estado y Memoria en Realtime

Alineado con ADR-003:
- Estado de sesión en memoria (in-memory)
- Sin persistencia durable conversacional en MVP
- Persistencia mínima solo para configuración del plugin

Límites operativos recomendados MVP:
- historial corto por sesión
- cola acotada de sugerencias pendientes
- limpieza determinística al cerrar plugin/sesión

---

## 7. Requisitos de UX Realtime

1. Estado visible: conectado/desconectado/procesando/error.
2. Feedback incremental sin bloquear editor.
3. Decisiones explícitas en acciones de escritura estructural.
4. Fallback robusto cuando no hay conexión al runtime.

---

## 8. Criterios de Aceptación MVP

1. El plugin conecta con `opencode serve` por HTTP + SSE.
2. Se puede ejecutar al menos un flujo end-to-end de sugerencia.
3. El usuario puede aceptar/rechazar cambios con control total.
4. El sistema degrada de forma segura ante errores de red/runtime.

---

## 9. Fuera de Alcance (Post-MVP)

- Bridge WebSocket custom como transporte principal
- MCP como transporte principal del plugin
- Persistencia durable de memoria conversacional
- Automatización avanzada de Canvas sobre API interna
- Orquestación multi-agente compleja

---

## 10. Próximos Pasos Técnicos

1. Spike corto: smoke test SDK/eventos con `opencode serve`.
2. Spike corto: fallback de sugerencias Canvas por archivo `.canvas`.
3. Implementación del flujo mínimo: "nota actual -> sugerencia -> confirmación".

