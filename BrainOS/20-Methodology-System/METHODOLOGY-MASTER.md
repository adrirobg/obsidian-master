# BrainOS Methodology & System Design - Documento Maestro

## 1. Overview

Este documento describe el **sistema metodológico** de BrainOS:
- Implementación del método Zettelkasten
- Taxonomía de agentes y sus roles
- Flujos de interacción usuario-sistema
- Protocolos multi-agente

**Nota**: Este documento es el punto de partida para la **rama metodológica** del proyecto.

## 2. Visión del Sistema de Agente Único (MVP)

### 2.1 Principio Fundamental

**Para el MVP: UN SOLO AGENTE que lo hace todo.**

La especialización en múltiples agentes (Organizador, Archivero, Conector, etc.) es potente pero compleja. Para validar el concepto, empezamos con un único **"BrainOS Assistant"** que combina todas las capacidades.

**Post-MVP**: Evaluar si dividir en agentes especializados aporta valor.

### 2.2 Arquitectura MVP

```
┌─────────────────────────────────────────────────────────────┐
│                   BRAINOS ASSISTANT                          │
│                    (Agente Único)                            │
│                                                              │
│  Capacidades combinadas:                                     │
│  • Organizar notas (clasificar, ubicar, etiquetar)          │
│  • Sugerir conexiones (wikilinks entre notas)               │
│  • Procesar inbox (fleeting → literature → permanent)       │
│  • Responder preguntas sobre el vault                        │
│                                                              │
│  Nivel de autonomía: Configurable por el usuario            │
│  - Modo Sugerencia: Solo propone, usuario aplica            │
│  - Modo Asistido: Previews, usuario confirma                │
│  - Modo Autónomo: Aplica cambios menores automáticamente    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────▼──────────┐
                │   ORQUESTADOR       │
                │   (Simple)          │
                │                     │
                │ - Recibe input      │
                │ - Envia a Assistant │
                │ - Muestra output    │
                └─────────────────────┘
```

### 2.3 Evolución Post-MVP (v2.0+)

Una vez el sistema base esté probado, evaluar división en:
- **Asistente** (Organización + Procesamiento)
- **Compañero** (Conexiones + Crítica)
- **Investigador** (Deep research)

**Nota**: Esta división solo si el agente único se siente limitado en la práctica.

## 3. Agente BrainOS Assistant (MVP)

### 3.1 Rol y Responsabilidades

**Nombre**: BrainOS Assistant  
**Rol**: Asistente generalista para gestión del conocimiento Zettelkasten.

**Responsabilidades combinadas**:
1. **Organización**: Clasificar notas, sugerir ubicación, asignar IDs
2. **Conexiones**: Proponer wikilinks, detectar relaciones
3. **Procesamiento**: Convertir fleeting → literature → permanent
4. **Consulta**: Responder preguntas sobre el vault

**Para el usuario**: Un único asistente que "entiende" Zettelkasten y ayuda con todo.

### 3.2 Nivel de Autonomía Configurable

**Modo Sugerencia (Recomendado para empezar)**:
- Solo propone cambios
- Usuario aplica manualmente
- Transparencia total

**Modo Asistido**:
- Muestra previews (ghost text, badges)
- Usuario confirma con un click/shortcut
- Balance control/velocidad

**Modo Autónomo Limitado**:
- Aplica solo cambios menores (tags, ubicación inbox)
- Nunca modifica contenido sin aprobación
- Para usuarios avanzados con confianza establecida

### 3.3 Triggers y Activation

**Automático**:
- Guardar nueva nota en inbox
- Editar nota existente (debounced)

**Manual**:
- Comando: "BrainOS: Organizar nota actual"
- Comando: "BrainOS: Sugerir conexiones"
- Comando: "BrainOS: Procesar inbox"

### 3.4 Input/Output

**Input**: Nota (título, contenido, ubicación) + Contexto (vault actual)

**Output**: Sugerencias estructuradas:
```typescript
interface AssistantOutput {
  type: 'organize' | 'connect' | 'process' | 'answer'
  suggestions: Suggestion[]
  confidence: number // 0-1
  reasoning: string // Explicación para el usuario
}
```

---

## 4. Flujos Zettelkasten (Con Agente Único)

### 4.1 Flujo: Captura → Procesamiento

```
Usuario crea nota fleeting rápida
    ↓
BrainOS Assistant detecta (on-save)
    ↓
Análisis combinado:
  • Detecta tipo (fleeting/literature/permanent)
  • Sugiere tags
  • Sugiere ubicación
  • Extrae posibles referencias
  • Sugiere wikilinks
    ↓
Usuario revisa sugerencias en panel lateral
    ↓
Usuario acepta/rechaza/modifica
    ↓
Nota organizada y conectada
```

**Ejemplo de output**:
```
┌─ BrainOS Assistant ─────────────────────┐
│ Sugerencias para "Idea sobre foco":     │
│                                          │
│ 📋 Tipo: Fleeting → Literature           │
│ 🏷️ Tags: #productividad #foco           │
│ 📁 Ubicación: /10-Literature/           │
│ 🔗 Links: [[Deep Work]] [[Atención]]    │
│                                          │
│ [Aplicar] [Modificar] [Ignorar]         │
└─────────────────────────────────────────┘
```

### 4.2 Flujo: Procesamiento → Permanente

```
Usuario selecciona nota literature madura
    ↓
Comando: "Desarrollar nota permanente"
    ↓
BrainOS Assistant:
  • Analiza idea central
  • Sugiere estructura atómica
  • Propone conexiones a otras permanentes
  • Crea preview de nota resultante
    ↓
Usuario revisa preview
    ↓
[Si acepta] Crea nota en /20-Permanent/
```

### 4.3 Flujo: Mantenimiento Periódico

```
[Semanal o bajo demanda]
    ↓
Comando: "BrainOS: Analizar vault"
    ↓
BrainOS Assistant:
  • Lista notas huérfanas (sin conexiones)
  • Detecta clusters temáticos
  • Sugiere notas para conectar
  • Identifica posibles duplicados
    ↓
Reporte simple en panel lateral
```

---

## 5. Modos de Interacción

### 5.1 Modo Background (Autónomo Limitado)

**Cuándo**: Tareas rutinarias seguras  
**Qué hace**: Auto-tagging, organización inbox  
**Visibilidad**: Status bar discreto

### 5.2 Modo Asistido (Recomendado)

**Cuándo**: Durante escritura/edición  
**Qué hace**: Sugerencias inline, previews  
**Visibilidad**: Panel lateral, badges, ghost text

### 5.3 Modo Consultivo

**Cuándo**: Usuario solicita ayuda específica  
**Qué hace**: Responde preguntas, analiza notas  
**Visibilidad**: Chat simple en panel lateral

---

## 6. Evolución a Multi-Agente (v2.0)

**Solo si el agente único demuestra limitaciones**:

### Fase 2: División en 3 Agentes

```
BrainOS Assistant
    ↓ (dividir en)
┌─────────────┬─────────────┬─────────────┐
│  Asistente  │  Compañero  │ Investigador│
│  (Core)     │  (Social)   │  (Deep)     │
├─────────────┼─────────────┼─────────────┤
│• Organizar  │• Conectar   │• Research   │
│• Procesar   │• Criticar   │• Síntesis   │
│• Ubicar     │• Debate     │• Analizar   │
└─────────────┴─────────────┴─────────────┘
```

**Criterio para dividir**: Cuando el agente único se sienta "sobrecargado" o el usuario quiera especialización.

---

## 7. Documentación Original (Multi-Agente)

**Nota**: La documentación detallada de los 6 agentes especializados (Organizador, Archivero, Conector, Investigador, Crítico, Síntesis) se ha movido a `90-Archive/AGENTS-v2-SPEC.md` para referencia futura cuando se implemente multi-agente en v2.0.

Para MVP, todo el comportamiento está consolidado en el **BrainOS Assistant** descrito arriba.

**Rol**: Mantiene la integridad y estructura del sistema Zettelkasten.

**Responsabilidades**:
- Clasificar notas nuevas (fleeting/literature/permanent)
- Sugerir ubicación óptima en estructura de carpetas
- Generar IDs únicos siguiendo convenciones
- Proponer wikilinks a notas relacionadas
- Sugerir tags basados en contenido
- Detectar notas huérfanas (sin conexiones)
- Identificar notas para archivar

**Nivel de autonomía**: Configurable
- 🔴 **Solo sugiere**: Muestra propuestas, usuario aplica manualmente
- 🟡 **Semi-autónomo**: Sugiere inline (ghost text), aceptar con shortcut
- 🟢 **Autónomo limitado**: Aplica cambios menores automáticamente (solo tagging)

**Triggers**:
- Guardar nueva nota
- Mover nota entre carpetas
- Petición explícita del usuario
- Programado (revisión periódica)

**Input**: Nota (título, contenido, ubicación actual)
**Output**: Sugerencias estructuradas (tags, links, ubicación, ID)

---

### 3.2 Agente: Archivero (Librarian)

**Rol**: Experto en navegación y recuperación del conocimiento.

**Responsabilidades**:
- Encontrar notas relevantes para consultas
- Mantener índices y MOCs (Maps of Content)
- Sugerir notas olvidadas que podrían reconectarse
- Identificar clusters de conocimiento
- Sugerir nuevos MOCs basados en clusters emergentes
- Ayudar en navegación del vault

**Nivel de autonomía**:
- 🔴 **Consultivo**: Responde preguntas, no modifica nada
- 🟡 **Curador**: Sugiere actualizaciones a MOCs, usuario aprueba

**Triggers**:
- Búsqueda del usuario
- Petición de "notas relacionadas"
- Revisión periódica de estructura

**Input**: Query (texto o semántica), contexto
**Output**: Lista de notas relevantes, sugerencias de navegación

---

### 3.3 Agente: Conector (Linker)

**Rol**: Especialista en crear y mantener conexiones entre ideas.

**Responsabilidades**:
- Sugerir wikilinks entre notas existentes
- Detectar conexiones implícitas no explicitadas
- Identificar oportunidades de "evergreen notes"
- Sugerir notas a fusionar (duplicados/similares)
- Proponer "see also" al final de notas

**Nivel de autonomía**:
- 🔴 **Solo sugiere**: Lista de posibles conexiones
- 🟡 **Preview**: Muestra cómo quedaría el link, usuario acepta

**Triggers**:
- Creación de nota nueva
- Edición de nota existente
- Revisión periódica de "notas huérfanas"
- Petición explícita

**Input**: Nota actual, vault completo (o subset)
**Output**: Lista de sugerencias de links con justificación

---

### 3.4 Agente: Investigador (Researcher)

**Rol**: Profundiza en temas, realiza síntesis y análisis.

**Responsabilidades**:
- Resumir colecciones de notas
- Identificar patrones y temas emergentes
- Realizar "deep research" sobre un tema
- Crear notas de síntesis a partir de múltiples fuentes
- Sugerir lagunas de conocimiento
- Enriquecer notas con información adicional (si habilitado web)

**Nivel de autonomía**:
- 🔴 **Invocado**: Solo cuando el usuario lo solicita

**Triggers**:
- Petición explícita de investigación
- Comando "Investigar este tema"

**Input**: Tema/query, rango de notas a considerar
**Output**: Síntesis, nota de investigación, lagunas identificadas

---

### 3.5 Agente: Crítico (Reviewer)

**Rol**: Cuestiona ideas, identifica inconsistencias, mejora calidad.

**Responsabilidades**:
- Revisar notas para claridad y coherencia
- Identificar contradicciones entre notas
- Cuestionar supuestos no declarados
- Sugerir fuentes faltantes
- Verificar que claims tengan soporte
- Desafiar al usuario a profundizar

**Nivel de autonomía**:
- 🔴 **Invocado**: Bajo demanda
- 🟡 **On-save**: Revisa notas importantes al guardar (con permiso)

**Triggers**:
- Petición de revisión
- Guardar nota marcada como "importante"
- Debate multi-agente

**Input**: Nota(s) a revisar
**Output**: Críticas constructivas, preguntas desafiantes, sugerencias

---

### 3.6 Agente: Síntesis (Synthesizer)

**Rol**: Crea nuevo conocimiento a partir de existente.

**Responsabilidades**:
- Generar notas permanentes desde fleeting/literature
- Crear MOCs temáticos
- Síntesis de investigaciones
- Articulación de insights emergentes
- Generar "zettel questions" (preguntas de investigación)

**Nivel de autonomía**:
- 🔴 **Invocado**: El usuario solicita síntesis
- 🟡 **Sugerencia**: Detecta oportunidades de síntesis y propone

**Triggers**:
- Petición explícita
- Acumulación de notas en un tema (threshold)
- Fin de proyecto/investigación

**Input**: Set de notas, contexto
**Output**: Nota de síntesis, MOC, insights

---

### 3.7 Mesa de Debate (Debate Panel)

**Rol**: Múltiples agentes debaten un tema para enriquecer perspectiva.

**Configuración**:
- Investigador (aporta hechos)
- Crítico (cuestiona)
- Síntesis (articula conclusiones)
- [Opcional] Devil's Advocate (defiende posición contraria)

**Uso**: Para desarrollar ideas complejas, explorar ambigüedades

---

## 4. Sistema de Captura y Procesamiento Zettelkasten

### 4.0 Visión: El Flujo Completo

BrainOS automatiza el ciclo completo de Zettelkasten:

```
┌────────────────────────────────────────────────────────────────┐
│                    CICLO ZETTELKASTEN                           │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CAPTURA          PROCESAMIENTO         REFINAMIENTO          │
│   ─────────        ─────────────         ────────────          │
│                                                                 │
│   ┌─────────┐      ┌──────────────┐      ┌──────────────┐     │
│   │ Inbox   │  →   │ Clasificar   │  →   │ Desarrollar  │     │
│   │ (todo   │      │ tipo de      │      │ conexiones   │     │
│   │  entra) │      │ nota         │      │              │     │
│   └─────────┘      └──────────────┘      └──────────────┘     │
│        │                  │                      │             │
│        ↓                  ↓                      ↓             │
│   Ideas rápidas    Fleeting →         Literature →             │
│   Links            Literature →         Permanent              │
│   Citas            Permanent                                   │
│   Referencias                                                  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Principio fundamental**: La captura debe ser **frictionless** (sin fricción). El procesamiento es donde BrainOS aporta valor.

---

### 4.1 Métodos de Captura (Entradas al Sistema)

#### 4.1.1 Captura Rápida (Fleeting Notes)

**Tipos de entrada soportados**:
- **Texto libre**: Ideas repentinas, pensamientos
- **Links**: URLs para revisar después
- **Citas**: Fragmentos de libros/artículos/videos
- **Voz**: Dictado rápido (integración futura)
- **Imágenes**: Screenshots con OCR (futuro)

**Flujo de captura**:
```
Usuario captura idea:
├─ Opción A: Desde Obsidian (QuickAdd / comando)
├─ Opción B: Desde terminal (opencode captura)
├─ Opción C: Desde móvil (sync con vault)
└─ Opción D: Web clipper (futuro)

    ↓

BrainOS recibe contenido crudo
    ↓

Análisis automático inicial:
├─ Detectar tipo: ¿link? ¿cita? ¿idea libre?
├─ Extraer metadata (fecha, fuente si es link)
├─ Generar título provisional
└─ Ubicar en /00-Inbox/ con ID temporal

    ↓

Nota fleeting creada, lista para procesamiento
```

**Ejemplos de captura**:

```markdown
# Ejemplo 1: Idea rápida
ID: 202402071200
Type: fleeting
Source: thought
---
La productividad no es hacer más, es hacer lo importante
Ideas: relacionar con [[Deep Work]] y [[Essentialism]]
```

```markdown
# Ejemplo 2: Link para revisar
ID: 202402071205
Type: fleeting
Source: url
URL: https://example.com/articulo-interesante
---
Leer esto sobre sistemas de segundo cerebro
Tags: #pkm #sistemas #revisar
```

```markdown
# Ejemplo 3: Cita de video
ID: 202402071210
Type: fleeting
Source: video
Reference: "The Art of Zettelkasten" - YouTube
Timestamp: 12:34
---
"Tu Zettelkasten es solo tan bueno como tus conexiones"
- Importante: destacar la importancia de los links
```

---

### 4.2 Procesamiento Inteligente (El Core de BrainOS)

#### 4.2.1 Clasificación Automática de Notas

Cuando una nota entra al sistema, BrainOS analiza:

```
Input: Nota en /00-Inbox/
    ↓
Agente Organizador analiza:
    ↓
Preguntas de clasificación:
├─ ¿Contiene URL/link? → Posible literature
├─ ¿Es una cita clara con fuente? → Literature note
├─ ¿Es una idea desarrollada con conexiones? → Permanent candidate
├─ ¿Es un pensamiento rápido sin desarrollar? → Fleeting
└─ ¿Es metadata/índice? → Structure note (MOC)
    ↓
Clasificación sugerida + confianza
```

**Criterios de clasificación**:

| Tipo | Características | Ejemplo de detección |
|------|----------------|---------------------|
| **Fleeting** | Corta (< 200 palabras), sin desarrollo, temporal | "Idea sobre productividad..." |
| **Literature** | Referencia externa clara, citas, resumen | "Según Clear (2018)..." |
| **Permanent** | Idea atómica, conexiones explícitas, reusable | "El principio de... conecta con..." |
| **Structure** | Índice, lista de notas, MOC | "Índice de Productividad" |

#### 4.2.2 Plantillas Dinámicas según Tipo

BrainOS aplica plantillas automáticas según la clasificación:

**Fleeting Note Template**:
```markdown
---
id: {{timestamp}}
type: fleeting
captured: {{datetime}}
source: {{detected_source}}
tags: [inbox, review]
---

# {{auto_title}}

{{content}}

## Notas de procesamiento
- [ ] Revisar y desarrollar
- [ ] Conectar con notas existentes
- [ ] Convertir a literature/permanent o descartar

## Conexiones potenciales
{{suggested_links}}
```

**Literature Note Template**:
```markdown
---
id: {{timestamp}}
type: literature
source: {{url_or_reference}}
author: {{detected_author}}
date: {{publication_date}}
tags: [literature, {{detected_topic}}]
---

# {{title}} - {{author}}

## Metadata
- **Fuente**: {{source}}
- **Autor**: {{author}}
- **Fecha**: {{date}}
- **Importancia**: {{rating}}

## Ideas Clave
{{key_points}}

## Citas Importantes
{{quotes}}

## Mi interpretación
{{user_notes}}

## Conexiones a notas permanentes
{{suggested_permanent_notes}}

## Preguntas de investigación
{{generated_questions}}
```

**Permanent Note Template**:
```markdown
---
id: {{timestamp}}
type: permanent
tags: [concept, {{topic}}]
aliases: [{{alternative_names}}]
created: {{datetime}}
status: seedling
---

# {{atomic_idea_title}}

## Idea Central
{{one_clear_sentence}}

## Desarrollo
{{paragraph_expanding_the_idea}}

## Conexiones
- [[related_note_1]]
- [[related_note_2]]
- [[related_note_3]]

## Línea de pensamiento
{{thread_of_thought}}

## Referencias
{{source_literature_notes}}

## Preguntas emergentes
{{follow_up_questions}}
```

---

### 4.3 Flujo: Captura → Procesamiento (Detallado)

### 4.2 Flujo: Procesamiento → Literatura

```
Usuario añade nota sobre fuente externa
    ↓
Organizador identifica como "literature"
    ↓
Sugiere:
  • Estructura: fuente, key ideas, quotes
  • Links a notas permanentes relacionadas
  • Tags temáticos
    ↓
Usuario refina
    ↓
Conector busca conexiones con existentes
    ↓
Nota integrada con backlinks
```

### 4.3 Flujo: Literatura → Permanente

```
Usuario solicita: "Desarrollar nota permanente de esta literature"
    ↓
Orquestador activa: Síntesis + Crítico (debate)
    ↓
Análisis colaborativo:
  • Síntesis: Extrae idea central
  • Crítico: Cuestiona, profundiza
  • Iteración hasta claridad
    ↓
Genera nota permanente:
  • Idea atómica
  • Conexiones a otras permanentes
  • Referencia a fuente original
    ↓
Usuario revisa y aprueba
    ↓
Organizador: ubica en /20-Permanent/, asigna ID
```

### 4.4 Flujo: Mantenimiento Periódico

```
[Scheduled: Cada semana]
    ↓
Archivero analiza vault:
  • Notas huérfanas detectadas
  • Clusters sin MOC
  • Tags inconsistentes
    ↓
Genera "Reporte de Salud del Vault"
    ↓
Usuario recibe notificaciones actionable
    ↓
[Opcional] Autofix para issues menores
```

## 5. Modos de Interacción

### 5.1 Modo: Background (Autónomo)

**Cuándo**: Tareas rutinarias, mantenimiento
**Agentes**: Organizador (limitado), Archivero
**Visibilidad**: Status bar discreto, notificaciones resumidas
**Ejemplos**:
- Auto-tagging de notas nuevas
- Detección de duplicados
- Organización de inbox

### 5.2 Modo: Asistido (Semi-autónomo)

**Cuándo**: Durante escritura/edición
**Agentes**: Organizador, Conector
**Visibilidad**: Inline suggestions, ghost text, tooltips
**Ejemplos**:
- Sugerir wikilink mientras escribes
- Ghost text para completar pensamiento
- Preview de conexiones sugeridas

### 5.3 Modo: Consultivo (Invocado)

**Cuándo**: Usuario necesita ayuda específica
**Agentes**: Cualquiera, según necesidad
**Visibilidad**: Chat panel, sidebar, modal
**Ejemplos**:
- "Organiza esta nota"
- "Encuentra conexiones"
- "Revisa esta idea"

### 5.4 Modo: Profundo (Multi-Agente)

**Cuándo**: Investigación, desarrollo de ideas complejas
**Agentes**: Mesa de debate configurada
**Visibilidad**: Vista dedicada de chat, mostrando quién habla
**Ejemplos**:
- Deep research sobre tema
- Debate sobre idea controvertida
- Síntesis de proyecto completo

## 6. Protocolos de Comunicación

### 6.1 Agente → Orquestador

```typescript
interface AgentOutput {
  agentId: string;
  type: 'suggestion' | 'action' | 'question' | 'synthesis';
  content: any;
  confidence: number; // 0-1
  requiresUserApproval: boolean;
  alternatives?: any[]; // Opciones alternativas
  reasoning?: string; // Por qué esta sugerencia
}
```

### 6.2 Orquestador → UI

```typescript
interface SystemResponse {
  source: string; // qué agente
  mode: 'background' | 'inline' | 'chat' | 'modal';
  content: Suggestion | Action | Question;
  priority: 'low' | 'medium' | 'high';
  dismissable: boolean;
}
```

### 6.3 Multi-Agente: Protocolo de Debate

```typescript
interface DebateRound {
  round: number;
  contributions: AgentContribution[];
  consensus?: any;
  disagreements?: string[];
}

interface AgentContribution {
  agentId: string;
  position: string;
  arguments: string[];
  respondsTo?: string; // id de otra contribución
}
```

## 7. Aprendizaje y Adaptación

### 7.1 Feedback Loop

```
Agente hace sugerencia
    ↓
Usuario: [Acepta] [Rechaza] [Modifica]
    ↓
Sistema registra feedback
    ↓
Actualiza preferencias del usuario
    ↓
Próximas sugerencias más precisas
```

### 7.2 Métricas de Aprendizaje

- **Tasa de aceptación**: % de sugerencias aceptadas por agente
- **Tiempo de decisión**: Cuánto tarda usuario en aceptar/rechazar
- **Modificaciones**: Cuán frecuentemente modifica vs acepta tal cual
- **Rechazos repetidos**: Qué tipo de sugerencias rechaza siempre

## 8. Próximos Pasos Metodológicos

1. **Definir agente inicial**: ¿Cuál implementamos primero? (Recomendado: Organizador)
2. **Diseñar prompts base**: System prompts para cada agente
3. **Flujo de prueba**: Escenario end-to-end simple
4. **Evaluar calidad**: Cómo medimos si las sugerencias son buenas
5. **Iterar**: Refinar basado en tests

---

**Estado**: En progreso
**Owner**: Rama Metodológica
**Next Review**: After initial agent definitions

## Preguntas Abiertas

1. ¿Cuántos agentes son demasiados? ¿El usuario se siente abrumado?
2. ¿Cómo presentamos agentes al usuario? ¿Nombres? ¿Avatares? ¿Anónimo?
3. ¿Permitimos al usuario crear agentes personalizados?
4. ¿Qué hacer cuando agentes discrepan entre sí?
5. ¿Cómo balancear proactividad vs intrusividad?
