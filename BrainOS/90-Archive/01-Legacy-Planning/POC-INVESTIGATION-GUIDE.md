# Guía de Investigación: POC Integración OpenCode + Obsidian + Zettelkasten

## Propósito de esta Guía

Esta guía es una **invitación a la investigación**. No contiene respuestas ni conclusiones previas, sino que plantea las preguntas y áreas a explorar para construir juntos el conocimiento necesario antes de automatizar cualquier workflow.

**Objetivo**: Entender profundamente cómo OpenCode, Obsidian y la metodología Zettelkasten pueden integrarse orgánicamente, creando los workflows manuales perfectos que luego automatizaremos.

**Resultado esperado**: Un sistema de gestión del conocimiento validado manualmente, listo para ser potenciado con automatización.

---

## Áreas de Investigación

### 1. Zettelkasten en la Práctica

#### Preguntas fundamentales a explorar:
- ¿Qué significa realmente "nota atómica" en nuestro contexto específico?
- ¿Cómo se siente el flujo fleeting → literature → permanent en uso real?
- ¿Cuándo una nota está "lista" para convertirse en permanente?
- ¿Cómo mantenemos el equilibrio entre estructura y libertad?

#### Experimentos propuestos:
- [ ] Crear 10 notas fleeting reales sobre temas que te interesen
- [ ] Procesarlas a literature con diferentes enfoques
- [ ] Desarrollar 2-3 notas permanentes desde cero
- [ ] Identificar qué funciona y qué no en el flujo manual

#### Documentar:
- Fricciones encontradas
- Momentos de "aha!" 
- Patrones que emergen naturalmente
- Qué decisiones tomas una y otra vez (candidatas a automatización)

---

### 2. OpenCode como Herramienta de Gestión

#### Capacidades a descubrir:
- ¿Cómo "ve" OpenCode un vault de Obsidian?
- ¿Qué contexto necesita para entender la estructura Zettelkasten?
- ¿Cómo podemos enseñarle nuestras convenciones específicas?
- ¿Qué puede hacer bien sin ayuda? ¿Qué necesita guía?

#### Sesiones de exploración sugeridas:

**Sesión A: Exploración inicial**
- Navegar el vault con OpenCode
- Preguntarle qué estructura detecta
- Identificar malentendidos o gaps

**Sesión B: Contexto y convenciones**
- Crear AGENTS.md para el vault
- Definir estructura de carpetas
- Establecer convenciones de nomenclatura
- Documentar metadatos y frontmatter

**Sesión C: Workflows manuales**
- Procesar notas reales con OpenCode
- Refinar prompts iterativamente
- Descubrir qué ayuda realmente aporta

#### Preguntas a responder:
- ¿Cuándo prefieres trabajar directamente en Obsidian vs usar OpenCode?
- ¿Qué tareas son tediosas y candidatas a automatización?
- ¿Qué decisiones toma OpenCode bien? ¿Cuáles necesitan supervisión?

---

### 3. Obsidian como Plataforma

#### Aspectos a explorar:
- ¿Qué plugins nativos son esenciales para nuestro workflow?
- ¿Cómo se siente trabajar con diferentes vistas (editor, preview, canvas)?
- ¿Qué atajos de teclado y comandos usas constantemente?
- ¿Dónde está la fricción en la interfaz actual?

#### Ejercicios prácticos:
- [ ] Mapear tu workflow actual paso a paso
- [ ] Identificar los 5 comandos más usados
- [ ] Encontrar 3 momentos de "fricción" en el día a día
- [ ] Experimentar con diferentes estructuras de carpetas

#### Documentar:
- Gestos y comandos que se vuelven automáticos
- Momentos donde te sientes "perdido" en el vault
- Qué información necesitas ver vs qué puedes ocultar

---

### 4. Integración de los Tres Sistemas

#### La pregunta central:
**¿Cómo fluye el trabajo entre OpenCode, Obsidian y tu mente?**

#### Escenarios a explorar:

**Escenario 1: Captura rápida**
- Tienes una idea mientras lees
- ¿Dónde la capturas? ¿Cómo llega al sistema?
- ¿Quién la procesa primero (tú vs OpenCode)?

**Escenario 2: Procesamiento de inbox**
- Tienes 10 notas sin procesar
- ¿Qué haces con cada una?
- ¿Qué decisiones tomas? ¿Cuáles son siempre iguales?

**Escenario 3: Conexión de ideas**
- Descubres que dos notas se relacionan
- ¿Cómo creas el vínculo?
- ¿Qué contexto necesitas para decidir conectarlas?

**Escenario 4: Búsqueda y recuperación**
- Necesitas información que sabes que capturaste
- ¿Cómo la encuentras?
- ¿Qué hace falta para que sea más fácil?

#### Documentar flujos:
Para cada escenario, documentar:
1. Paso a paso actual (manual)
2. Decisiones tomadas
3. Fricciones encontradas
4. Oportunidades de mejora

---

## Metodología de Investigación

### Fase 1: Inmersión (Semana 1)
**Objetivo**: Usar el sistema intensivamente sin preocuparse por la perfección

- Capturar TODO en el inbox
- No organizar, solo acumular
- Notar qué te estresa vs qué te fluye
- Identificar patrones de uso

### Fase 2: Refinamiento (Semana 2)
**Objetivo**: Ajustar basado en lo aprendido

- Revisar las notas acumuladas
- Identificar categorías naturales que emergieron
- Crear/ajustar templates
- Definir convenciones

### Fase 3: Validación (Semana 3)
**Objetivo**: Probar el sistema refinado

- Usar el nuevo flujo por una semana completa
- Notar qué funciona y qué no
- Identificar "automatizaciones naturales"
- Documentar workflows finales

---

## Templates y Herramientas a Crear Durante la Investigación

### Templates de Notas (a iterar):
```
1. Fleeting Note Template
2. Literature Note Template  
3. Permanent Note Template
4. Project Note Template
5. Daily Note Template
6. MOC (Map of Content) Template
```

### Configuración Git (a definir):
```
- ¿Qué archivos trackear?
- ¿Frecuencia de commits?
- ¿Mensajes de commit estructurados?
- ¿Branches o todo en main?
```

### Skills de OpenCode (a desarrollar):
```
1. Skill de contexto del vault
2. Skill de clasificación Zettelkasten
3. Skill de generación de wikilinks
4. Skill de organización de inbox
```

---

## Documentación a Producir

Durante la investigación, crearemos:

### 1. Vault de Investigación
Una vault paralela donde:
- Documentamos lo que aprendemos
- Guardamos ejemplos reales
- Iteramos templates
- Capturamos ideas sobre el sistema mismo

### 2. Log de Decisiones
```
Fecha | Decisión | Contexto | Alternativas consideradas
```

### 3. Workflow Maps
Diagramas de flujo de:
- Captura → Inbox → Procesamiento
- Fleeting → Literature → Permanent
- Búsqueda → Encontrar → Conectar

### 4. Conventions Document
```
# Convenciones del Vault
## Estructura de carpetas
## Formatos de ID
## Uso de tags
## Nomenclatura de notas
## Metadatos requeridos
```

---

## Preguntas Guía para la Sesión

### Al empezar:
1. ¿Qué problema de gestión del conocimiento me molesta más ahora?
2. ¿Qué parte del flujo actual funciona bien naturalmente?
3. ¿Dónde pierdo más tiempo o energía?

### Durante la investigación:
1. ¿Esto lo hago porque es útil o por inercia?
2. ¿Qué haría más fácil este paso?
3. ¿Qué decisión tomo que podría tomar automáticamente alguien más?

### Al documentar:
1. ¿Esto es específico de mi uso o generalizable?
2. ¿Qué necesitaría saber alguien más para replicar este workflow?
3. ¿Qué asumo que es obvio pero quizás no lo es?

---

## Checklist de Preparación para la Sesión

Antes de empezar, asegurarse de tener:

- [ ] Vault de Obsidian lista (nueva o existente)
- [ ] OpenCode instalado y funcionando
- [ ] Git configurado para el vault (si se usará sync)
- [ ] Material de lectura sobre Zettelkasten a mano (para referencia)
- [ ] Ideas/temas reales para capturar (no ejercicios artificiales)
- [ ] Tiempo dedicado (mínimo 2-3 horas iniciales, luego uso diario)

---

## Resultado Esperado

Al final de esta investigación tendremos:

1. **Sistema validado manualmente** que funciona sin automatización
2. **Workflows documentados** paso a paso
3. **Templates refinados** por uso real
4. **Lista de fricciones** ordenadas por frecuencia/impacto
5. **Mapa de oportunidades de automatización**
6. **Contexto suficiente** para diseñar el MVP de BrainOS con certeza

---

## Nota Final

**Esta no es una tarea de implementación. Es una tarea de descubrimiento.**

No buscamos crear el sistema perfecto de una vez. Buscamos entender profundamente cómo trabajamos con el conocimiento para luego construir herramientas que amplifiquen ese trabajo natural.

**Regla de oro**: Si algo se siente forzado, probablemente no es la forma correcta. Los mejores workflows emergen de la práctica, no de la teoría.

---

*Documento creado: 2026-02-08*
*Estado: Guía de investigación - Listo para ejecutar*
*Sesión sugerida: 2-3 semanas de uso intensivo + documentación*
