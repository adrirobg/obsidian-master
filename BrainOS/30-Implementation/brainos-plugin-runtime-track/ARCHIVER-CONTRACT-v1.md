# ARCHIVER-CONTRACT-v1

Estado: Draft técnico v1 (orientado a implementación e issues)  
Fuente base: `BrainOS/30-Implementation/NEXT-PHASE-BRAINOS-METHODOLOGICAL-PLAN.md`

## 1) Objetivo

Definir un contrato técnico determinista entre plugin y agente `archiver` para que BrainOS:

1. Clasifique notas en metodología Zettelkasten.
2. Proponga cambios estructurados y aplicables por el plugin.
3. Mantenga guardrails de `user-in-control`.

Este contrato reemplaza la salida libre de texto para la lógica metodológica.

## 2) Alcance

Incluye:

1. Contrato de entrada al agente (contexto que envía plugin).
2. Contrato de salida parseable del agente.
3. Reglas de validación y rechazo de propuestas.
4. Semántica de aplicación (`frontmatter + links + move`).

No incluye:

1. Estrategia de release del plugin.
2. Multi-agente post-MVP.
3. Persistencia durable conversacional.

## 3) Taxonomía y decisiones (cerradas)

### 3.1 Tipos de nota

- `fleeting`
- `literature`
- `permanent`
- `structure`

### 3.2 Decisiones operativas

- `process_now`
- `review_later`
- `discard`

### 3.3 Carpetas objetivo v1

- `00-Inbox`
- `10-Literature`
- `20-Permanent`
- `25-MOC`

## 4) Contrato de entrada (plugin -> archiver)

El plugin debe construir un payload lógico con esta forma (en JSON dentro del prompt o cuerpo estructurado según cliente):

```ts
type BrainOSCommand = "process-current-note" | "process-inbox-item";

interface ArchiverInputV1 {
  schemaVersion: "brainos.archiver.input.v1";
  command: BrainOSCommand;
  note: {
    path: string;
    content: string;
    title?: string;
  };
  vaultPolicy: {
    inboxFolder: "00-Inbox";
    literatureFolder: "10-Literature";
    permanentFolder: "20-Permanent";
    mocFolder: "25-MOC";
  };
  constraints: {
    maxSuggestedLinks: 3;
    applyMode: "frontmatter+links+move";
    requireExplicitConfirmation: true;
    noAutoDeleteInbox: true;
    noAutoCreatePermanentWithoutConfirmation: true;
  };
}
```

Reglas obligatorias:

1. `note.content` debe enviarse completo, sin truncar silenciosamente.
2. `command` debe reflejar el comando real invocado.
3. El plugin no debe delegar decisiones de guardrail al agente.

## 5) Contrato de salida (archiver -> plugin)

El agente debe devolver **exactamente un objeto JSON** válido, sin texto adicional.

```ts
type BrainOSNoteType = "fleeting" | "literature" | "permanent" | "structure";
type BrainOSDecision = "process_now" | "review_later" | "discard";
type BrainOSMoveTarget = "00-Inbox" | "10-Literature" | "20-Permanent" | "25-MOC" | null;

interface ArchiverProposalV1 {
  schemaVersion: "brainos.archiver.v1";
  notePath: string;
  noteType: BrainOSNoteType;
  decision: BrainOSDecision;
  confidence: number; // 0..1
  rationale: string; // 1-3 frases, explicable
  frontmatterPatch: Record<string, unknown>;
  tagsAdd: string[];
  linksSuggest: string[]; // wikilinks destino
  moveTarget: BrainOSMoveTarget;
  warnings: string[];
}
```

Salida de error controlada opcional:

```ts
interface ArchiverProposalErrorV1 {
  schemaVersion: "brainos.archiver.error.v1";
  notePath: string;
  reason: string;
  recoverable: boolean;
  warnings: string[];
}
```

## 6) Reglas de validez de propuesta

Una propuesta es válida solo si cumple todo:

1. `schemaVersion === "brainos.archiver.v1"`.
2. `notePath` coincide exactamente con la nota procesada.
3. `confidence` entre `0` y `1`.
4. `rationale` no vacío.
5. `moveTarget` permitido para el tipo/decisión.
6. `linksSuggest.length <= 3`.
7. `linksSuggest` sin duplicados y sin self-link obvio a `notePath`.

Reglas de coherencia tipo-decisión:

1. `decision = discard`:
- `moveTarget` debe ser `null`.
- `frontmatterPatch` no debe incluir cambios destructivos.
2. `noteType = structure`:
- `moveTarget` recomendado `25-MOC` o `null` si ya está allí.
3. `noteType = literature`:
- `moveTarget` recomendado `10-Literature` o `null` si ya está allí.
4. `noteType = permanent`:
- no se aplica sin confirmación explícita del usuario.

Si falla cualquier regla: el plugin debe rechazar propuesta y no escribir.

## 7) Semántica de aplicación (accept/reject)

### 7.1 `reject`

1. No se modifica archivo.
2. Se registra decisión rechazada.

### 7.2 `accept`

Aplicación en este orden:

1. Merge no destructivo de `frontmatterPatch`.
2. Inserción/actualización de bloque `## Conexiones sugeridas` con `linksSuggest`.
3. Move de nota a `moveTarget` si cambia carpeta.
4. Registro de decisión aceptada.

No permitido en v1:

1. Borrado automático.
2. Renombrado automático.
3. Reescritura total del cuerpo por defecto.

## 8) Ejemplo mínimo válido

```json
{
  "schemaVersion": "brainos.archiver.v1",
  "notePath": "00-Inbox/idea-x.md",
  "noteType": "literature",
  "decision": "process_now",
  "confidence": 0.82,
  "rationale": "La nota referencia una fuente externa y resume ideas clave.",
  "frontmatterPatch": {
    "type": "literature",
    "status": "reviewed",
    "source": "https://example.com/article"
  },
  "tagsAdd": ["literature", "topic/productividad"],
  "linksSuggest": ["[[20240205 - Sistemas vs Metas]]"],
  "moveTarget": "10-Literature",
  "warnings": []
}
```

## 9) Criterios de aceptación del contrato (para issue)

1. Plugin valida propuesta por schema y reglas de coherencia.
2. Propuestas inválidas no escriben y reportan error claro.
3. Flujo `accept/reject` aplica guardrails en ambos comandos actuales.
4. Casos `discard` no hacen operaciones irreversibles.
5. Tests cubren parseo, validación y aplicación mínima.

## 10) Referencias

1. `BrainOS/30-Implementation/NEXT-PHASE-BRAINOS-METHODOLOGICAL-PLAN.md`
2. `BrainOS/30-Implementation/LAB-01-ZK-AGENTS-SKILLS/AGENTS.md`
3. `BrainOS/30-Implementation/LAB-01-ZK-AGENTS-SKILLS/skills/inbox-triage/SKILL.md`
4. `BrainOS/30-Implementation/LAB-01-ZK-AGENTS-SKILLS/skills/zk-organization/SKILL.md`
5. `BrainOS/30-Implementation/LAB-01-ZK-AGENTS-SKILLS/skills/permanent-candidate/SKILL.md`
