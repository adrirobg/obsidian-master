# Fase Siguiente: BrainOS Metodológico (Archivero Zettelkasten) sobre MVP Técnico

## Resumen
Pasamos de un plugin que “procesa texto” a un plugin que aplica metodología BrainOS/Zettelkasten de forma operativa.  
La integración técnica actual (Obsidian ↔ OpenCode, HTTP+SSE, flujos nota/inbox) se mantiene, pero cambia el contrato funcional: el agente devuelve propuestas estructuradas de clasificación, metadatos, enlaces y movimiento de nota, con confirmación explícita por nota.

Además, esta fase incluye explícitamente la creación y versionado de **Skills del agente** para separar responsabilidades metodológicas y mantener prompts mantenibles.

## Estado actual y objetivo
1. Estado actual:
- Plugin usable: `Process current note` + `Process Inbox Batch`.
- Runtime conectado por HTTP+SSE.
- Guardrails activos (sin auto-delete, confirmación humana).
2. Objetivo de esta fase:
- Implementar el “archivero metodológico” de BrainOS.
- Mantener comandos actuales, pero con nueva lógica funcional.
- Aplicación directa para todos (sin feature flag), con confirmación por nota.

## Decisiones cerradas en esta sesión
1. Topología de agentes:
- Inicio con **1 agente** (`archiver`).
2. Config OpenCode:
- **Versionada en repo/vault**.
3. Routing plugin:
- Siempre explícito por request (`agent` + `sessionID`).
4. Contrato metodológico:
- Tipo de nota: `fleeting | literature | permanent | structure`.
- Decisión operativa separada: `process_now | review_later | discard`.
5. Aplicación:
- **Por nota con confirmación**.
- Superficie v1: **frontmatter + links + move**.
6. Comandos:
- Se mantienen los actuales.
7. Permanent:
- Promoción solo con confirmación explícita.
8. Carpetas v1:
- `00-Inbox`, `10-Literature`, `20-Permanent`, `25-MOC`.
- Sin carpeta `.bases` en v1.
9. Cierre de fase:
- “Cuando funcione en real” + base técnica en verde.

## Cambios importantes de interfaz/tipos (decision-complete)

### 1) Contrato de salida del agente (nuevo, obligatorio)
El agente `archiver` debe devolver **JSON estructurado** parseable por plugin (no markdown libre).

```ts
type BrainOSNoteType = "fleeting" | "literature" | "permanent" | "structure";
type BrainOSDecision = "process_now" | "review_later" | "discard";

interface ArchiverProposalV1 {
  schemaVersion: "brainos.archiver.v1";
  notePath: string;
  noteType: BrainOSNoteType;
  decision: BrainOSDecision;
  confidence: number; // 0..1
  rationale: string; // breve, explicable
  frontmatterPatch: Record<string, unknown>; // merge no destructivo
  tagsAdd: string[];
  linksSuggest: string[]; // wikilinks destino
  moveTarget: "00-Inbox" | "10-Literature" | "20-Permanent" | "25-MOC" | null;
  warnings: string[];
}
```

### 2) Política de aplicación (aceptar/rechazar)
1. `reject`:
- No escribe nada.
2. `accept`:
- Aplica `frontmatterPatch` (merge preservando campos existentes).
- Inserta/actualiza bloque `## Conexiones sugeridas` con `linksSuggest`.
- Mueve archivo si `moveTarget` cambia carpeta.
- Registra decisión en estado de sesión.

### 3) Política metodológica por tipo
1. `fleeting`:
- Mantener o mover a `00-Inbox`.
2. `literature`:
- Mover a `10-Literature`.
3. `permanent`:
- Mover a `20-Permanent` solo tras aceptación.
4. `structure`:
- Mover a `25-MOC`.
5. `discard`:
- No borrar ni archivar automáticamente; mantener nota y marcar estado en metadato/tag.

## Diseño OpenCode (config y runtime)

### 1) Config versionada en repo
1. Añadir configuración de agente en scope de proyecto (por ejemplo `.opencode/...`) en este repo:
- `/Users/adri/dev/obsidian-master/.opencode/opencode.jsonc`
- `/Users/adri/dev/obsidian-master/.opencode/agents/archiver.md`
2. Definir `agent.archiver` con prompt metodológico BrainOS.
3. Mantener guardrails de herramientas mutables en deny cuando corresponda.

### 2) Uso de API (v1.1.53 y verificación dinámica)
1. `opencode serve` para infraestructura (`--hostname`, `--port`, `--cors`, auth opcional).
2. Envío: `POST /session/:id/message` con `agent: "archiver"`.
3. Eventos: `GET /event` con filtro **client-side** por `sessionID`.
4. Verificación de contrato al arranque:
- Consultar `/doc` y validar endpoints/campos requeridos.
- Si hay drift, degradar con error explícito y sin escritura.

## Skills del agente (nuevo workstream obligatorio)

### 1) Objetivo
Externalizar la lógica metodológica en skills versionadas para que el comportamiento del agente sea modular, auditable y evolucionable.

### 2) Estructura propuesta
- `/Users/adri/dev/obsidian-master/.opencode/skills/brainos-inbox-triage/SKILL.md`
- `/Users/adri/dev/obsidian-master/.opencode/skills/brainos-zk-organization/SKILL.md`
- `/Users/adri/dev/obsidian-master/.opencode/skills/brainos-permanent-candidate/SKILL.md`
- `/Users/adri/dev/obsidian-master/.opencode/skills/brainos-link-suggester/SKILL.md`

### 3) Contrato de cada skill
Cada skill define:
1. Cuándo usarla.
2. Entrada esperada.
3. Salida estructurada compatible con `ArchiverProposalV1` (o subobjeto).
4. Guardrails.
5. Casos límite y degradación segura.

### 4) Orquestación dentro de `archiver`
1. `brainos-inbox-triage`: clasifica tipo + decisión.
2. `brainos-zk-organization`: define frontmatter/tags/moveTarget.
3. `brainos-link-suggester`: propone wikilinks y justificación breve.
4. `brainos-permanent-candidate`: valida promoción a permanent con criterios mínimos.

### 5) Regla de evolución
- En v1: un solo agente `archiver` usa internamente skills.
- En fases posteriores: posibilidad de separar en múltiples agentes sin romper contrato plugin.

## Plan de implementación (secuencia)

## 1) Workstream A: Contrato metodológico y prompt archiver
1. Formalizar `brainos.archiver.v1` en documento técnico.
2. Definir prompt del archivero con reglas ZK + guardrails.
3. Incluir ejemplos positivos/negativos de clasificación y salida JSON.

## 2) Workstream B: Skills del archiver (nuevo)
1. Crear los 4 skills base.
2. Alinear cada skill con LAB-01 y taxonomía cerrada.
3. Añadir ejemplos de I/O por skill.
4. Integrar referencias de skills en configuración del agente.

## 3) Workstream C: Parser robusto y validación de propuesta
1. Reemplazar flujo “texto libre” por parser JSON con validación estricta.
2. Si salida inválida:
- No aplicar cambios.
- Mostrar motivo y pedir reintento controlado.

## 4) Workstream D: Aplicador de cambios granulares
1. Implementar utilidades para:
- merge de frontmatter,
- actualización de bloque de enlaces,
- move de archivo entre carpetas.
2. Garantizar idempotencia y no pérdida de contenido.

## 5) Workstream E: Integración en comandos actuales
1. `BrainOS: Process current note` usa archiver proposal.
2. `BrainOS: Process Inbox Batch` idem por ítem.
3. Mantener confirmación por nota y resumen de batch.

## 6) Workstream F: Config OpenCode en repo + startup checks
1. Añadir artefactos de config versionada.
2. Añadir check de `/doc` y health para compatibilidad real.

## 7) Workstream G: Validación real y cierre de fase
1. Ejecutar baseline técnica.
2. Ejecutar sesiones reales en vault con checklist metodológico.
3. Cerrar cuando “funcione en real” sin violar guardrails.

## Test cases y escenarios

### 1) Unitarios
1. Parseo de `ArchiverProposalV1` válido.
2. Rechazo de proposal inválida (schema/version/campos).
3. Merge frontmatter preservando claves existentes.
4. Inserción/actualización de sección `Conexiones sugeridas`.
5. Move de archivo entre carpetas objetivo.

### 2) Unitarios de skills
1. `inbox-triage`: misma entrada, misma clase/decisión esperada.
2. `zk-organization`: metadata/moveTarget coherentes por tipo.
3. `permanent-candidate`: veredicto por criterios mínimos (tesis, argumento, conexiones).
4. `link-suggester`: 1-3 links sugeridos con justificación semántica no inventada.

### 3) Integración runtime
1. `/session/:id/message` con `agent=archiver` produce propuesta parseable.
2. Stream `/event` con eventos de múltiples sesiones se filtra correctamente.
3. Drift de contrato detectado vía `/doc` bloquea aplicación de cambios.

### 4) E2E funcional
1. Flujo nota actual:
- classify + proposal + accept aplica; reject no aplica.
2. Flujo inbox batch:
- cada ítem con decisión explícita y resumen final.
3. Guardrails:
- no auto-delete inbox,
- no cambios sin confirmación,
- no promoción permanent automática sin aceptar.

## Criterios de aceptación de esta fase
1. Técnica:
- `lint`, `typecheck`, `test`, `build` en verde.
2. Funcional BrainOS:
- Comandos actuales aplican metodología archivera (no rewriter libre).
3. Skills:
- Skills versionadas, integradas y testeadas como fuente modular de lógica.
4. Operativa real:
- Sesiones reales en vault funcionando sin violaciones de guardrails.
5. Trazabilidad:
- Decisiones y resultados visibles por nota y por lote.

## Riesgos y mitigaciones
1. Drift de esquema OpenCode:
- Mitigar con validación `/doc` + parser estricto + fallback seguro.
2. Salida no determinista del LLM:
- Mitigar con contrato JSON y validación dura.
3. Ruido de enlaces/tags:
- Mitigar con límites por propuesta y revisión humana obligatoria.
4. Complejidad de estructura:
- Mitigar manteniendo v1 en `00/10/20/25` y sin `.bases`.

## Suposiciones y defaults elegidos
1. Contrato de salida óptimo: JSON estructurado.
2. Numeración `MOC`: `25-MOC`.
3. `discard` no elimina ni archiva automáticamente.
4. Sin feature flag; reemplazo directo del comportamiento actual.
5. Sin carpeta `.bases` en v1 (se modela con `10-Literature` + metadatos).
6. Skills del agente son parte obligatoria del alcance de fase.
