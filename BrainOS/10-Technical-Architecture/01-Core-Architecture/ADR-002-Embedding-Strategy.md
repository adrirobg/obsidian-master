# ADR-002: Estrategia de Embeddings y Búsqueda Semántica

## Estado
**PENDIENTE DE DECISIÓN**

Fecha: 2026-02-07
Autor: BrainOS Technical Team

## Contexto

BrainOS necesita decidir cómo manejar la búsqueda de notas relacionadas, especialmente para:
- Sugerir conexiones entre notas
- Encontrar contenido relevante para análisis
- Soportar RAG (Retrieval Augmented Generation) cuando sea necesario

**Premisa clave**: El usuario quiere que sea agnóstico - tanto local (Ollama) como cloud (BYOK).

## Análisis del Problema

### ¿Cuándo los embeddings son necesarios?

**Vault pequeña (< 500 notas)**:
- Grepping + LLM contexto es suficiente
- Embeddings = over-engineering
- Tiempo de respuesta aceptable

**Vault mediana (500-2000 notas)**:
- Grepping empieza a ser lento
- Embeddings útiles pero no críticos
- Buen punto de inicio opcional

**Vault grande (> 2000 notas)**:
- Embeddings casi obligatorios
- Búsqueda semántica > keyword search
- Escalabilidad requerida

### Ventajas de tener embeddings

1. **Búsqueda semántica**: "Notas sobre productividad" encuentra contenido relacionado sin mencionar la palabra exacta
2. **Deduplicación**: Detectar notas similares/redundantes
3. **Clustering**: Agrupar notas por temas automáticamente
4. **RAG**: Contexto relevante para LLM sin exceder limits

### Costos de embeddings

**Locales (Ollama)**:
- ✅ Sin costo API
- ✅ Privacidad total
- ❌ Requiere GPU/memoria suficiente
- ❌ Indexación inicial lenta
- ❌ Modelo limitado (all-MiniLM ~384 dims)

**Cloud (OpenAI, etc.)**:
- ✅ Calidad superior (text-embedding-3-large)
- ✅ Rápido, sin recursos locales
- ❌ Costo por token (aunque bajo)
- ❌ Datos salen de local

## Opciones Evaluadas

### Opción A: Embeddings Opcionales con Auto-activación

**Descripción**: Sistema detecta tamaño del vault y sugiere/activa embeddings automáticamente.

**Implementación**:
```
Vault < 500 notas:
  └── Modo "Grepping + LLM"

Vault 500-2000 notas:
  └── Sugerir embeddings
  └── Activar si usuario acepta

Vault > 2000 notas:
  └── Activar embeddings automáticamente
  └── Notificar al usuario
```

**Configuración**:
- Provider: Ollama (default) o BYOK
- Modelo local: all-MiniLM (rápido) o nomic-embed-text (mejor)
- Modelo cloud: text-embedding-3-small (económico) o large (calidad)
- Vector DB: LanceDB (embebido) o Chroma

**Pros**:
- ✅ Optimización automática
- ✅ Sin overhead para usuarios pequeños
- ✅ Escalabilidad transparente

**Contras**:
- ❌ Complejidad de implementación
- ❌ Transición puede ser confusa
- ❌ Dos codepaths diferentes

---

### Opción B: Embeddings Siempre Activos (Lazy)

**Descripción**: Embeddings siempre disponibles pero indexación lazy/perezosa.

**Implementación**:
- Vector DB siempre inicializado
- Notas se indexan bajo demanda (cuando se acceden)
- Background job completa indexación progresiva

**Pros**:
- ✅ Arquitectura unificada
- ✅ Siempre disponible para búsqueda semántica
- ✅ Sin decisiones del usuario

**Contras**:
- ❌ Overhead incluso para vaults pequeñas
- ❌ Storage adicional desde el inicio
- ❌ Primera indexación puede ser lenta

---

### Opción C: Sin Embeddings (Grepping + Heurísticas)

**Descripción**: Solo usar grepping, tags, wikilinks y análisis LLM.

**Implementación**:
- Búsqueda por keywords expandidas
- Análisis de wikilinks existentes
- Tags como indicadores semánticos
- LLM para encontrar conexiones (más lento, más tokens)

**Pros**:
- ✅ Simple, sin infraestructura adicional
- ✅ Funciona offline sin setup
- ✅ Sin dependencias de ML

**Contras**:
- ❌ No escala bien
- ❌ No hay verdadera búsqueda semántica
- ❌ Más costo en tokens LLM
- ❌ Limitado para vaults grandes

---

### Opción D: Embeddings Cloud-First con Fallback Local

**Descripción**: Por defecto usar embeddings cloud, fallback a local si no hay API key.

**Implementación**:
- Detectar si usuario tiene API key de embeddings
- Si sí: usar cloud (mejor calidad)
- Si no: ofrecer Ollama local
- Opción explícita para desactivar

**Pros**:
- ✅ Mejor experiencia por defecto
- ✅ Calidad superior si hay presupuesto
- ✅ Fallback agradable

**Contras**:
- ❌ Default envía datos a cloud
- ❌ Costo sorpresa posible
- ❌ No es "privacy-first"

## Comparativa

| Criterio | A: Auto | B: Siempre | C: Sin | D: Cloud-First |
|----------|---------|------------|--------|----------------|
| **Simplicidad** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Escalabilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Privacidad** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Costo inicial** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **UX** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## Recomendación Preliminar

**Opción A: Embeddings Opcionales con Auto-activación**

### Justificación:

1. **Respeto al usuario**: No forzamos overhead a vaults pequeñas
2. **Agnosticismo**: Soporta local (Ollama) y cloud (BYOK)
3. **Escalabilidad transparente**: Crece con el vault del usuario
4. **Educación**: Explicamos por qué se activa y qué beneficios trae

### Implementación Propuesta

```typescript
// Pseudo-config
interface EmbeddingConfig {
  // Auto-detectar basado en tamaño del vault
  mode: 'auto' | 'disabled' | 'forced';
  
  // Provider agnóstico
  provider: {
    type: 'ollama' | 'openai' | 'custom';
    model: string; // 'all-MiniLM' | 'text-embedding-3-small' | etc.
    apiKey?: string; // Para cloud
    localUrl?: string; // Para Ollama (default: localhost:11434)
  };
  
  // Storage
  vectorStore: 'lancedb' | 'chroma' | 'sqlite';
  
  // Umbrales de auto-activación
  thresholds: {
    suggest: 500;   // Sugerir embeddings
    activate: 2000; // Activar automáticamente
  };
}

// Umbrales de tamaño
const VAULT_SIZES = {
  SMALL: { notes: 500, description: 'Vault pequeño' },
  MEDIUM: { notes: 2000, description: 'Vault mediano' },
  LARGE: { notes: Infinity, description: 'Vault grande' }
};
```

### Flujo de Usuario

```
Instalación BrainOS:
  └── "Tu vault tiene 150 notas. Modo ligero activado."
  
Vault crece a 500 notas:
  └── Notificación: "¿Quieres activar búsqueda semántica avanzada?"
  └── Opciones: [Activar Ahora] [Más Info] [Decidir Luego]
  
Usuario activa:
  └── "Elige tu provider de embeddings:"
  └── [Ollama Local - Gratis] [OpenAI - $] [Otro]
  
Vault crece a 2000 notas:
  └── Auto-activación si no está activo
  └── "Activando búsqueda avanzada automáticamente..."
```

## Próximos Pasos

1. [ ] Definir umbrales exactos (500/2000 son tentativos)
2. [ ] Evaluar opciones de Vector DB (LanceDB vs Chroma vs sqlite-vss)
3. [ ] Prototipo de indexación con Ollama
4. [ ] Medir performance: tiempo de indexación, queries/segundo
5. [ ] Definir estrategia de indexación incremental

## Notas Técnicas

### Vector DB Options

| Opción | Pros | Contras | Caso de uso |
|--------|------|---------|-------------|
| **LanceDB** | Embebido, Rust (rápido), sin servidor | Nuevo, ecosistema pequeño | Default recomendado |
| **Chroma** | Popular, buen API | Requiere servidor o sqlite | Si necesitamos features avanzadas |
| **sqlite-vss** | Cero dependencias, SQLite nativo | Más lento, menos features | Para simplicidad máxima |
| **PGVector** | PostgreSQL, escalable | Requiere Postgres | Para deployments enterprise |

### Modelos de Embeddings

**Locales (Ollama)**:
- `all-MiniLM` - 384 dims, muy rápido, calidad media
- `nomic-embed-text` - 768 dims, mejor calidad, más lento
- `mxbai-embed-large` - 1024 dims, mejor calidad local

**Cloud**:
- `text-embedding-3-small` - 1536 dims, muy barato, buena calidad
- `text-embedding-3-large` - 3072 dims, más caro, mejor calidad

---

**Decision**: PENDIENTE - Needs PoC and threshold validation
**Next Review**: After embedding PoC with real vaults
