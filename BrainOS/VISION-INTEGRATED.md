# BrainOS - Visión Integrada: Ecosistema Colaborativo

## 1. Filosofía: Pair Programming con IA

BrainOS no es una herramienta que "ejecuta comandos", es un **colaborador cognitivo** que trabaja junto a ti en tiempo real.

### Metáfora Correcta
- ❌ No es: "Le pido a la IA que haga algo y espero resultado"
- ✅ Sí es: "Trabajo junto a un compañero experto en Zettelkasten que ve lo que hago y colabora"

## Estado canónico v0.1 (MVP)

- **Decisión cerrada (ADR-001)**: integración Obsidian ↔ OpenCode por `HTTP + SSE`.
- **Decisión cerrada (ADR-003)**: estado transitorio in-memory durante sesión; persistencia durable, solo post-MVP.
- La visión multi-agente y de autonomía avanzada se mantiene como dirección **post-MVP**.

## 2. Modalidades de Colaboración

### 2.1 Modo Canvas: Visual & Espacial

**Escenario**: Estás organizando ideas sobre "Productividad" en el Canvas de Obsidian.

**Experiencia**:
```
Usuario: Arrastra notas sobre productividad al Canvas
BrainOS: Detecta patrón y sugiere visualmente:
  - "¿Quieres que agrupe estas notas por tema?"
  - Dibuja líneas sugeridas entre conceptos relacionados
  - Crea nodos de síntesis automáticos
  
Usuario: Acepta algunas sugerencias, rechaza otras
BrainOS: Aprende preferencias, refina próximas sugerencias
```

**Implementación**:
- Plugin Obsidian monitorea Canvas API
- OpenCode analiza estructura y sugiere cambios
- Comunicación bidireccional en tiempo real
- Visualización de "intención del agente" (ghost nodes, previews)

### 2.2 Modo Editor: Inline & Contextual

**Escenario**: Escribiendo una nota permanente.

**Experiencia**:
```
Usuario: Escribe "La atención profunda requiere eliminar distracciones"
BrainOS: Sugiere inline (ghost text):
  "¿Quieres añadir referencia a [[Cal Newport]]?"
  
Usuario: Presiona Tab para aceptar
BrainOS: Inserta wikilink y busca notas relacionadas
```

**Implementación**:
- Editor extensions de Obsidian
- Inline suggestions tipo GitHub Copilot
- Context menu con acciones de BrainOS
- Highlighting de conceptos detectados

### 2.3 Modo Terminal: Power & Batch

**Escenario**: Tareas complejas que requieren procesamiento masivo.

**Experiencia**:
```
$ opencode
> Procesa todas las notas del inbox
BrainOS: Muestra progreso en panel lateral de Obsidian
         "Procesando 5 notas... (2/5 completadas)"
         
[En Obsidian]: Panel muestra qué está haciendo cada agente
[En Obsidian]: Previews de cambios propuestos
[Usuario]: Revisa y aprueba desde la UI, no desde terminal
```

## 3. Integración Técnica Profunda

### 3.1 OpenCode ↔ Obsidian: Protocolo de Colaboración

Para MVP no usamos bridge WebSocket custom: usamos **request/stream** con HTTP + SSE.

```
┌─────────────────┐      HTTP request        ┌─────────────────┐
│   Obsidian      │  ─────────────────────►  │   OpenCode      │
│   Plugin        │                                 │   Agent         │
│                 │                                 │                 │
│                 │       SSE stream         │                 │
│                 │  ◄─────────────────────  │                 │
│ • Canvas API    │                                 │ • Filesystem    │
│ • Editor API    │                                 │ • LLM           │
│ • UI Components │                                 │ • Skills        │
│ • Event Bus     │                                 │ • Tools         │
└─────────────────┘                                 └─────────────────┘
         │                                                   │
         └────────────────── Vault MD ───────────────────────┘
                              ↑
                    Ambos leen/escriben el mismo filesystem
```

### 3.2 Tipos de Comunicación

#### A. Eventos Obsidian → OpenCode
```typescript
// Usuario hace algo en Obsidian
{
  type: 'canvas_node_created',
  data: { nodeId, position, content, timestamp }
}

{
  type: 'note_saved',
  data: { path, content, wordCount, hasFrontmatter }
}

{
  type: 'user_selected_text',
  data: { text, notePath, context }
}
```

#### B. Comandos OpenCode → Obsidian
```typescript
// Agente quiere hacer algo en la UI
{
  type: 'suggest_canvas_connection',
  data: { fromNode, toNode, reason },
  display: 'preview' // usuario ve línea fantasma
}

{
  type: 'show_inline_suggestion',
  data: { text, position, source: 'organizer_agent' }
}

{
  type: 'open_panel',
  data: { panelType: 'agent_chat', agentId: 'researcher' }
}

{
  type: 'highlight_concepts',
  data: { concepts: ['deep work', 'attention'], style: 'suggestion' }
}
```

## 4. Casos de Uso Detallados

### Caso 1: Organización Visual en Canvas

```
Escenario: Usuario tiene 20 notas sueltas sobre "Inteligencia Artificial"

Paso 1: Usuario arrastra notas al Canvas (sin estructura)
Paso 2: BrainOS detecta tema común
Paso 3: BrainOS sugiere estructura visual:
        - Agrupar por subtemas (ML, NLP, Ética)
        - Crear nodos centrales de cada grupo
        - Dibujar conexiones basadas en wikilinks
Paso 4: Usuario ve preview (en gris, semi-transparente)
Paso 5: Usuario acepta/rechaza/modifica grupos
Paso 6: BrainOS organiza archivos .md en carpetas correspondientes
Paso 7: Crea MOC (Map of Content) automático
```

**Implementación técnica**:
- Canvas API de Obsidian para manipulación visual
- OpenCode analiza contenido y sugiere estructura
- Comunicación en tiempo real para previews
- Acción final aplica cambios tanto en Canvas como en filesystem

### Caso 2: Escritura Colaborativa

```
Escenario: Usuario escribe nota permanente sobre "Hábitos Atómicos"

Paso 1: Usuario escribe primer párrafo
Paso 2: BrainOS (modo pasivo) analiza en background
Paso 3: BrainOS sugiere inline: "¿Referencia al libro de James Clear?"
Paso 4: Usuario acepta → Inserta cita y link a nota literature
Paso 5: BrainOS detecta concepto "sistemas vs metas"
Paso 6: Sugiere: "Conectar con tu nota sobre [[Sistemas de Productividad]]?"
Paso 7: Usuario ve preview de cómo quedaría la conexión
Paso 8: Acepta → BrainOS actualiza ambas notas con backlinks
```

### Caso 3: Investigación Profunda (Deep Research)

```
Escenario: Usuario quiere investigar "Segundo Cerebro Digital"

Paso 1: Usuario abre panel de BrainOS
Paso 2: Selecciona modo "Investigación" + agente "Researcher"
Paso 3: Escribe: "Investiga este tema en mi vault y fuentes externas"

Paso 4: BrainOS ejecuta múltiples pasos:
        a) Busca notas relacionadas en el vault
        b) Identifica gaps de conocimiento
        c) [Si habilitado] Busca web por fuentes adicionales
        d) Sintetiza información
        
Paso 5: En tiempo real, Obsidian muestra:
        - Progreso: "Analizando 15 notas..."
        - Preview de conexiones encontradas
        - Notas del vault relevantes (highlighted)
        
Paso 6: BrainOS presenta resultado en panel:
        - Resumen ejecutivo
        - Notas del vault a conectar
        - Sugerencias de nuevas notas permanentes
        - Mapa visual de conceptos (abre en Canvas)
        
Paso 7: Usuario interactúa con resultado:
        - Clic en "Crear nota de síntesis" → Crea .md
        - Clic en "Ver en Canvas" → Abre mapa conceptual
        - Edita directamente en el panel
```

### Caso 4: Debate Multi-Agente (Socrático)

```
Escenario: Usuario tiene una idea polémica y quiere explorarla a fondo

Paso 1: Usuario selecciona texto de una nota
Paso 2: Click derecho → "Debate con BrainOS"
Paso 3: Elige participantes: [Investigador] [Crítico] [Sintetizador]

Paso 4: Se abre panel tipo chat con 3 columnas:
        ┌─────────────┬─────────────┬─────────────┐
        │Investigador │   Crítico   │Sintetizador │
        │             │             │             │
        │"Esto se    │"Pero no     │"Concuerdo  │
        │basaría en..│consideras.. │con X pero.."│
        └─────────────┴─────────────┴─────────────┘
        
Paso 5: Usuario puede:
        - Responder a agente específico
        - Pedir que profundicen en punto X
        - Ver areas de acuerdo/desacuerdo
        - Solicitar síntesis final
        
Paso 6: BrainOS genera:
        - Nota con todos los argumentos
        - Lista de preguntas abiertas
        - Sugerencias para fortalecer la idea
```

## 5. Arquitectura de Componentes

### 5.1 OpenCode Side (El "Cerebro")

```
.brainos/opencode/
├── skills/
│   ├── canvas-organizer/          # Organización visual
│   │   ├── SKILL.md
│   │   └── tools/
│   │       ├── analyze_canvas.ts
│   │       ├── suggest_layout.ts
│   │       └── create_connections.ts
│   │
│   ├── inline-assistant/          # Sugerencias inline
│   │   ├── SKILL.md
│   │   └── tools/
│   │       ├── detect_concepts.ts
│   │       ├── suggest_links.ts
│   │       └── complete_thoughts.ts
│   │
│   ├── deep-researcher/           # Investigación profunda
│   │   ├── SKILL.md
│   │   └── tools/
│   │       ├── search_vault.ts
│   │       ├── synthesize_info.ts
│   │       └── identify_gaps.ts
│   │
│   └── socratic-debate/           # Debate multi-agente
│       ├── SKILL.md
│       └── agents/
│           ├── investigator.md
│           ├── critic.md
│           └── synthesizer.md
│
├── tools/
│   ├── obsidian-bridge.ts         # Comunicación con plugin
│   ├── vault-manager.ts           # Gestión filesystem
│   └── canvas-analyzer.ts         # Análisis de canvas
│
└── config/
    ├── agents.yaml                # Configuración de agentes
    └── triggers.yaml              # Qué activa cada skill
```

### 5.2 Obsidian Side (La "Interfaz")

```
obsidian-brainos-plugin/
├── src/
│   ├── main.ts                    # Entry point
│   ├── settings.ts                # Configuración
│   │
│   ├── bridge/                    # Comunicación con OpenCode
│   │   ├── opencode-http-client.ts
│   │   ├── opencode-sse-subscriber.ts
│   │   └── message-handler.ts
│   │
│   ├── canvas/                    # Integración Canvas
│   │   ├── canvas-monitor.ts      # Detecta cambios
│   │   ├── ghost-renderer.ts      # Previews visuales
│   │   └── suggestion-overlay.ts  # UI de sugerencias
│   │
│   ├── editor/                    # Integración Editor
│   │   ├── inline-suggester.ts    # Ghost text
│   │   ├── context-menu.ts        # Menú contextual
│   │   └── concept-highlighter.ts # Destaca conceptos
│   │
│   ├── panels/                    # Paneles UI
│   │   ├── agent-chat-panel.ts    # Chat con agentes
│   │   ├── research-panel.ts      # Panel de investigación
│   │   ├── debate-panel.ts        # Debate multi-agente
│   │   └── status-bar.ts          # Indicadores
│   │
│   └── commands/                  # Comandos
│       ├── organize-current-note.ts
│       ├── open-research-panel.ts
│       └── start-debate.ts
│
└── styles.css                     # Estilos para UI
```

## 6. Stack Tecnológico Revisado

### OpenCode (Core)
- **Runtime**: OpenCode CLI con `opencode serve` (modo servidor)
- **Skills**: Sistema de skills personalizado para cada modo
- **Comunicación (MVP)**: HTTP + SSE (ADR-001)
- **Storage (MVP)**: Filesystem + estado in-memory (ADR-003)

### Obsidian (UI)
- **Plugin API**: TypeScript, usando APIs más recientes
- **Canvas**: API nativa para manipulación visual
- **Editor**: Extensions API para inline suggestions
- **UI**: React/Svelte en paneles complejos

### Bridge
- **Protocolo (MVP)**: HTTP request + SSE stream
- **Serialización**: JSON con tipos TypeScript compartidos
- **Reconexión**: Automática de stream SSE + reintentos HTTP controlados

## 7. Flujo de Datos en Tiempo Real

```
Usuario escribe en Obsidian
    ↓
Obsidian Plugin detecta (onChange)
    ↓
Envía a OpenCode vía HTTP:
    { type: 'content_delta', data: {...} }
    ↓
OpenCode (skill inline-assistant) procesa
    ↓
Detecta concepto "deep work"
    ↓
Consulta vault: ¿Hay nota sobre esto?
    ↓
Genera sugerencia
    ↓
Emite evento a Obsidian vía SSE:
    { type: 'inline_suggestion', ... }
    ↓
Obsidian muestra ghost text
    ↓
Usuario presiona Tab
    ↓
Obsidian aplica cambio + notifica OpenCode
    ↓
OpenCode actualiza su modelo del contexto
```

## 8. Configuración de Integración

### Paso 1: Configurar OpenCode

```json
// .opencode/config.json (en raíz del vault)
{
  "name": "BrainOS Vault",
  "server": {
    "enabled": true,
    "port": 4096
  },
  "skills": [
    "brainos/canvas-organizer",
    "brainos/inline-assistant",
    "brainos/deep-researcher",
    "brainos/socratic-debate"
  ],
  "agents": {
    "default": {
      "model": "openrouter/anthropic/claude-3.5-sonnet",
      "systemPromptFile": "AGENTS.md"
    }
  }
}
```

### Paso 2: Configurar Plugin Obsidian

```json
// data.json del plugin
{
  "opencodeHost": "http://localhost:4096",
  "transport": "http+sse",
  "autoConnect": true,
  "features": {
    "canvasCollaboration": true,
    "inlineSuggestions": true,
    "conceptHighlighting": true
  },
  "agents": {
    "organizer": { "autonomous": false },
    "researcher": { "requiresInvocation": true }
  }
}
```

## 9. Próximos Pasos Inmediatos

### Prioridad 1: Proof of Concept
1. **Bridge básico**: HTTP+SSE entre OpenCode y Obsidian
2. **Una skill**: Canvas organizer básica
3. **Una feature**: Preview visual de sugerencias en Canvas

### Prioridad 2: Experiencia Inline
1. **Inline suggestions**: Ghost text en editor
2. **Concept detection**: Highlight automático
3. **Context menu**: Acciones rápidas

### Prioridad 3: Agente Organizador Completo
1. **Análisis de notas**: Clasificación automática
2. **Sugerencias estructuradas**: Tags, links, ubicación
3. **Aplicación asistida**: Preview → Aceptar → Aplicar

## 10. Diferenciación vs Competencia

| Feature | Smart Connections | Copilot | BrainOS |
|---------|------------------|---------|---------|
| **Canvas Collaboration** | ❌ | Parcial | ✅✅✅ |
| **Inline Suggestions** | ❌ | Básico | ✅✅✅ |
| **Multi-Agente Debate** | ❌ | ❌ | ✅✅✅ |
| **Terminal + UI** | ❌ | ❌ | ✅✅✅ |
| **Zettelkasten Native** | ❌ | ❌ | ✅✅✅ |
| **Live Pair Programming** | ❌ | ❌ | ✅✅✅ |

**BrainOS es único**: Es el único que combina la potencia de un agente CLI (OpenCode) con una experiencia de colaboración visual en tiempo real dentro de Obsidian.

---

**Estado**: Visión refinada y completa
**Next Step**: Priorizar componentes para PoC
