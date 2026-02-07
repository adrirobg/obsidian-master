# Sistema de Inbox y Procesamiento - BrainOS

## 1. El Problema: Inbox Overwhelm

**Pain Point Identificado**:
- Capturas rápidas se acumulan en `/00-Inbox/` sin procesar
- Links guardados "para ver luego" nunca se revisan
- Ideas fleeting pierden contexto con el tiempo
- No hay sistema claro de "qué procesar y cuándo"

**Solución BrainOS**: Sistema inteligente de inbox con:
- Clasificación automática de entradas
- Priorización basada en relevancia
- Workflows de procesamiento guiados
- Recordatorios inteligentes

---

## 2. Arquitectura del Sistema de Inbox

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA DE INBOX                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ENTRADAS                                                    │
│  ├─ Quick capture (mobile/desktop)                          │
│  ├─ Web clipper (futuro)                                    │
│  ├─ Email forwarding (futuro)                               │
│  └─ Voice notes (futuro)                                    │
│         ↓                                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              SMART INBOX PROCESSOR                   │    │
│  │                                                      │    │
│  │  1. CLASIFICAR (Automático)                          │    │
│  │     ├─ Tipo: link/idea/cita/nota                     │    │
│  │     ├─ Tema: detected tags                           │    │
│  │     ├─ Prioridad: urgency score                      │    │
│  │     └─ Relación: conecta con notas existentes        │    │
│  │                                                      │    │
│  │  2. ORGANIZAR                                        │    │
│  │     ├─ Ubicar en estructura Zettelkasten             │    │
│  │     ├─ Asignar template apropiado                    │    │
│  │     └─ Establecer recordatorios                      │    │
│  │                                                      │    │
│  │  3. PRESENTAR                                        │    │
│  │     ├─ Dashboard de inbox                            │    │
│  │     ├─ Notificaciones contextuales                   │    │
│  │     └─ Sugerencias de procesamiento                  │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│         ↓                                                    │
│  PROCESAMIENTO                                               │
│  ├─ Modo Rápido (2 min): Clasificar y archivar              │
│  ├─ Modo Desarrollo (10 min): Expandir a literature         │
│  └─ Modo Profundo (30+ min): Crear permanent note           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Smart Inbox Processor

### 3.1 Algoritmo de Clasificación

```typescript
interface InboxEntry {
  id: string;
  content: string;
  source: 'quickadd' | 'web' | 'voice' | 'email';
  capturedAt: Date;
  rawMetadata?: any;
}

interface ClassificationResult {
  type: 'fleeting' | 'literature' | 'permanent' | 'reference';
  topicTags: string[];
  priority: 'high' | 'medium' | 'low';
  relatedNotes: string[];
  suggestedAction: 'process_now' | 'review_later' | 'archive';
  confidence: number;
}

// Proceso de clasificación
async function classifyEntry(entry: InboxEntry): ClassificationResult {
  // 1. Análisis de contenido
  const contentAnalysis = await analyzeContent(entry.content);
  
  // 2. Detección de tipo
  const detectedType = detectType(contentAnalysis);
  
  // 3. Extracción de temas
  const topics = extractTopics(contentAnalysis);
  
  // 4. Búsqueda de relaciones
  const related = await findRelatedNotes(topics, entry.content);
  
  // 5. Cálculo de prioridad
  const priority = calculatePriority({
    type: detectedType,
    relatedCount: related.length,
    userContext: getUserCurrentContext(),
    temporalRelevance: checkTemporalRelevance(entry)
  });
  
  return {
    type: detectedType,
    topicTags: topics,
    priority,
    relatedNotes: related,
    suggestedAction: determineAction(detectedType, priority),
    confidence: calculateConfidence(contentAnalysis)
  };
}
```

### 3.2 Reglas de Clasificación

**Prioridad Alta**:
- Contiene palabras clave de proyectos activos
- Relacionado con notas revisadas recientemente
- Links con deadlines (eventos, ofertas temporales)
- Citas de fuentes que el usuario está leyendo actualmente

**Prioridad Media**:
- Temas de interés general del usuario
- Conceptos que aparecen múltiples veces en el vault
- Links sin urgency pero relevantes

**Prioridad Baja**:
- Temas no relacionados con intereses actuales
- Ideas vagas sin contexto
- Links genéricos "para revisar algún día"

---

## 4. Workflows de Procesamiento

### 4.1 Workflow: Procesamiento Rápido (2 minutos)

**Para**: Notas fleeting claras, links simples, ideas atómicas

```
Entrada: Nota fleeting
    ↓
BrainOS muestra:
├─ Tipo detectado: fleeting
├─ Sugerencia: ¿Convertir a literature? ¿Archivar? ¿Eliminar?
└─ Tags sugeridos: [tag1, tag2]

Usuario decide:
├─ [A] Archivar como fleeting (con tags)
├─ [B] Convertir a literature (plantilla automática)
├─ [C] Expandir ahora (modo desarrollo)
└─ [D] Eliminar (no relevante)

BrainOS ejecuta:
├─ Mueve a ubicación correcta
├─ Aplica tags
├─ Genera ID si es literature/permanent
└─ Actualiza índices
```

**Ejemplo de UI**:
```
┌─ Procesar Nota ──────────────────────┐
│ "Idea sobre sistemas de productividad"│
├──────────────────────────────────────┤
│ Tipo: Fleeting Idea                  │
│ Tags: #productividad #sistemas       │
│ Relacionado: [[Deep Work]]           │
├──────────────────────────────────────┤
│ [Fleeting] [Literature] [Expandir] [❌]│
└──────────────────────────────────────┘
```

### 4.2 Workflow: Desarrollo a Literature (10 minutos)

**Para**: Citas, resúmenes de lecturas, videos, podcasts

```
Entrada: Link a artículo o cita
    ↓
BrainOS pre-procesa:
├─ Extrae metadata (título, autor, fecha)
├─ Resume contenido si es posible (API/web scraping)
├─ Detecta ideas clave
└─ Sugiere estructura

Usuario desarrolla:
├─ Añade sus propias notas/reflexiones
├─ Resalta ideas importantes
├─ Conecta con conocimiento existente
└─ Formula preguntas de seguimiento

BrainOS asiste:
├─ Sugiere conexiones con notas existentes
├─ Detecta conceptos importantes
├─ Propone wikilinks
└─ Ayuda a estructurar en formato Zettelkasten

Resultado: Literature note completa en /10-Literature/
```

### 4.3 Workflow: Creación de Permanent Note (30+ minutos)

**Para**: Ideas que merecen desarrollo completo

```
Entrada: Fleeting o Literature con potencial
    ↓
BrainOS activa modo Deep Work:
├─ Panel de síntesis con Investigador + Crítico
├─ Análisis de conexiones existentes
├─ Sugerencias de ángulos nuevos
└─ Preguntas desafiantes

Usuario desarrolla idea:
├─ Escribe idea atómica clara
├─ Desarrolla con ejemplos
├─ Conecta con múltiples notas
└─ Refuta posibles objeciones

BrainOS facilita:
├─ Debate socrático sobre la idea
├─ Detección de falacias o supuestos
├─ Sugerencias de fortalecimiento
└─ Identificación de gaps

BrainOS finaliza:
├─ Ubica en /20-Permanent/
├─ Asigna ID único
├─ Actualiza todos los backlinks
└─ Propone MOCs relacionados

Resultado: Permanent note lista para conectar y desarrollar
```

---

## 5. Dashboard de Inbox

### 5.1 Vista Principal

```
┌─ BrainOS Inbox Dashboard ───────────────────────┐
│                                                   │
│ 📊 ESTADÍSTICAS                                   │
│ ├─ Items en inbox: 12                             │
│ ├─ Alta prioridad: 3                              │
│ ├─ Sin procesar > 7 días: 5                       │
│ └─ Procesados hoy: 2                              │
│                                                   │
│ 🔥 PRIORIDAD ALTA (Procesar primero)              │
│ ├─ [ ] Link: "Sistema GTD mejorado"               │
│ ├─ [ ] Idea: "Conexión entre ZK y PKM"            │
│ └─ [ ] Cita: "Luhmann sobre links"                │
│                                                   │
│ 📋 PROCESAMIENTO RÁPIDO (< 2 min cada uno)        │
│ ├─ [ ] "Nota sobre productividad" [Fleeting]      │
│ ├─ [ ] "Video interesante sobre foco" [Link]      │
│ └─ [ ] "Cita de Cal Newport" [Cita]               │
│                                                   │
│ 📚 DESARROLLO PENDIENTE                           │
│ ├─ [ ] Artículo: "Building a Second Brain"        │
│ └─ [ ] Podcast: "Zettelkasten Method"             │
│                                                   │
│ 💡 SUGERENCIAS DE BRAINOS                         │
│ ├─ Detecté 3 notas sobre "foco". ¿Crear MOC?      │
│ ├─ "Link guardado" tiene deadline en 2 días       │
│ └─ 5 notas fleeting sin procesar > 14 días        │
│                                                   │
└───────────────────────────────────────────────────┘
```

### 5.2 Filtros y Vistas

**Vistas disponibles**:
- **Por prioridad**: Alta → Media → Baja
- **Por tipo**: Links | Ideas | Citas | Referencias
- **Por edad**: Recientes | 7 días | 30 días | Archivo
- **Por tema**: Agrupado por tags detectados
- **Por acción sugerida**: Procesar ahora | Revisar luego | Archivar

---

## 6. Sistema de Recordatorios Inteligentes

### 6.1 Recordatorios Contextuales

BrainOS no molesta con recordatorios genéricos. Los hace **contextuales**:

```
Contexto: Usuario está leyendo nota sobre "Deep Work"
    ↓
BrainOS detecta:
├─ Tienes 3 links sin procesar sobre productividad
├─ Hay una cita de Cal Newport en inbox
└─ Sugerencia: "¿Quieres procesar entradas relacionadas?"

Usuario: [Ver relacionadas] [Ignorar]
```

### 6.2 Reglas de Recordatorio

**No molestar cuando**:
- Usuario está en modo escritura profunda (no interrumpir)
- Ya procesó X notas hoy (evitar fatiga)
- Es fin de semana (configurable)

**Recordar cuando**:
- Link tiene deadline próximo
- Nota relacionada con proyecto activo
- Acumulación > threshold (ej: 10 notas sin procesar)
- Pattern detectado (3 notas sobre mismo tema → sugerir síntesis)

---

## 7. Integración con Obsidian

### 7.1 Comandos del Plugin

**Paleta de comandos** (Ctrl+P):
- `BrainOS: Captura rápida` → Crea nota fleeting
- `BrainOS: Ver inbox` → Abre dashboard
- `BrainOS: Procesar siguiente` → Toma siguiente item de alta prioridad
- `BrainOS: Buscar similares` → Encuentra notas relacionadas a selección

### 7.2 Atajos de Teclado

- `Ctrl+Shift+N`: Nueva captura rápida
- `Ctrl+Shift+I`: Abrir inbox
- `Ctrl+Shift+P`: Procesar nota actual
- `Ctrl+Shift+S`: Buscar similares

### 7.3 Ribbon Icons

- 📥 Inbox (con badge de contador)
- ⚡ Captura rápida
- 📊 Dashboard

### 7.4 Sidebar Panel

Panel persistente mostrando:
- Contador de inbox
- Próximos 3 items a procesar
- Sugerencia del día

---

## 8. Métricas y Mejoras

### 8.1 Métricas de Salud del Inbox

**KPIs a trackear**:
- Tiempo promedio de procesamiento
- Tasa de conversión fleeting → permanent
- Items procesados por semana
- Tiempo en inbox (antes de procesar)
- Tasa de abandono (items eliminados sin procesar)

### 8.2 Mejora Continua

BrainOS aprende:
- Qué tipos de notas procesas rápido vs lento
- Horarios preferidos de procesamiento
- Temas que ignoras vs desarrollas
- Patrones de captura (móvil vs desktop)

Y ajusta:
- Priorización de entradas
- Timing de recordatorios
- Sugerencias de procesamiento

---

## 9. Implementación Prioritaria

### Fase 1: Core Inbox (Semana 1-2)
- [ ] Sistema de captura rápida
- [ ] Clasificación básica automática
- [ ] Dashboard simple
- [ ] Comandos de procesamiento

### Fase 2: Smart Processing (Semana 3-4)
- [ ] Algoritmo de prioridad
- [ ] Sugerencias de conexiones
- [ ] Plantillas dinámicas
- [ ] Recordatorios contextuales

### Fase 3: Advanced Features (Semana 5-6)
- [ ] Modo desarrollo guiado
- [ ] Workflows literatura → permanent
- [ ] Métricas y analytics
- [ ] Aprendizaje de preferencias

---

## 10. Comparativa: Sin BrainOS vs Con BrainOS

| Aspecto | Sin BrainOS | Con BrainOS |
|---------|-------------|-------------|
| **Captura** | Rápida pero desorganizada | Rápida + clasificada automáticamente |
| **Procesamiento** | Manual, toma decisiones | Guiado, sugiere acciones óptimas |
| **Priorización** | FIFO (olvidas lo nuevo) | Inteligente (urgente primero) |
| **Conexiones** | Manual, fácil perderse | Automático, detecta relaciones |
| **Literature notes** | Desestructuradas | Plantilla aplicada automáticamente |
| **Permanent notes** | Rara vez creadas | Workflow facilitado |
| **Inbox cero** | Imposible | Alcanzable con trabajo guidado |

---

**Estado**: Documento de diseño completo
**Prioridad**: ALTA - Core del sistema Zettelkasten
**Next Step**: Implementar Fase 1 (Core Inbox)
