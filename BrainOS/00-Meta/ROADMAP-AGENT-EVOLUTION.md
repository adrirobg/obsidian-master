# Roadmap de Evolución de Agentes - BrainOS

## Visión a Futuro: Arquitectura Multi-Agente

Aunque el MVP comienza con un único **BrainOS Assistant**, la visión completa del sistema contempla una evolución hacia una arquitectura multi-agente especializada.

## Arquitectura Objetivo (v2.0+)

```
┌─────────────────────────────────────────────────────────────┐
│                   ORQUESTADOR CENTRAL                        │
│                                                              │
│  Responsabilidades:                                          │
│  - Recibir input del usuario                                 │
│  - Determinar qué agente(s) actuar                           │
│  - Coordinar multi-agente cuando sea necesario              │
│  - Mantener contexto de sesión                               │
│  - Gestionar permisos y límites                              │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
    ┌──────────▼──────────┐        ┌──────────▼──────────┐
    │   AGENTES CORE      │        │  AGENTES ESPECIAL   │
    │   (Siempre activos) │        │  (Bajo demanda)     │
    │                     │        │                     │
    │ • Organizador       │        │ • Investigador      │
    │ • Archivero         │        │ • Crítico/Reviewer  │
    │ • Conector          │        │ • Síntesis          │
    └─────────────────────┘        │ • Debate            │
                                   └─────────────────────┘
```

## Fases de Evolución

### Fase 1: MVP (v0.1 - v1.0)
**Agente**: BrainOS Assistant (único)

Capacidades:
- Organización básica
- Sugerencias de conexiones
- Procesamiento de inbox
- Consultas simples

**Por qué**: Validar el concepto, aprender qué funciona

---

### Fase 2: Especialización Inicial (v1.1 - v1.5)
**Agentes**: 3 especializados

```
BrainOS Assistant
    ↓ (evoluciona a)
┌─────────────┬─────────────┬─────────────┐
│  Asistente  │  Compañero  │ Investigador│
│  (Core)     │  (Social)   │  (Deep)     │
├─────────────┼─────────────┼─────────────┤
│• Organizar  │• Conectar   │• Research   │
│• Procesar   │• Criticar   │• Síntesis   │
│• Ubicar     │• Debate     │• Analizar   │
└─────────────┴─────────────┴─────────────┘
```

**Criterio para dividir**: Cuando el usuario sienta que necesita "más profundidad" en ciertas áreas

---

### Fase 3: Arquitectura Completa (v2.0+)
**Agentes**: 6 especializados + Orquestador

#### Agente: Organizador (Zettelkasten)
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

---

#### Agente: Archivero (Librarian)
**Rol**: Experto en navegación y recuperación del conocimiento.

**Responsabilidades**:
- Encontrar notas relevantes para consultas
- Mantener índices y MOCs (Maps of Content)
- Sugerir notas olvidadas que podrían reconectarse
- Identificar clusters de conocimiento
- Sugerir nuevos MOCs basados en clusters emergentes
- Ayudar en navegación del vault

---

#### Agente: Conector (Linker)
**Rol**: Especialista en crear y mantener conexiones entre ideas.

**Responsabilidades**:
- Sugerir wikilinks entre notas existentes
- Detectar conexiones implícitas no explicitadas
- Identificar oportunidades de "evergreen notes"
- Sugerir notas a fusionar (duplicados/similares)
- Proponer "see also" al final de notas

---

#### Agente: Investigador (Researcher)
**Rol**: Profundiza en temas, realiza síntesis y análisis.

**Responsabilidades**:
- Resumir colecciones de notas
- Identificar patrones y temas emergentes
- Realizar "deep research" sobre un tema
- Crear notas de síntesis a partir de múltiples fuentes
- Sugerir lagunas de conocimiento
- Enriquecer notas con información adicional

**Nivel de autonomía**: 🔴 **Invocado**: Solo cuando el usuario lo solicita

---

#### Agente: Crítico (Reviewer)
**Rol**: Cuestiona ideas, identifica inconsistencias, mejora calidad.

**Responsabilidades**:
- Revisar notas para claridad y coherencia
- Identificar contradicciones entre notas
- Cuestionar supuestos no declarados
- Sugerir fuentes faltantes
- Verificar que claims tengan soporte
- Desafiar al usuario a profundizar

---

#### Agente: Síntesis (Synthesizer)
**Rol**: Crea nuevo conocimiento a partir de existente.

**Responsabilidades**:
- Generar notas permanentes desde fleeting/literature
- Crear MOCs temáticos
- Síntesis de investigaciones
- Articulación de insights emergentes
- Generar "zettel questions" (preguntas de investigación)

---

### Fase 4: Mesa de Debate (v2.5+)
**Configuración**: Múltiples agentes debaten un tema

```
Investigador ─┐
              ├→ Debate → Síntesis → Conclusión
Crítico ──────┘
```

**Uso**: Para desarrollar ideas complejas, explorar ambigüedades con múltiples perspectivas

---

## Criterios para Evolución

### ¿Cuándo dividir el Agente Único?

**Señales de que es tiempo**:
1. El usuario siente que el asistente es "superficial" en ciertas áreas
2. Se identifican workflows que requieren enfoque especializado
3. El agente único genera sugerencias de calidad inconsistente
4. El usuario pide explícitamente "más profundidad" en investigación o crítica

**Criterio de decisión**:
- Si >60% de las interacciones son de un tipo específico → Considerar agente especializado
- Si hay patrones claros de uso → Dividir por funcionalidad
- Si el usuario confunde capacidades → Separar responsabilidades

### Proceso de Evolución

```
1. Monitorear uso del agente único
   ↓
2. Identificar patrones de uso
   ↓
3. Validar necesidad con usuario
   ↓
4. Diseñar división de agentes
   ↓
5. Implementar gradualmente (1 agente nuevo por versión)
   ↓
6. Evaluar mejora en UX
   ↓
7. Iterar
```

---

## Beneficios de la Evolución Gradual

1. **Aprendizaje real**: Sabemos qué necesita el usuario basado en uso real, no suposiciones
2. **Sin over-engineering**: No construimos agentes que nadie usará
3. **Transición suave**: Usuario se acostumbra gradualmente a más capacidades
4. **Feedback temprano**: Cada agente nuevo se valida individualmente

---

## Documentación Técnica

Para la implementación completa de cada agente, ver:
- `90-Archive/AGENTS-v2-SPEC.md` - Especificación detallada
- `90-Archive/MULTI-AGENT-ORCHESTRATION.md` - Arquitectura del orquestador

---

**Nota**: Esta es la visión a largo plazo. El MVP se mantiene simple (1 agente) para validar el concepto antes de invertir en complejidad.

**Fecha**: 2026-02-08  
**Estado**: Visión futura - No implementar en MVP
