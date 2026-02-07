# BrainOS Technical Architecture - Documento Maestro

## 1. Overview

Este documento describe la arquitectura técnica de BrainOS enfocándose en:
- Infraestructura y componentes
- Protocolos de comunicación
- Flujo de datos
- Seguridad y autenticación

## 2. Arquitectura de Alto Nivel

### 2.1 Diagrama Conceptual

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Obsidian   │  │     CLI      │  │   Web UI     │       │
│  │   Plugin     │  │   Interface  │  │  (futuro)    │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                 CAPA DE ORQUESTACIÓN                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              BrainOS Orchestrator                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │  Router    │  │  Session   │  │  Context   │     │   │
│  │  │  Manager   │  │  Manager   │  │  Manager   │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
┌─────────▼─────────┐ ┌────▼─────┐ ┌─────────▼──────────┐
│   CAPA DE AGENTES  │ │  MEMORIA │ │   CAPA DE DATOS    │
│                    │ │          │ │                    │
│ ┌──────────────┐   │ │ ┌──────┐ │ │ ┌────────────────┐ │
│ │  Organizador │   │ │ │Vector│ │ │ │   Vault MD     │ │
│ │  Zettelkasten│   │ │ │ Store│ │ │ │   (Obsidian)   │ │
│ └──────────────┘   │ │ └──────┘ │ │ └────────────────┘ │
│ ┌──────────────┐   │ │ ┌──────┐ │ │ ┌────────────────┐ │
│ │Investigador  │   │ │ │Graph │ │ │ │   Embeddings   │ │
│ │  (Research)  │   │ │ │  DB  │ │ │ │   (Opcional)   │ │
│ └──────────────┘   │ │ └──────┘ │ │ └────────────────┘ │
│ ┌──────────────┐   │ └──────────┘ │ ┌────────────────┐ │
│ │   Crítico    │   │              │ │    Metadata    │ │
│ │  (Reviewer)  │   │              │ │    & Cache     │ │
│ └──────────────┘   │              │ └────────────────┘ │
│ ┌──────────────┐   │              │                    │
│ │ Archivero    │   │              │                    │
│ │ (Librarian)  │   │              │                    │
│ └──────────────┘   │              │                    │
└────────────────────┘              └────────────────────┘
```

## 3. Decisiones Arquitectónicas Clave

### 3.1 ADR-001: Protocolo de Comunicación (PENDIENTE)

**Opciones evaluadas:**
1. **MCP (Model Context Protocol)** - Estándar emergente
2. **gRPC** - Alto rendimiento, tipado fuerte
3. **REST + WebSockets** - Universal, simple
4. **GraphQL** - Flexible, eficiente

**Criterios de decisión:**
- Compatibilidad con ecosistema LLM
- Facilidad de implementación
- Soporte multi-cliente
- Capacidades realtime

### 3.2 ADR-002: Estrategia de Embeddings (PENDIENTE)

**Puntos a definir:**
- Umbral de activación automática (N notas)
- Modelo por defecto (all-MiniLM vs OpenAI vs otros)
- Storage de vectores (Chroma, LanceDB, SQLite-vss)
- Estrategia de indexación incremental

### 3.3 ADR-003: Persistencia de Memoria Agente (PENDIENTE)

**Opciones:**
1. SQLite local
2. JSON files
3. Graph database (para relaciones)
4. Redis (si hay servidor central)

### 3.4 ADR-004: Orquestación Multi-Agente (PENDIENTE)

**Patrones a evaluar:**
1. **Supervisor Pattern**: Un orquestador coordina agentes
2. **Swarm Pattern**: Agentes autónomos con mensajería
3. **CrewAI-style**: Roles + tareas + proceso
4. **LangGraph**: Grafos de estado para flujos complejos

### 3.5 ADR-005: Modelo de Deployment (PENDIENTE)

**Opciones:**
1. **Monolito**: Todo en un proceso (simple)
2. **Microservicios livianos**: Agente = servicio (escalable)
3. **Híbrido**: Core + plugins de agentes

## 4. Componentes Core

### 4.1 BrainOS Orchestrator

Responsabilidades:
- Routing de solicitudes al agente apropiado
- Gestión de sesiones de usuario
- Mantenimiento de contexto entre interacciones
- Coordinación multi-agente cuando sea necesario

### 4.2 Sistema de Agentes

Cada agente es un módulo independiente con:
- **Input Interface**: Contrato de entrada
- **Core Logic**: LLM prompts + processing
- **Output Interface**: Contrato de salida
- **State**: Memoria del agente (opcional)

### 4.3 Capa de Datos

**Vault Interface**:
- Abstracción sobre sistema de archivos
- Soporte Obsidian primario
- Extensible a otros formatos

**Embeddings Engine** (Opcional):
- Indexación automática
- Búsqueda semántica
- Deduplicación de contenido

**Metadata Store**:
- Relaciones entre notas
- Historial de operaciones
- Métricas de uso

## 5. Interfaces y Contratos

### 5.1 Plugin Obsidian ↔ Orchestrator

```typescript
interface PluginAPI {
  // Nota activa cambió
  onNoteChange(note: Note): void;
  
  // Solicitar acción del sistema
  requestAction(action: ActionType, params: any): Promise<Result>;
  
  // Recibir sugerencias
  onSuggestion(suggestion: Suggestion): void;
  
  // Chat/debate
  sendMessage(agentId: string, message: string): Promise<Response>;
}
```

### 5.2 Agente ↔ Orchestrator

```typescript
interface Agent {
  id: string;
  name: string;
  capabilities: Capability[];
  
  // Procesar solicitud
  process(request: AgentRequest): Promise<AgentResult>;
  
  // Estado del agente (opcional)
  getState?(): AgentState;
  setState?(state: AgentState): void;
}
```

## 6. Flujos de Datos

### 6.1 Organización Automática

```
Usuario guarda nota
    ↓
Plugin detecta cambio
    ↓
Orchestrator recibe evento
    ↓
Router determina: Agente Organizador
    ↓
Agente analiza nota
    ↓
Genera sugerencias (tags, links, ubicación)
    ↓
Orchestrator formatea respuesta
    ↓
Plugin muestra UI de confirmación
    ↓
Usuario aprueba/rechaza
    ↓
Plugin aplica cambios (si aprobados)
    ↓
Metadata Store actualizado
```

### 6.2 Deep Research

```
Usuario inicia investigación (chat)
    ↓
Orchestrator crea sesión research
    ↓
Spawn Investigador + Crítico (debate)
    ↓
Agentes consultan vault + web (si habilitado)
    ↓
Iteración de síntesis
    ↓
Resultado estructurado presentado al usuario
    ↓
Opción: crear notas permanentes
```

## 7. Seguridad y Privacidad

### 7.1 Principios

- **Datos sensibles nunca en logs**
- **API keys en SecretStorage** (Obsidian) o gestor de secrets
- **Ejecución local por defecto**
- **Opciones cloud son BYOK explícito**

### 7.2 Modelo de Permisos

```
Niveles de permiso para agentes:
- READ_ONLY: Solo lectura del vault
- SUGGEST: Sugerencias, usuario aplica
- WRITE_APPROVED: Escribe después de aprobación explícita
- AUTO_WRITE: Autónomo (solo para tareas predefinidas)
```

## 8. Escalabilidad y Performance

### 8.1 Estrategias

- **Lazy loading**: Agente carga bajo demanda
- **Embeddings incremental**: Solo indexa cambios
- **Caching**: Respuestas frecuentes cacheadas
- **Throttling**: Limita requests a APIs externas

### 8.2 Métricas a Monitorear

- Latencia de respuesta agente
- Uso de tokens LLM
- Tasa de aceptación de sugerencias
- Tamaño de índice de embeddings

## 9. Stack Tecnológico Tentativo

| Componente | Opciones | Preferido |
|------------|----------|-----------|
| Lenguaje | TypeScript/Python | TypeScript (unifica frontend) |
| LLM Client | OpenAI SDK / Vercel AI SDK | Vercel AI SDK (multi-provider) |
| Embeddings | Ollama / OpenAI / local | Ollama (local por defecto) |
| Vector DB | Chroma / LanceDB / sqlite-vss | LanceDB (embebido) |
| Orchestration | LangGraph / CrewAI / Custom | Evaluando... |
| Communication | MCP / gRPC / REST | MCP (estándar) |

## 10. Próximos Pasos Técnicos

1. **ADR-001**: Decidir protocolo de comunicación
2. **PoC MCP**: Prototipo de servidor MCP básico
3. **PoC Embeddings**: Evaluar viabilidad de indexación local
4. **Diseño de Agente**: Especificar primer agente (Organizador)
5. **Contratos**: Definir interfaces entre capas

---

**Estado**: En progreso
**Owner**: Rama Técnica
**Next Review**: Cuando se completen ADRs iniciales
