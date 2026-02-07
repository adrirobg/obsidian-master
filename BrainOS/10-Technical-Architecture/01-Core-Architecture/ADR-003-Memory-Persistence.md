# ADR-003: Persistencia de Memoria del Sistema

## Estado
**PENDIENTE DE DECISIÓN**

Fecha: 2026-02-07
Autor: BrainOS Technical Team

## Contexto

BrainOS es un sistema multi-agente que necesita "recordar":
- Interacciones previas con el usuario
- Preferencias aprendidas (qué sugerencias acepta/rechaza)
- Estado de sesiones de trabajo
- Relaciones semánticas entre notas
- Historial de operaciones

**No es memoria del LLM** (eso es efímera), es **memoria del sistema**.

## Tipos de Memoria Requerida

### 1. Memoria de Trabajo (Working Memory)
- Sesión actual de chat/investigación
- Contexto de nota activa
- Conversación multi-turn

**Requisitos**: Rápida, temporal, se pierde al cerrar

### 2. Memoria a Corto Plazo (Short-term)
- Preferencias de la sesión
- Sugerencias recientes
- Feedback del usuario

**Requisitos**: Persiste horas/días, ligera

### 3. Memoria a Largo Plazo (Long-term)
- Patrones de comportamiento del usuario
- Historial de aceptación/rechazo
- Relaciones entre notas
- "Conocimiento" del sistema sobre el vault

**Requisitos**: Persiste indefinidamente, estructurada

### 4. Memoria de Grafo (Graph Memory)
- Relaciones entre notas
- Clusters temáticos
- Evolución del conocimiento

**Requisitos**: Query compleja, análisis de redes

## Opciones de Implementación

### Opción A: SQLite + JSON Files

**Descripción**: SQLite para datos estructurados, JSON para config y caché.

**Estructura**:
```
.brainos/
├── brainos.db          # SQLite - memoria estructurada
├── cache/              # JSON files temporales
│   ├── session.json
│   └── suggestions.json
└── config.json         # Configuración
```

**Pros**:
- ✅ Simple, sin dependencias externas
- ✅ SQLite está en todas partes
- ✅ JSON human-readable para debugging

**Contras**:
- ❌ Sin soporte nativo de grafo
- ❌ Queries complejas de relaciones son difíciles
- ❌ No escala bien para análisis de grafos

---

### Opción B: SQLite + Graph DB Ligero

**Descripción**: SQLite para datos, KuzuDB o similar para relaciones.

**Estructura**:
```
.brainos/
├── brainos.db          # SQLite - sesiones, preferencias
├── knowledge_graph.db  # KuzuDB - relaciones entre notas
└── config.json
```

**Pros**:
- ✅ Grafo nativo para relaciones
- ✅ Consultas tipo Cypher
- ✅ Análisis de clusters y centralidad

**Contras**:
- ❌ Dependencia adicional
- ❌ Más complejidad
- ❌ Sync entre dos bases

---

### Opción C: Única Base de Datos (PostgreSQL)

**Descripción**: PostgreSQL con pgvector para embeddings y AGE para grafos.

**Pros**:
- ✅ Todo en uno
- ✅ pgvector para embeddings
- ✅ PostgreSQL AGE para grafos
- ✅ Escalable

**Contras**:
- ❌ Requiere servidor PostgreSQL
- ❌ Overkill para uso personal
- ❌ No portable

---

### Opción D: File-based con Indexación

**Descripción**: Todo en archivos markdown/json, indexados bajo demanda.

**Estructura**:
```
.brainos/
├── sessions/           # Una carpeta por sesión
│   ├── 2026-02-07-chat-abc/
│   │   ├── context.json
│   │   └── messages.json
├── memory/             # Memoria a largo plazo
│   ├── preferences.json
│   ├── patterns.json
│   └── feedback/
└── graph/              # Relaciones
    ├── nodes.json
    └── edges.json
```

**Pros**:
- ✅ Human-readable
- ✅ Versionable con git
- ✅ Sin dependencias
- ✅ Transparente

**Contras**:
- ❌ Performance pobre con grandes volúmenes
- ❌ Queries complejas son lentas
- ❌ Race conditions posibles

---

### Opción E: DuckDB (Híbrida)

**Descripción**: DuckDB embebido - SQL analítico sin servidor.

**Pros**:
- ✅ Embebido, sin servidor
- ✅ Rápido para análisis
- ✅ Soporte parquet (eficiente)
- ✅ Creciente ecosistema

**Contras**:
- ❌ Sin soporte nativo de grafo
- ❌ Menos maduro que SQLite
- ❌ Menos familiar para desarrolladores

## Comparativa

| Criterio | SQLite+JSON | SQLite+Graph | PostgreSQL | File-based | DuckDB |
|----------|-------------|--------------|------------|------------|--------|
| **Simplicidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Queries complejas** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Grafo nativo** | ❌ | ✅ | ✅ (con ext) | ❌ | ❌ |
| **Portabilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Escalabilidad** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Debuggability** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## Recomendación Preliminar

**Opción A: SQLite + JSON Files** (con path hacia B en el futuro)

### Justificación:

1. **Simplicidad primero**: Empezamos simple, evitamos over-engineering
2. **Grafo en SQLite**: Se puede modelar grafo en tablas relacionales (más trabajo pero posible)
3. **Evolución**: Si necesitamos grafo complejo, migrar a SQLite+KuzuDB es viable
4. **Debugging**: JSON files son excelentes para desarrollo y testing

### Esquema de Base de Datos Tentativo

```sql
-- Sesiones de trabajo
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    type TEXT, -- 'chat', 'research', 'organization'
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    context TEXT, -- JSON: nota activa, filtros, etc.
    status TEXT -- 'active', 'closed', 'archived'
);

-- Mensajes/interacciones
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    role TEXT, -- 'user', 'agent', 'system'
    content TEXT,
    metadata TEXT, -- JSON: agent_id, tokens, etc.
    timestamp TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Preferencias aprendidas
CREATE TABLE preferences (
    key TEXT PRIMARY KEY,
    value TEXT,
    category TEXT, -- 'organization', 'suggestions', 'ui'
    learned_at TIMESTAMP,
    confidence REAL -- 0-1, qué tan seguros estamos
);

-- Feedback del usuario
CREATE TABLE feedback (
    id TEXT PRIMARY KEY,
    suggestion_id TEXT,
    action TEXT, -- 'accepted', 'rejected', 'modified'
    original TEXT,
    modified TEXT, -- si aplica
    timestamp TIMESTAMP
);

-- Grafo de notas (modelo relacional)
CREATE TABLE note_nodes (
    id TEXT PRIMARY KEY,
    path TEXT UNIQUE,
    title TEXT,
    content_hash TEXT, -- para detectar cambios
    embedding_id TEXT, -- referencia a vector store
    last_indexed TIMESTAMP
);

CREATE TABLE note_relationships (
    id TEXT PRIMARY KEY,
    source_id TEXT,
    target_id TEXT,
    type TEXT, -- 'link', 'semantic', 'tag', 'reference'
    strength REAL, -- 0-1
    created_at TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES note_nodes(id),
    FOREIGN KEY (target_id) REFERENCES note_nodes(id)
);

-- Operaciones del sistema
CREATE TABLE operations (
    id TEXT PRIMARY KEY,
    type TEXT, -- 'move_note', 'add_tag', 'create_link'
    details TEXT, -- JSON
    status TEXT, -- 'pending', 'applied', 'reverted'
    initiated_by TEXT, -- agent_id o 'user'
    initiated_at TIMESTAMP,
    applied_at TIMESTAMP
);
```

### Archivos JSON Complementarios

```
.brainos/
├── brainos.db              # Base de datos principal
├── config.json             # Configuración del sistema
│   └── { embedding_mode, default_agents, thresholds }
├── cache/
│   ├── current_session.json # Sesión activa (rápido acceso)
│   └── suggestions_queue.json # Sugerencias pendientes
└── backups/                # Snapshots periódicos
    └── brainos_2026-02-07.db
```

## Próximos Pasos

1. [ ] Implementar esquema SQLite base
2. [ ] Crear capa de abstracción (Repository pattern)
3. [ ] Definir APIs de acceso a memoria
4. [ ] Implementar migraciones de schema
5. [ ] Tests de performance con datos sintéticos

## Notas de Implementación

### Patrón Repository

```typescript
// Interfaz abstracta
interface MemoryRepository {
  // Sesiones
  createSession(type: string, context: any): Promise<Session>;
  getSession(id: string): Promise<Session>;
  addMessage(sessionId: string, message: Message): Promise<void>;
  
  // Memoria a largo plazo
  getPreference(key: string): Promise<any>;
  setPreference(key: string, value: any, confidence?: number): Promise<void>;
  
  // Grafo
  createNoteNode(note: Note): Promise<void>;
  createRelationship(from: string, to: string, type: string, strength: number): Promise<void>;
  getRelatedNotes(noteId: string, type?: string): Promise<Note[]>;
  
  // Feedback
  recordFeedback(suggestionId: string, action: string, modified?: string): Promise<void>;
}

// Implementación SQLite
class SQLiteMemoryRepository implements MemoryRepository {
  // ...
}
```

### Backup y Portabilidad

- Backup automático: snapshot de .db cada día
- Export: JSON completo del estado
- Import: reconstruir desde JSON
- Sync: compatible con Obsidian Sync, Dropbox, etc.

---

**Decision**: PENDIENTE - Needs schema validation
**Next Review**: After database schema PoC
