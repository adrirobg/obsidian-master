# TECH-DECISIONS-AUDIT

Fecha de auditoria: 2026-02-08  
Repo/rama auditada: `obsidian-master` / `codex/research-tech-v0.1`

## Matriz de decisiones MVP

| Decision | Estado actual | Riesgo | Evidencia | Recomendacion MVP | Post-MVP |
|---|---|---|---|---|---|
| ADR-001 Protocolo (`HTTP+SSE`) vs docs aspiracionales (`WebSocket`) | **Contradiccion activa**: ADR-001 esta cerrado en `HTTP+SSE`, pero README/vision/arquitectura siguen modelando `WebSocket` como canal principal | **ALTO**: implementacion divergente, PoC equivocado, deuda documental inmediata | Interno: `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-001-Communication-Protocol.md:4`, `:20`, `:121` vs `BrainOS/README.md:21`, `BrainOS/VISION-INTEGRATED.md:337`, `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md:64`. Externo (OpenCode oficial): Server docs (`opencode serve`, API HTTP + SSE) y API reference (`client.event.subscribe()`) [Server docs](https://opencode.ai/docs/server) [API reference](https://opencode.ai/docs/api-reference) | **Bloquear MVP en HTTP+SSE + SDK oficial**. El plugin envia comandos por HTTP y consume stream de eventos SSE. Quitar del MVP cualquier puente WebSocket custom entre Obsidian y OpenCode. | Reevaluar WebSocket solo si hay caso probado de latencia/UX no resuelto por SSE+HTTP; de ser necesario, encapsular en gateway propio sin reescribir el core.
| Canvas API (publica vs interna) y fallback | Docs tecnicas asumen eventos/metodos de Canvas no documentados como API publica estable | **ALTO**: dependencia en API interna de Obsidian, riesgo de ruptura por version y alto costo de mantenimiento | Interno: uso de APIs no validadas en `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md:382`, `:390`, `:404`, `:414`, `:432`. Externo: API oficial de plugins (`obsidian.d.ts`) no expone esos contratos de Canvas runtime [obsidian.d.ts](https://raw.githubusercontent.com/obsidianmd/obsidian-api/refs/heads/master/obsidian.d.ts). Obsidian publica el formato `.canvas` como abierto y especificado [JSON Canvas blog](https://obsidian.md/blog/json-canvas/) [JSON Canvas spec](https://jsoncanvas.org/spec/1.0/) | **Fallback MVP obligatorio**: no mutar Canvas en tiempo real via API interna. Trabajar con archivo `.canvas` (parsear/sugerir/aplicar bajo confirmacion de usuario) y/o generar `*-suggested.canvas` para preview seguro. | Spike aislado con feature flag para evaluar API interna de Canvas por version de Obsidian, con degradacion automatica al fallback de archivo.
| ADR-003 Persistencia (in-memory) | **Coherente para MVP** si se limita alcance y memoria | **MEDIO**: perdida de estado al reiniciar + crecimiento de memoria sin limites | Interno: `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-003-Memory-Persistence.md:16`, `:95`, `:181`. Externo: plugin API oficial soporta persistencia simple via `loadData/saveData` para configuracion [obsidian-api README](https://github.com/obsidianmd/obsidian-api) | Mantener in-memory en MVP, pero con limites duros: `messages <= 10`, `pendingSuggestions <= 100`, payload contextual acotado (ej. `<= 256 KB`), y limpieza en `onunload`. Persistir solo config minima en `data.json`/`SecretStorage`. | Cuando exista necesidad real de continuidad entre sesiones, agregar persistencia simple (JSON/SQLite) detras de interfaz sin romper contratos actuales.
| ADR-002 Embeddings | **Pendiente y sobre-disenado** para MVP (auto-activacion, vector DB, multiples providers) | **MEDIO-ALTO**: complejidad prematura, costo, privacidad, mantenimiento | Interno: `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-002-Embedding-Strategy.md:4`, `:61`, `:141`, `:238`. Externo: costos y tradeoffs oficiales de embeddings [OpenAI pricing](https://openai.com/api/pricing/) [Embeddings FAQ](https://help.openai.com/en/articles/6824809-embeddings-faq) | **Recomendacion pragmatica MVP**: sin index semantico persistente. Usar keyword search + wikilinks + contexto incremental. Si se requiere experimento, que sea manual/opt-in y fuera de critical path del MVP. | PoC controlado con vaults reales, metricas (latencia, recall, costo), y solo luego decidir umbrales y proveedor por defecto.
| OpenCode SDK: ejemplos y eventos reales | Hay ejemplos internos potencialmente desactualizados (`createOpencodeClient`, `global.event`) frente a API documentada actual | **MEDIO**: integracion falla por drift de SDK/API | Interno: `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-001-Communication-Protocol.md:53`, `:71`, `:184`. Externo (OpenCode oficial): uso SDK con `createClient`, `client.session.prompt(...).events`, `client.event.subscribe()` y tipos de eventos (`session.updated`, `message.updated`, etc.) [SDK docs](https://opencode.ai/docs/sdk) [API reference](https://opencode.ai/docs/api-reference) | Alinear MVP a ejemplos oficiales vigentes del SDK y modelar eventos desde API reference (no desde pseudocodigo heredado). | Agregar smoke tests de integracion contra `opencode serve` y version pin del SDK para evitar regresiones silenciosas.

## MVP Do / Don't Do

### Do
- Usar **HTTP+SSE** como unico canal MVP para OpenCode.
- Enfocar MVP en flujo minimo: enviar prompt, recibir eventos, mostrar sugerencia, aceptar/rechazar.
- Tratar Canvas en MVP como **archivo `.canvas`** con cambios confirmados por el usuario.
- Mantener estado de sesion in-memory con limites claros y reset deterministico.
- Dejar embeddings fuera del critical path del MVP.

### Don't Do
- No construir bridge WebSocket custom como base del MVP.
- No depender de metodos/eventos Canvas no documentados como API publica estable.
- No introducir SQLite/vector DB antes de validar el flujo principal.
- No activar embeddings automaticamente por tamano de vault en MVP.
- No usar ejemplos SDK no verificados contra docs oficiales actuales.

## Cambios documentales necesarios (sugeridos, NO aplicados)

- `BrainOS/README.md:21` - Cambiar diagrama de `WebSocket` a `HTTP + SSE`.
- `BrainOS/README.md:67` - Reetiquetar `TECHNICAL-REALTIME.md` (hoy dice "Arquitectura WebSocket").
- `BrainOS/README.md:163` - Reemplazar "Bridge WebSocket basico" por "Bridge HTTP+SSE basico".
- `BrainOS/README.md:187` - Actualizar descripcion de arquitectura tecnica (hoy prioriza WebSocket).

- `BrainOS/VISION-INTEGRATED.md:327` - Cambiar "Comunicacion: WebSocket/SSE" a posicion unica MVP (`HTTP+SSE`).
- `BrainOS/VISION-INTEGRATED.md:337` - Cambiar "Protocolo: WebSocket bidireccional" por modelo request/stream (`HTTP + SSE`).
- `BrainOS/VISION-INTEGRATED.md:348` - Ajustar flujo "Envia a OpenCode via WebSocket" a HTTP.
- `BrainOS/VISION-INTEGRATED.md:359` - Ajustar retorno via stream SSE (no WebSocket).
- `BrainOS/VISION-INTEGRATED.md:382` - Revisar config `"websocket": true` y alinear con servidor oficial.
- `BrainOS/VISION-INTEGRATED.md:404` - Cambiar `ws://localhost:4096` por `http://localhost:4096`.
- `BrainOS/VISION-INTEGRATED.md:421` - Cambiar prioridad de PoC de WebSocket a HTTP+SSE.

- `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md:26` - Renombrar "BRIDGE OBSIDIAN (WebSocket)".
- `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md:64` - Reescribir seccion "WebSocket como protocolo principal".
- `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md:170` - Sustituir clase `WebSocket` por cliente HTTP + subscriber SSE.
- `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md:231` - Eliminar/posponer servidor `websocket-server.ts` para MVP.
- `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md:370` - Marcar integracion Canvas runtime como experimental/no-MVP.
- `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md:382` - Quitar evento `canvas:node-moved` como dependencia MVP.
- `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md:404` - Quitar `canvas.createTextNode(...)` del camino MVP.
- `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md:414` - Quitar `canvas.drawEdge(...)` del camino MVP.
- `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md:432` - Quitar `canvas.createRealNode(...)` del camino MVP.

- `BrainOS/10-Technical-Architecture/TECHNICAL-MASTER.md:64` - ADR-001 figura como pendiente; sincronizar a DECIDIDO.
- `BrainOS/10-Technical-Architecture/TECHNICAL-MASTER.md:86` - ADR-003 figura como pendiente; sincronizar a DECIDIDO.
- `BrainOS/10-Technical-Architecture/TECHNICAL-MASTER.md:271` - "Communication: MCP" contradice ADR-001; alinear a HTTP+SSE para MVP.
- `BrainOS/10-Technical-Architecture/TECHNICAL-MASTER.md:275` - "Decidir protocolo" ya no aplica; sustituir por tareas de implementacion MVP.

- `BrainOS/00-Meta/README.md:69` - ADR-001 listado como pendiente; actualizar estado.
- `BrainOS/00-Meta/README.md:71` - ADR-003 listado como pendiente; actualizar estado.

## Fuente primaria consolidada

### OpenCode oficial
- Server docs: <https://opencode.ai/docs/server>
- SDK docs: <https://opencode.ai/docs/sdk>
- API reference (eventos/stream): <https://opencode.ai/docs/api-reference>

### Obsidian oficial
- API typings oficiales (`obsidian.d.ts`): <https://raw.githubusercontent.com/obsidianmd/obsidian-api/refs/heads/master/obsidian.d.ts>
- Repositorio API (README plugin API): <https://github.com/obsidianmd/obsidian-api>
- JSON Canvas announcement: <https://obsidian.md/blog/json-canvas/>
- JSON Canvas spec: <https://jsoncanvas.org/spec/1.0/>

### Embeddings (fuente primaria)
- OpenAI pricing: <https://openai.com/api/pricing/>
- OpenAI embeddings FAQ: <https://help.openai.com/en/articles/6824809-embeddings-faq>

