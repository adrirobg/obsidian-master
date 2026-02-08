# ADR-003: Persistencia de Estado - Simplificación para MVP

## Estado
**DECIDIDO - In-memory primero, persistencia simple post-MVP**

Fecha: 2026-02-08  
Autor: BrainOS Technical Team  
Última actualización: Post-peer-review simplificación

## Contexto

BrainOS necesita manejar estado durante las sesiones de trabajo. Después del peer review, se determinó que **los flujos de trabajo son más importantes que la persistencia compleja** para el MVP.

## Decisión

**Para MVP: In-memory únicamente. Sin persistencia durable.**

**Post-MVP: Considerar JSON simple o SQLite si es necesario.**

### Justificación

1. **Prioridad en flujos**: El valor de BrainOS está en los flujos de captura-procesamiento-organización, no en persistencia sofisticada

2. **Simplicidad**: Sin base de datos = menos código, menos bugs, más rápido de desarrollar

3. **OpenCode maneja su propio estado**: Las sesiones y contexto del LLM viven en OpenCode, no necesitamos duplicarlo

4. **Obsidian ya persiste las notas**: El vault de Obsidian ES la persistencia. BrainOS solo necesita estado transitorio durante procesamiento.

5. **YAGNI**: No sabemos qué tipo de persistencia necesitaremos hasta tener flujos funcionando

## Qué NO persistimos en MVP

❌ Historial de conversaciones largo plazo  
❌ Preferencias aprendidas del usuario  
❌ Relaciones semánticas entre notas  
❌ Estado de agentes entre sesiones  
❌ Métricas de uso  

## Qué SÍ mantenemos (in-memory)

✅ **Sesión actual**: Contexto de la conversación activa  
✅ **Sugerencias pendientes**: Para mostrar en UI  
✅ **Estado de procesamiento**: Qué nota se está procesando ahora  
✅ **Configuración**: Settings del plugin (en data.json de Obsidian)

## Arquitectura de Estado MVP

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTADO TRANSIENTE                         │
│                    (In-memory only)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Sesión     │  │ Sugerencias  │  │   Contexto   │      │
│  │   Actual     │  │  Pendientes  │  │   de Nota    │      │
│  │              │  │              │  │              │      │
│  │ - ID sesión  │  │ - Lista de   │  │ - Nota       │      │
│  │ - Historial  │  │   sugerencias│  │   activa     │      │
│  │   corto      │  │ - Estado     │  │ - Agente     │      │
│  │   (5-10 msg) │  │   (pending/  │  │   actual     │      │
│  │              │  │   shown/     │  │ - Modo       │      │
│  │              │  │   accepted)  │  │   actual     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CONFIGURACIÓN                           │  │
│  │  (data.json de Obsidian - persistente simple)       │  │
│  │                                                      │  │
│  │  - API keys (vía Obsidian SecretStorage)            │  │
│  │  - Preferencias de UI                               │  │
│  │  - Atajos de teclado                                │  │
│  │  - Feature flags                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Ciclo de Vida del Estado

```
Usuario abre Obsidian
    ↓
Plugin carga configuración desde data.json
    ↓
Estado in-memory inicializado (vacío)
    ↓
Usuario interactúa con BrainOS
    ↓
Estado se llena temporalmente
    ↓
Usuario cierra Obsidian
    ↓
Estado in-memory se pierde
    ↓
Próxima sesión: estado vacío, configuración preservada
```

## Implementación

### Estado Global (In-memory)

```typescript
// Estado vivo durante la sesión
interface BrainOSState {
  // Sesión actual
  currentSession: {
    id: string | null
    messages: Message[] // Solo últimos 5-10 para contexto
    startTime: Date
  }

  // Sugerencias activas
  pendingSuggestions: Suggestion[]

  // Contexto de trabajo
  context: {
    activeNote: string | null
    currentMode: 'idle' | 'processing' | 'chat'
    agentStatus: 'ready' | 'busy' | 'error'
  }
}

// Singleton de estado
class BrainOSStateManager {
  private state: BrainOSState = {
    currentSession: { id: null, messages: [], startTime: new Date() },
    pendingSuggestions: [],
    context: {
      activeNote: null,
      currentMode: 'idle',
      agentStatus: 'ready'
    }
  }

  // Getters y setters
  getState(): BrainOSState { return this.state }
  setActiveNote(path: string) { this.state.context.activeNote = path }
  addSuggestion(suggestion: Suggestion) { this.state.pendingSuggestions.push(suggestion) }
  clearState() { /* Reset a defaults */ }
}

export const stateManager = new BrainOSStateManager()
```

### Configuración Persistente (Simple)

```typescript
// data.json de Obsidian
interface BrainOSConfig {
  // Conexión
  opencodeHost: string        // default: "http://localhost:4096"
  autoConnect: boolean        // default: true

  // Features
  features: {
    inlineSuggestions: boolean
    showNotifications: boolean
    autoOrganize: boolean     // Fase 2
  }

  // Preferencias (aprendidas manualmente)
  preferences: {
    defaultWorkflow: 'quick' | 'development' | 'deep'
    autoAcceptThreshold: number  // Confidence > X para auto-aceptar
  }
}
```

## Ventajas de este enfoque

✅ **Rápido de implementar**: Sin setup de base de datos  
✅ **Menos bugs**: Sin sincronización estado/BD  
✅ **Foco en flujos**: Energía en UX, no en persistencia  
✅ **Fácil de debuggear**: Estado en memoria = inspeccionable  
✅ **Simple de testear**: Resetear estado = reiniciar plugin  

## Limitaciones aceptadas

⚠️ **No hay "memoria" entre sesiones**: BrainOS no "recuerda" conversaciones pasadas  
⚠️ **Sin aprendizaje persistente**: Preferencias se guardan manualmente, no aprendidas automáticamente  
⚠️ **Sin analytics**: No podemos trackear uso a largo plazo fácilmente  

**Mitigación**: Estas son features de v2.0, no necesarias para validar MVP.

## Cuándo agregar persistencia

**Post-MVP (v1.1 o v2.0) considerar**:

| Feature | Persistencia sugerida | Prioridad |
|---------|----------------------|-----------|
| Historial de conversaciones | JSON files simples | Media |
| Preferencias aprendidas | SQLite o JSON | Media |
| Relaciones entre notas | SQLite + embeddings | Alta (para vaults grandes) |
| Métricas de uso | SQLite | Baja |
| Cache de búsquedas | In-memory LRU | Media |

**Decisión de persistencia v2.0**:
- Evaluar SQLite si vault > 500 notas
- Evaluar embeddings si búsqueda keyword no es suficiente
- Migración desde in-memory debe ser transparente

## Migración futura (v1.1+)

Si en el futuro necesitamos persistencia:

```typescript
// Versión 1.1: Agregar persistencia simple
interface PersistentState {
  // Guardar en JSON files
  saveSession(session: Session): void
  loadSession(id: string): Session | null
  
  // Guardar preferencias
  savePreference(key: string, value: any): void
  loadPreference(key: string): any
}

// Versión 2.0: Considerar SQLite si es necesario
// Migración automática desde JSON a SQLite
```

## Comparativa: Con vs Sin Persistencia

| Aspecto | Con SQLite (original) | Sin persistencia (MVP) |
|---------|----------------------|------------------------|
| **Tiempo implementación** | 1-2 semanas | 2-3 días |
| **Complejidad** | Alta | Baja |
| **Bugs potenciales** | Más (sync, migrations) | Menos |
| **Valor para usuario** | Similar (flujos son lo importante) | Similar |
| **Escalabilidad** | Mejor | Limitada (aceptable para MVP) |

## Conclusión

**Para el MVP, la simplicidad gana.**

Los flujos de captura-procesamiento-organización son el core de BrainOS. La persistencia sofisticada es importante pero no crítica para validar el concepto.

**Regla de oro**: Si un feature requiere base de datos, posponerlo a v2.0.

---

**Decision**: ✅ MVP con in-memory únicamente  
**Persistencia compleja**: ⏸️ Posponido a v1.1/v2.0  
**Foco**: Flujos de trabajo fluidos  
**Next Step**: Implementar state manager in-memory simple
