# BrainOS Technical Architecture - Colaboración en Tiempo Real

## 1. Overview

BrainOS es un sistema de **colaboración en tiempo real** entre:
- **Humano**: Trabajando en Obsidian (Canvas, Editor, UI)
- **IA**: OpenCode ejecutando agentes especializados

No es request/response. Es un **canal bidireccional persistente** donde ambos participantes ven y modifican el mismo espacio de trabajo (el vault).

## 2. Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     OBSIDIAN PLUGIN                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │   │
│  │  │    Canvas    │  │    Editor    │  │      Panels      │    │   │
│  │  │   Monitor    │  │  Extensions  │  │ (Chat/Research)  │    │   │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘    │   │
│  │         │                  │                    │             │   │
│  │         └──────────────────┼────────────────────┘             │   │
│  │                            │                                  │   │
│  │  ┌─────────────────────────▼─────────────────────────────┐   │   │
│  │  │              BRIDGE OBSIDIAN (WebSocket)               │   │   │
│  │  │  • Envía eventos de UI a OpenCode                      │   │   │
│  │  │  • Recibe comandos de OpenCode para UI                 │   │   │
│  │  │  • Mantiene estado sincronizado                        │   │   │
│  │  └─────────────────────────┬─────────────────────────────┘   │   │
│  └────────────────────────────┼──────────────────────────────────┘   │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
                    WebSocket / SSE
                    (Bidireccional, Real-time)
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                        OPENCODE SERVER                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   ORQUESTADOR DE AGENTES                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │   │
│  │  │   Canvas   │  │   Inline   │  │  Research  │              │   │
│  │  │ Organizer  │  │  Assistant │  │    Agent   │              │   │
│  │  └────────────┘  └────────────┘  └────────────┘              │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │   │
│  │  │   Critic   │  │  Debate    │  │  Archiver  │              │   │
│  │  │   Agent    │  │   Panel    │  │   Agent    │              │   │
│  │  └────────────┘  └────────────┘  └────────────┘              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   CAPA DE DATOS                               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │   │
│  │  │  Vault   │  │  Vector  │  │  System  │  │  Agent   │     │   │
│  │  │   MD     │  │   Store  │  │  Memory  │  │  State   │     │   │
│  │  │(filesystem)│  │(LanceDB) │  │ (SQLite) │  │ (JSON)   │     │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. Protocolo de Comunicación

### 3.1 WebSocket como Protocolo Principal

**Por qué WebSocket:**
- ✅ Bidireccional nativo
- ✅ Full-duplex (ambos hablan simultáneamente)
- ✅ Low latency
- ✅ Perfecto para colaboración en tiempo real
- ✅ Reconexión automática manejable

**Implementación:**
```typescript
// Shared types (en ambos lados)
interface BrainOSMessage {
  id: string;
  timestamp: number;
  type: MessageType;
  payload: any;
  source: 'obsidian' | 'opencode';
}

type MessageType = 
  // Obsidian → OpenCode
  | 'canvas_changed'
  | 'note_saved'
  | 'text_selected'
  | 'user_action'
  | 'suggestion_accepted'
  | 'suggestion_rejected'
  
  // OpenCode → Obsidian
  | 'suggest_canvas_layout'
  | 'show_inline_suggestion'
  | 'highlight_concepts'
  | 'open_panel'
  | 'update_status'
  | 'agent_typing';
```

### 3.2 Flujo de Mensajes

#### Escenario: Usuario edita Canvas

```
[Usuario mueve nodo en Canvas]
    ↓
[Obsidian Plugin]
    ↓
WebSocket → { type: 'canvas_changed', payload: {...} }
    ↓
[OpenCode]
    ↓
Skill "canvas-organizer" analiza nuevo layout
    ↓
Detecta: "Podría agrupar estos 3 nodos"
    ↓
WebSocket → { type: 'suggest_canvas_layout', 
              payload: { preview: {...}, confidence: 0.85 } }
    ↓
[Obsidian Plugin]
    ↓
Renderiza preview visual (nodos fantasma, líneas grises)
    ↓
[Usuario ve sugerencia y decide]
    ↓
WebSocket → { type: 'suggestion_accepted', ... } o 'suggestion_rejected'
    ↓
[OpenCode] actualiza modelo/aprende
```

#### Escenario: OpenCode quiere modificar algo

```
[OpenCode - agente investigador termina análisis]
    ↓
WebSocket → { 
  type: 'open_panel',
  payload: { 
    panelType: 'research_results',
    title: 'Análisis completado',
    content: {...}
  }
}
    ↓
[Obsidian Plugin]
    ↓
Abre panel lateral con resultados
    ↓
[Usuario interactúa con panel]
    ↓
WebSocket → { type: 'user_action', ... }
```

## 4. Componentes Detallados

### 4.1 Bridge Obsidian (Plugin)

Responsabilidades:
1. **Event Detection**: Detectar acciones del usuario
2. **Message Routing**: Enviar a OpenCode
3. **Command Execution**: Ejecutar comandos de OpenCode
4. **State Sync**: Mantener estado consistente
5. **UI Rendering**: Mostrar sugerencias/previews

```typescript
// src/bridge/BrainOSBridge.ts
class BrainOSBridge {
  private ws: WebSocket;
  private reconnectAttempts: number = 0;
  private messageQueue: BrainOSMessage[] = [];
  
  // Conectar a OpenCode
  async connect(url: string): Promise<void> {
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.flushQueue();
    };
    
    this.ws.onmessage = (event) => {
      const message: BrainOSMessage = JSON.parse(event.data);
      this.handleIncomingMessage(message);
    };
    
    this.ws.onclose = () => {
      this.attemptReconnect();
    };
  }
  
  // Enviar evento a OpenCode
  send(event: string, payload: any): void {
    const message: BrainOSMessage = {
      id: generateId(),
      timestamp: Date.now(),
      type: event,
      payload,
      source: 'obsidian'
    };
    
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }
  
  // Manejar mensajes entrantes de OpenCode
  private handleIncomingMessage(message: BrainOSMessage): void {
    switch (message.type) {
      case 'suggest_canvas_layout':
        this.renderCanvasPreview(message.payload);
        break;
      case 'show_inline_suggestion':
        this.showInlineSuggestion(message.payload);
        break;
      case 'open_panel':
        this.openPanel(message.payload);
        break;
      // ... más casos
    }
  }
}
```

### 4.2 Bridge OpenCode (Servidor)

```typescript
// .brainos/opencode/server/websocket-server.ts
import { WebSocketServer, WebSocket } from 'ws';

class BrainOSServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();
  
  start(port: number): void {
    this.wss = new WebSocketServer({ port });
    
    this.wss.on('connection', (ws, req) => {
      const clientId = generateClientId();
      this.clients.set(clientId, ws);
      
      console.log(`Obsidian connected: ${clientId}`);
      
      ws.on('message', (data) => {
        const message: BrainOSMessage = JSON.parse(data.toString());
        this.handleObsidianMessage(clientId, message);
      });
      
      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`Obsidian disconnected: ${clientId}`);
      });
    });
  }
  
  private handleObsidianMessage(clientId: string, message: BrainOSMessage): void {
    // Route to appropriate skill
    switch (message.type) {
      case 'canvas_changed':
        this.skills.canvasOrganizer.handleCanvasChange(message.payload);
        break;
      case 'note_saved':
        this.skills.inlineAssistant.handleNoteSave(message.payload);
        break;
      case 'user_action':
        this.handleUserAction(message.payload);
        break;
    }
  }
  
  // Enviar comando a Obsidian
  sendToObsidian(clientId: string, type: string, payload: any): void {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message: BrainOSMessage = {
        id: generateId(),
        timestamp: Date.now(),
        type,
        payload,
        source: 'opencode'
      };
      ws.send(JSON.stringify(message));
    }
  }
}
```

### 4.3 Skills OpenCode

#### Skill: Canvas Organizer

```typescript
// .brainos/opencode/skills/canvas-organizer/index.ts
import { Skill } from '@opencode-ai/sdk';

export default Skill({
  name: 'canvas-organizer',
  description: 'Organiza visualmente el Canvas de Obsidian',
  
  async onCanvasChanged(canvasData: CanvasData, context: Context) {
    // Analizar layout actual
    const analysis = await this.analyzeLayout(canvasData);
    
    // Detectar patrones
    const patterns = this.detectPatterns(analysis);
    
    // Generar sugerencias
    if (patterns.ungroupedClusters.length > 0) {
      const suggestion = await this.suggestGrouping(patterns);
      
      // Enviar a Obsidian como preview
      context.sendToObsidian('suggest_canvas_layout', {
        type: 'group_nodes',
        preview: suggestion.visualization,
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning
      });
    }
  },
  
  async onSuggestionAccepted(suggestion: Suggestion, context: Context) {
    // Aplicar cambios al filesystem
    await this.applyGrouping(suggestion);
    
    // Notificar éxito
    context.sendToObsidian('update_status', {
      message: 'Canvas organizado',
      details: suggestion.summary
    });
  }
});
```

#### Skill: Inline Assistant

```typescript
// .brainos/opencode/skills/inline-assistant/index.ts
export default Skill({
  name: 'inline-assistant',
  description: 'Asistencia contextual mientras escribes',
  
  async onTextChanged(change: TextChange, context: Context) {
    // Detectar conceptos en texto nuevo
    const concepts = await this.extractConcepts(change.newText);
    
    // Buscar en vault
    for (const concept of concepts) {
      const relatedNotes = await this.findRelatedNotes(concept);
      
      if (relatedNotes.length > 0) {
        // Sugerir conexión
        context.sendToObsidian('show_inline_suggestion', {
          type: 'wikilink',
          text: `[[${relatedNotes[0].title}]]`,
          position: change.cursorPosition,
          trigger: concept.text,
          confidence: relatedNotes[0].similarity
        });
      }
    }
  }
});
```

## 5. Integraciones Específicas de Obsidian

### 5.1 Canvas API Integration

```typescript
// src/canvas/CanvasIntegration.ts
import { ItemView, WorkspaceLeaf } from 'obsidian';

class CanvasIntegration {
  private canvasView: any;
  
  // Monitorear cambios en Canvas
  monitorCanvas(): void {
    // Hook into Obsidian's canvas events
    this.app.workspace.on('canvas:node-moved', (node) => {
      this.bridge.send('canvas_changed', {
        type: 'node_moved',
        nodeId: node.id,
        position: { x: node.x, y: node.y }
      });
    });
    
    this.app.workspace.on('canvas:node-created', (node) => {
      this.bridge.send('canvas_changed', {
        type: 'node_created',
        node: this.serializeNode(node)
      });
    });
  }
  
  // Renderizar preview de sugerencia
  renderPreview(preview: CanvasPreview): void {
    const canvas = this.getActiveCanvas();
    
    // Crear nodos "fantasma" (semi-transparentes)
    for (const node of preview.suggestedNodes) {
      const ghostNode = canvas.createTextNode({
        ...node,
        opacity: 0.5,
        isPreview: true,
        color: '#4A90E2' // Color distintivo para previews
      });
    }
    
    // Dibujar líneas sugeridas
    for (const edge of preview.suggestedEdges) {
      canvas.drawEdge({
        ...edge,
        style: 'dashed',
        color: '#4A90E2',
        isPreview: true
      });
    }
    
    // Mostrar UI de aceptación
    this.showAcceptRejectUI(preview);
  }
  
  // Aplicar sugerencia confirmada
  async applySuggestion(preview: CanvasPreview): Promise<void> {
    const canvas = this.getActiveCanvas();
    
    // Convertir previews en nodos reales
    for (const node of preview.suggestedNodes) {
      await canvas.createRealNode(node);
    }
    
    // Crear edges reales
    for (const edge of preview.suggestedEdges) {
      await canvas.createEdge(edge);
    }
    
    // Limpiar previews
    this.clearPreviews();
  }
}
```

### 5.2 Editor Extensions

```typescript
// src/editor/InlineSuggester.ts
import { Editor, EditorPosition, Plugin } from 'obsidian';

class InlineSuggester {
  private currentSuggestion: Suggestion | null = null;
  private ghostMarker: any;
  
  // Mostrar sugerencia inline
  showSuggestion(editor: Editor, suggestion: InlineSuggestion): void {
    const cursor = editor.getCursor();
    
    // Crear widget de sugerencia (ghost text)
    this.ghostMarker = editor.addWidget(
      cursor,
      this.createGhostWidget(suggestion)
    );
    
    this.currentSuggestion = suggestion;
    
    // Escuchar atajos de teclado
    this.registerAcceptShortcut();
  }
  
  // Usuario acepta sugerencia
  acceptSuggestion(): void {
    if (!this.currentSuggestion) return;
    
    const editor = this.getActiveEditor();
    const cursor = editor.getCursor();
    
    // Insertar texto sugerido
    editor.replaceRange(
      this.currentSuggestion.text,
      cursor
    );
    
    // Notificar a OpenCode
    this.bridge.send('suggestion_accepted', {
      type: this.currentSuggestion.type,
      text: this.currentSuggestion.text
    });
    
    // Limpiar
    this.clearSuggestion();
  }
  
  private createGhostWidget(suggestion: InlineSuggestion): HTMLElement {
    const widget = document.createElement('span');
    widget.className = 'brainos-ghost-text';
    widget.textContent = suggestion.text;
    widget.style.opacity = '0.5';
    widget.style.color = '#4A90E2';
    
    // Mostrar tooltip con explicación
    widget.title = suggestion.reasoning;
    
    return widget;
  }
}
```

## 6. Gestión de Estado

### 6.1 Estado Compartido

```typescript
// Estado que ambos lados mantienen sincronizado
interface SharedState {
  // Sesión actual
  session: {
    id: string;
    mode: 'canvas' | 'writing' | 'research';
    activeAgents: string[];
    startTime: number;
  };
  
  // Contexto actual
  context: {
    activeNote: string | null;
    activeCanvas: string | null;
    selectedText: string | null;
    recentActions: Action[];
  };
  
  // Sugerencias pendientes
  pendingSuggestions: Map<string, Suggestion>;
  
  // Configuración
  config: {
    autoAcceptThreshold: number; // Confidence > X se acepta auto
    enabledAgents: string[];
    shortcuts: Record<string, string>;
  };
}
```

### 6.2 Reconciliación de Conflictos

```typescript
// Manejar cuando usuario y agente editan simultáneamente
class ConflictResolver {
  resolve(conflict: EditConflict): Resolution {
    // Estrategia: User wins (siempre)
    if (conflict.source === 'user') {
      return { winner: 'user', notifyAgent: true };
    }
    
    // Si es agente, mostrar diff y pedir confirmación
    return { 
      winner: 'pending',
      showDiff: true,
      requireUserAction: true
    };
  }
}
```

## 7. Flujos de Trabajo Completos

### Flujo 1: Organización Colaborativa en Canvas

```
1. Usuario abre Canvas con 15 notas desorganizadas
2. Plugin detecta canvas abierto → notifica OpenCode
3. Skill "canvas-organizer" analiza:
   - Extrae títulos y contenidos
   - Detecta temas comunes (ML: 5 notas, NLP: 3 notas, etc.)
   
4. OpenCode envía sugerencia:
   {
     type: 'suggest_canvas_layout',
     payload: {
       groups: [
         { name: 'Machine Learning', nodes: ['id1', 'id2', ...], color: 'blue' },
         { name: 'NLP', nodes: ['id3', 'id4'], color: 'green' }
       ],
       connections: [
         { from: 'ML', to: 'NLP', strength: 0.8 }
       ]
     }
   }

5. Plugin renderiza:
   - Rectángulos fantasma alrededor de grupos sugeridos
   - Líneas punteadas entre grupos relacionados
   - Panel lateral con explicación: "Detecté 2 temas principales..."

6. Usuario interactúa:
   - Arrastra notas ajustando grupos sugeridos
   - Clic en "Aceptar estructura"
   
7. Plugin:
   - Aplica cambios al Canvas
   - Mueve archivos .md a carpetas correspondientes
   - Notifica OpenCode: "Estructura aplicada"

8. OpenCode aprende preferencias del usuario
```

### Flujo 2: Escritura Asistida

```
1. Usuario escribe nota permanente
2. Cada 5 segundos (debounced), plugin envía:
   { type: 'text_changed', payload: { content, cursorPos } }

3. Skill "inline-assistant" analiza:
   - Detecta mención a "Deep Work"
   - Busca en vault: ¿Existe nota sobre esto?
   
4. Encuentra nota "202401151430 - Deep Work - Cal Newport"
5. OpenCode envía:
   {
     type: 'show_inline_suggestion',
     payload: {
       text: '[[202401151430 - Deep Work]]',
       position: { line: 10, ch: 45 },
       trigger: 'Deep Work',
       confidence: 0.92
     }
   }

6. Plugin muestra ghost text: "Deep Work[[202401151430 - Deep Work]]"
   (texto en azul claro, semitransparente)

7. Usuario presiona Tab → Inserta wikilink
8. Plugin notifica OpenCode: "Sugerencia aceptada"
9. OpenCode actualiza: Usuario acepta sugerencias de wikilinks
```

## 8. Stack Tecnológico Final

| Componente | Tecnología | Razón |
|------------|-----------|-------|
| **Protocolo** | WebSocket | Tiempo real, bidireccional |
| **OpenCode** | CLI + SDK oficial | Skills, agentes, tools nativos |
| **Obsidian** | TypeScript Plugin API | Canvas, Editor, UI |
| **Storage** | SQLite + LanceDB | Memoria + Embeddings opcionales |
| **Serialization** | JSON + TypeScript | Tipado compartido |

## 9. Plan de Implementación

### Fase 0: Proof of Concept (1 semana)
- [ ] Bridge WebSocket básico
- [ ] Un skill simple (ej: detectar wikilinks)
- [ ] Una integración UI (ej: inline suggestion)

### Fase 1: Canvas Collaboration (2 semanas)
- [ ] Canvas monitor completo
- [ ] Skill canvas-organizer
- [ ] Previews visuales
- [ ] Aceptación/rechazo UI

### Fase 2: Editor Intelligence (2 semanas)
- [ ] Inline suggester
- [ ] Concept highlighting
- [ ] Context menu actions

### Fase 3: Agentes Avanzados (3 semanas)
- [ ] Research agent con panel
- [ ] Debate multi-agente
- [ ] Archiver agent

### Fase 4: Polish (1 semana)
- [ ] Reconexión automática
- [ ] Offline mode (queue messages)
- [ ] Settings UI
- [ ] Documentación

## 10. Métricas de Éxito

- **Latency**: < 200ms entre acción usuario y respuesta visual
- **Reconexión**: < 3 segundos sin perder contexto
- **Sugerencias útiles**: > 70% de sugerencias aceptadas
- **Uptime**: 99.9% del canal WebSocket

---

**Estado**: Arquitectura técnica completa
**Next Step**: Implementar PoC del bridge WebSocket
