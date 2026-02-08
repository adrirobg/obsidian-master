# BrainOS Methodology Validation Playbook (v0.1)

## Contexto

Este playbook aterriza la validación metodológica de BrainOS en un ciclo realista de 2-3 semanas, priorizando práctica diaria, control del usuario y aprendizaje antes de automatizar.

## Principios No Negociables

- **User-in-control**: el usuario decide clasificación final, promoción y conexiones críticas.
- **Zettelkasten nativo**: el valor está en ideas atómicas y enlaces con criterio, no en acumular notas.
- **Local-first**: el flujo debe funcionar plenamente con Markdown local en Obsidian.
- **Agnosticismo**: convenciones y plantillas independientes de un plugin o proveedor específico.

## 1) Objetivo de validación (2-3 semanas)

Demostrar que Adri puede sostener un flujo manual-asistido de captura, procesamiento y conexión que produzca notas reutilizables de calidad, con fricción controlada, sin depender de automatización compleja.

**Hipótesis a validar**:
- El inbox se mantiene bajo control sin "inbox overwhelm".
- Las notas literature y permanent mejoran la capacidad de pensar y recuperar ideas.
- Las fricciones repetidas se pueden identificar con criterios claros antes de automatizar.

## 2) Definición operativa de tipos de nota + criterio de "hecho"

| Tipo | Propósito | Criterios de "hecho" |
|------|-----------|------------------------|
| **Fleeting** | Capturar una idea/señal rápidamente sin fricción | Tiene `id`, contexto mínimo de origen y una decisión explícita (`procesar`, `descartar` o `dejar en incubación`) |
| **Literature** | Procesar una fuente externa con interpretación propia | Tiene referencia fuente verificable, 3-5 ideas clave en palabras propias y al menos 1 conexión candidata a una nota permanente |
| **Permanent** | Expresar una idea atómica reusable | Enuncia una tesis en 1-2 frases, desarrolla argumento breve y enlaza al menos 2 notas relevantes (una puede ser literature) |
| **Structure (MOC)** | Organizar un frente de conocimiento | Declara alcance, enlaza notas núcleo y explicita al menos 2 huecos o preguntas abiertas |

**Regla transversal**: una nota no está "hecha" por estar completa en formato; está "hecha" cuando habilita una siguiente decisión cognitiva (pensar, conectar, escribir o actuar).

## 3) Flujo semanal claro (sistema diario/semanal)

### Bucle diario

1. **Captura diaria**
- Capturar todo en `00-Inbox` (ideas, citas, links, preguntas).
- No clasificar durante la captura.

2. **Procesamiento de inbox**
- Procesar en lote por energía disponible (no por cronómetro rígido).
- Cada item termina con una decisión: `fleeting archivada`, `sube a literature`, `candidato a permanent`, `descartar`.

3. **Desarrollo literature**
- Elegir fuentes con mayor relevancia actual.
- Convertir señal en comprensión: resumen + interpretación + conexión candidata.

4. **Promoción a permanent**
- Promover solo ideas que sobreviven al contraste (claridad + utilidad + conexión).
- Evitar convertir por obligación de volumen.

5. **Revisión de conexiones**
- Revisar enlaces salientes/backlinks de las notas nuevas.
- Añadir conexiones faltantes solo cuando mejoran comprensión o recuperación.

### Ritmo semanal (2-3 semanas)

- **Semana 1 (Inmersión controlada)**: capturar sin bloquearse y estabilizar procesamiento básico de inbox.
- **Semana 2 (Refinamiento)**: elevar calidad de literature/permanent y consolidar convenciones reales.
- **Semana 3 (Validación, opcional pero recomendada)**: repetir el flujo refinado y comprobar consistencia, calidad y sostenibilidad.

## 4) Workflows concretos por nivel (sin rigidez artificial por minutos)

### Nivel Rápido (continuidad)

- **Cuándo usarlo**: poco tiempo/energía, alto volumen de inbox.
- **Entrada típica**: fleeting simples, links rápidos, citas sueltas.
- **Salida mínima**: clasificación provisional + siguiente acción definida.
- **Regla**: prioriza mantener el sistema vivo, no perfeccionar contenido.

### Nivel Desarrollo (comprensión)

- **Cuándo usarlo**: hay foco moderado y una fuente relevante.
- **Entrada típica**: item de inbox con valor potencial.
- **Salida mínima**: 1 literature sólida con interpretación propia y enlaces candidatos.
- **Regla**: convertir información en criterio personal.

### Nivel Profundo (síntesis)

- **Cuándo usarlo**: bloque de trabajo intelectual real (sin interrupciones).
- **Entrada típica**: literature madura o clúster de notas relacionadas.
- **Salida mínima**: 1 permanent de alta claridad + actualización de MOC/conexiones.
- **Regla**: calidad semántica sobre cantidad.

## 5) Plantillas mínimas listas para Obsidian

### Fleeting Note

```markdown
---
id: {{date:YYYYMMDDHHmmss}}
type: fleeting
created: {{date:YYYY-MM-DD HH:mm}}
source: thought | conversation | article | video | web
status: inbox
---

# {{title}}

## Captura cruda

## Contexto de origen

## Decisión de procesamiento
- [ ] Subir a literature
- [ ] Mantener como fleeting
- [ ] Descartar
```

### Literature Note

```markdown
---
id: {{date:YYYYMMDDHHmmss}}
type: literature
created: {{date:YYYY-MM-DD HH:mm}}
source_ref: ""
author: ""
published: ""
status: draft
---

# {{title}}

## Referencia

## Ideas clave (en mis palabras)

## Citas útiles

## Interpretación propia

## Conexiones candidatas
- [[ ]]

## Próxima acción
```

### Permanent Note

```markdown
---
id: {{date:YYYYMMDDHHmmss}}
type: permanent
created: {{date:YYYY-MM-DD HH:mm}}
status: seedling
derived_from:
  - [[ ]]
---

# {{tesis atomica}}

## Tesis

## Desarrollo

## Conexiones
- [[ ]]
- [[ ]]

## Implicaciones

## Preguntas abiertas
```

### Structure Note (MOC)

```markdown
---
id: {{date:YYYYMMDDHHmmss}}
type: structure
created: {{date:YYYY-MM-DD HH:mm}}
scope: ""
status: active
---

# MOC - {{tema}}

## Propósito del mapa

## Notas núcleo
- [[ ]]

## Rutas de navegación
- [[ ]]

## Huecos detectados
- [ ]
```

## 6) Plugins recomendados para MVP metodológico (pocos)

| Plugin | Rol en MVP | Justificación | Riesgo | Mitigación |
|-------|------------|---------------|--------|------------|
| **QuickAdd** | Captura rápida | Reduce fricción de entrada al inbox | Sobrecarga de macros | Usar 1-2 capturas simples al inicio |
| **Templater** | Inserción de plantillas e IDs | Estandariza estructura sin tocar contenido intelectual | Dependencia de scripts complejos | Limitar a variables básicas de fecha/ID |
| **Dataview** (opcional) | Visibilidad de backlog y estado | Permite revisar adopción/calidad sin dashboards externos | Obsesión por métricas de volumen | Consultar 1 vez por semana, no en cada sesión |

**Core de Obsidian a mantener activo**: Backlinks, Search, Command Palette, Daily Notes.

## 7) Métricas de validación (calidad + adopción)

### Métricas de adopción

- Días con captura efectiva (objetivo: >= 10 días en 2 semanas, >= 14 días en 3 semanas).
- % de items de inbox con decisión explícita en <= 72h.
- Número de sesiones semanales completadas en niveles desarrollo/profundo.

### Métricas de calidad

- % de literature con interpretación propia no vacía.
- % de permanent con >= 2 conexiones significativas.
- Tasa de notas huérfanas nuevas (objetivo: decreciente semana a semana).
- Éxito de recuperación: capacidad de encontrar una idea capturada previamente en pocos pasos.
- Reutilización: cuántas permanent se vuelven a citar en notas nuevas.

### Score semanal mínimo

- **Salud de flujo**: inbox bajo control + ritmo sostenible.
- **Salud semántica**: conexiones útiles + tesis claras.
- **Salud de adopción**: continuidad sin fatiga excesiva.

## 8) Registro de fricciones (qué observar y cómo decidir automatización)

### Qué observar

- Pasos repetidos que no agregan valor intelectual.
- Decisiones mecánicas tomadas de forma casi idéntica.
- Puntos donde se rompe el foco (cambio de contexto, navegación, formato).
- Demoras recurrentes entre captura y procesamiento.

### Formato de registro (operativo)

| Fecha | Fase | Fricción observada | Frecuencia | Impacto | Decisión repetible | ¿Automatizar? |
|-------|------|---------------------|------------|---------|--------------------|---------------|
| YYYY-MM-DD | Captura/Inbox/Literature/Permanent/Conexión | ... | Baja/Media/Alta | Bajo/Medio/Alto | Sí/No | Ahora/Después/No |

### Regla de decisión para automatizar

Automatizar solo si se cumplen **todas**:
- Ocurre >= 4 veces por semana.
- Tiene bajo valor cognitivo (mecánica, no pensamiento).
- La regla de decisión es estable (>= 80% de casos similares).
- Se puede ejecutar localmente sin bloquear el flujo principal.

## 9) Reglas de "No automatizar aún" (guardrails anti sobre-ingeniería)

- No auto-crear notas permanent sin revisión humana explícita.
- No auto-eliminar notas del inbox.
- No imponer taxonomías rígidas de tags antes de observar uso real.
- No automatizar conexiones solo por coincidencia léxica sin validación.
- No introducir más de 3 plugins de soporte en esta fase.
- No mover el foco a dashboards/analytics antes de estabilizar el hábito diario.

## 10) Criterios de salida (listo para implementación técnica)

La metodología está lista para pasar a implementación técnica cuando se cumpla:

1. Flujo sostenido por 2-3 semanas sin ruptura operativa.
2. Definiciones de `fleeting/literature/permanent/structure` usadas consistentemente.
3. Métricas mínimas de adopción y calidad en rango aceptable por 2 semanas consecutivas.
4. Registro de fricciones con priorización clara de automatizaciones candidatas.
5. Guardrails respetados (sin deriva hacia sobre-automatización).
6. Convenciones documentadas y comprensibles para terceros (no solo para quien las creó).

## Resultado esperado de este playbook

Al final del ciclo, BrainOS tendrá una base metodológica validada en uso real diario/semanal, con decisiones explícitas sobre qué automatizar después y qué mantener humano por diseño.
