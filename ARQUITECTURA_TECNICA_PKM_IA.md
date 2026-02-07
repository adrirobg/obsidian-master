# Arquitectura Técnica: PKM Aumentado por IA

> Documento de trabajo para el desarrollo del Segundo Cerebro Aumentado por IA

---

## 1. Visión General del Proyecto

**Objetivo**: Integrar una IA como **socio cognitivo-colaborativo** y gestor de una PKM (Personal Knowledge Management) utilizando Obsidian como base.

**Principios Fundamentales**:
- El usuario **siempre decide** qué se hace con su conocimiento
- La IA amplifica el pensamiento, no lo reemplaza
- **Guardrail crítico**: Nunca eliminar nada sin permiso explícito
- Sistema Zettelkasten como metodología organizativa

---

## 2. Herramientas CLI para Integración IA

> **DECISIÓN**: Utilizaremos **OpenCode** como herramienta CLI principal, priorizando el camino **open-source**.

### 2.1 OpenCode (Open Source + OpenRouter) ⭐ PRINCIPAL

**Descripción**: Asistente de código IA open-source para terminal con soporte multi-proveedor.

**Web**: https://opencode.ai  
**GitHub**: https://github.com/opencode-ai/opencode

**Ventajas**:
- ✅ **Open source** - Código abierto y transparente
- ✅ Integración nativa con **OpenRouter** (acceso a múltiples LLMs)
- ✅ Configuración flexible via `opencode.json`
- ✅ No dependemos de un solo proveedor

**Configuración OpenRouter**:
```bash
export OPENAI_API_BASE=https://openrouter.ai/api/v1
export OPENAI_API_KEY=tu_api_key_openrouter
```

**Nota**: Para sub-agentes, usar prefijo `openrouter/` en el modelo (ej: `openrouter/anthropic/claude-3.5-sonnet`)

---

### 2.2 Claude Code (Anthropic) - Referencia

**Descripción**: CLI oficial de Anthropic. Documentado como referencia por sus patrones de diseño.

**Características útiles a considerar**:
| Funcionalidad | Concepto |
|---------------|----------|
| Contexto persistente del proyecto | Archivo tipo `CLAUDE.md` en raíz |
| System prompts personalizados | Archivos de configuración |
| Comandos personalizados | Directorio de comandos `.commands/` |
| Sub-agentes definidos por JSON | Agentes especializados |
| Hooks de automatización | Pre/post ejecución de herramientas |

---

### 2.3 AgentZero - Alternativa para Máxima Autonomía

**Descripción**: Framework open-source para agentes IA autónomos y auto-evolutivos.

**GitHub**: https://github.com/frdel/agent-zero

**Características**:
| Capacidad | Descripción |
|-----------|-------------|
| Entorno Docker | Opera dentro de un entorno Linux virtualizado |
| Auto-evolución | Crea y adapta herramientas según necesidad |
| Memoria persistente | Aprende de soluciones pasadas |
| Multi-agente | Cooperación entre instancias de agentes |

**Consideración**: Opción a explorar si necesitamos máxima autonomía.

---

### 2.4 Skills: Conocimiento Reutilizable para Agentes ⭐ CLAVE

> [!IMPORTANT]
> Las **Skills** son archivos `SKILL.md` que encapsulan conocimiento especializado que la IA puede usar. Son el mecanismo perfecto para enseñarle a OpenCode cómo trabajar con Obsidian.

**¿Qué son las Skills?**

Las Skills son archivos Markdown con instrucciones y ejemplos que la IA puede cargar "on-demand" cuando los necesita. Funcionan como "documentos de onboarding" para el agente.

**Estructura de una Skill:**
```markdown
---
name: mi-skill
description: Descripción de cuándo usar esta skill
---

# Contenido
Instrucciones detalladas, ejemplos, sintaxis...
```

**Ubicación de Skills:**
```
.opencode/skills/        # Skills del proyecto
~/.config/opencode/skills/  # Skills globales
```

**Descubrimiento y Uso:**
- OpenCode escanea automáticamente las carpetas de skills
- Las carga quando la descripción coincide con la tarea
- Pueden invocarse explícitamente: `skill({ name: "skill-name" })`

---

### 2.5 Skills de Obsidian (kepano/obsidian-skills)

**GitHub**: https://github.com/kepano/obsidian-skills

> [!TIP]
> Este repositorio contiene skills pre-hechas para trabajar con Obsidian. **MUY relevante para nuestro proyecto.**

**Skills disponibles:**

| Skill | Descripción | Uso |
|-------|-------------|-----|
| **obsidian-markdown** | Obsidian Flavored Markdown: wikilinks, embeds, callouts, properties | Crear/editar notas `.md` |
| **json-canvas** | Formato JSON Canvas para diagramas y mapas mentales | Crear archivos `.canvas` |
| **obsidian-bases** | Vistas de base de datos, filtros, fórmulas | Crear archivos `.base` |

**Instalación en OpenCode:**
```bash
# Copiar skills al directorio de OpenCode
git clone https://github.com/kepano/obsidian-skills.git
cp -r obsidian-skills/skills/* ~/.config/opencode/skills/
```

**Contenido de `obsidian-markdown` (resumen):**
- Wikilinks: `[[Nota]]`, `[[Nota#Heading]]`, `[[Nota|Display]]`
- Embeds: `![[imagen.png]]`, `![[nota.md]]`
- Callouts: `> [!note]`, `> [!warning]`, etc.
- Properties (frontmatter YAML)
- Tags: `#tag`, `#nested/tag`
- Markdown extendido: math, mermaid, footnotes

**Contenido de `obsidian-bases` (resumen):**
- Vistas dinámicas de notas (tabla, cards, lista, mapa)
- Filtros: `file.hasTag()`, `file.inFolder()`, operadores lógicos
- Fórmulas: cálculos sobre propiedades
- Summaries: agregaciones (Average, Sum, Min, Max)

> [!NOTE]
> Podemos crear nuestras propias skills específicas para el flujo Zettelkasten y la organización de notas.

---

---

## 3. Conexión con Obsidian

### 3.1 Obsidian CLI (Yakitrak)

**GitHub**: https://github.com/Yakitrak/obsidian-cli

**Instalación**:
```bash
# Windows (Scoop)
scoop install obsidian-cli

# Mac/Linux (Homebrew)
brew install yakitrak/obsidian-cli/obsidian-cli
```

**Funcionalidades**:
- `obsidian open <nota>` - Abrir nota
- `obsidian search <query>` - Buscar en notas
- `obsidian create <nota>` - Crear nota
- `obsidian update <nota>` - Actualizar nota
- `obsidian move <nota>` - Mover nota
- `obsidian delete <nota>` - Eliminar nota
- `obsidian daily` - Abrir nota diaria
- `--editor` - Abrir en editor externo en lugar de Obsidian

**Caso de Uso**: Perfecto para que una IA CLI manipule el vault directamente.

---

### 3.2 Local REST API Plugin

**Plugin**: `obsidian-local-rest-api` by coddingtonbear

**GitHub**: https://github.com/coddingtonbear/obsidian-local-rest-api

**Endpoints**:
- **HTTP**: `http://127.0.0.1:27123/`
- **HTTPS**: `https://127.0.0.1:27124/`

**Capacidades**:
| Operación | Disponible |
|-----------|------------|
| Leer notas | ✅ |
| Crear notas | ✅ |
| Actualizar notas | ✅ |
| Eliminar notas | ✅ |
| Listar notas del vault | ✅ |
| Notas periódicas (diarias, etc.) | ✅ |
| Ejecutar comandos de Obsidian | ✅ |

**Seguridad**: Autenticación por API Key.

**MCP Server Disponible**: Existe `Obsidian Local REST API MCP Server` para conectar con IA.

---

## 4. Decisiones de Arquitectura

### 4.1 Ubicación de la IA: ¿Dentro o Fuera de Obsidian?

| Opción | Pros | Contras |
|--------|------|---------|
| **Plugin de Obsidian** | Integración nativa, UX fluida | Limitado al contexto de Obsidian |
| **CLI Externa** | Más potente, acceso a filesystem completo | Cambio de contexto manual |
| **Híbrido** | Lo mejor de ambos mundos | Mayor complejidad |

**Recomendación**: Empezar con **CLI externa** (OpenCode) para máxima flexibilidad, usando Obsidian CLI o Local REST API para interactuar con el vault. El entorno de desarrollo de plugins de Obsidian es excelente si queremos crear una experiencia más integrada después.

---

### 4.2 Modelos de Interacción: ¿Cómo "Actúa" la IA?

> [!IMPORTANT]
> **Pregunta clave**: ¿Cómo y cuándo se activa la IA para asistir al usuario?

#### Opción A: Invocación Manual (PULL)

**Descripción**: El usuario invoca explícitamente la IA cuando la necesita.

```
USUARIO completa su trabajo → USUARIO ejecuta comando → IA analiza y responde
```

**Implementación**:
| Método | Cómo funciona |
|--------|---------------|
| **Comando en terminal** | `opencode "analiza mi última nota en Obsidian"` |
| **Shortcut en Obsidian** | Plugin que envía contenido actual a CLI/API |
| **Slash command** | `/analyze` dentro de una nota que activa proceso |

**Pros**: Control total, sin acciones inesperadas, bajo consumo de recursos
**Contras**: Requiere acción consciente del usuario

---

#### Opción B: File Watcher (PUSH Automático)

**Descripción**: Un proceso en background detecta cambios en el vault y actúa.

```
USUARIO guarda nota → Watcher detecta cambio → IA analiza automáticamente
```

**Implementación técnica**:
```javascript
// Ejemplo con chokidar (Node.js)
const chokidar = require('chokidar');

chokidar.watch('/path/to/vault/**/*.md', {
  ignored: /(^|[\/\\])\../,  // ignorar dotfiles
  persistent: true
}).on('change', (path) => {
  // Triggear análisis de IA
  triggerAIAnalysis(path);
});
```

**Herramientas**:
- **chokidar** (Node.js) - Robusto, cross-platform
- **watchdog** (Python) - Alternativa Python
- **Plugin Obsidian** - Eventos nativos `vault.on('modify', ...)`

**Pros**: Automático, siempre disponible
**Contras**: Puede ser intrusivo, consume recursos, puede saturar con muchos cambios

---

#### Opción C: Trigger por Eventos Específicos (Selectivo)

**Descripción**: La IA solo se activa ante ciertos eventos definidos.

| Evento | Trigger |
|--------|---------|
| Nota guardada con tag `#procesar` | IA analiza esa nota |
| Nota movida a carpeta `/00-Inbox/` | IA sugiere organización |
| Usuario cierra nota después de X minutos editando | IA ofrece sugerencias |
| Nota creada desde template específico | IA completa metadatos |

**Implementación**: Plugin de Obsidian que escucha eventos específicos.

---

#### Opción D: Híbrido Recomendado ⭐

**Descripción**: Combinar invocación manual con triggers opcionales configurables.

```
┌─────────────────────────────────────────────────────────┐
│  MODO PRINCIPAL: Invocación Manual (PULL)               │
│  - Usuario ejecuta comando cuando quiere asistencia     │
│  - Control total, sin sorpresas                         │
├─────────────────────────────────────────────────────────┤
│  MODO OPCIONAL: Triggers Configurables                  │
│  - Usuario puede activar/desactivar en settings         │
│  - Ejemplo: "Analizar automáticamente al guardar en     │
│    carpeta /00-Inbox/"                                  │
└─────────────────────────────────────────────────────────┘
```

**Configuración propuesta** (`config.yaml` o similar):
```yaml
triggers:
  auto_analyze_on_save: false          # Por defecto desactivado
  folders_to_watch:
    - "/00-Inbox/"                      # Solo estas carpetas
  tags_to_process:
    - "#procesar"                       # Solo notas con este tag
  min_edit_time_seconds: 60             # Solo si editó >1 min
  
interaction:
  show_suggestions_as: "sidebar"        # sidebar | modal | inline
  auto_apply: false                     # NUNCA aplicar sin confirmación
```

---

#### Decisión Pendiente: ¿Qué modelo preferimos?

| Criterio | Manual (A) | Watcher (B) | Selectivo (C) | Híbrido (D) |
|----------|------------|-------------|---------------|-------------|
| Control usuario | ⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| Fluidez UX | ⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Complejidad implementación | Baja | Media | Media | Alta |
| Consumo recursos | Bajo | Alto | Medio | Configurable |

> **Recomendación inicial**: Empezar con **Opción A (Manual)** para MVP, luego evolucionar a **Opción D (Híbrido)**.

---

### 4.3 Flujo de Trabajo Prioritario: Captura → Organización Zettelkasten

**Caso de uso objetivo**: 
> "Añadir un link interesante, escribir notas sobre él, y que se organicen correctamente en el ecosistema Zettelkasten con vínculos apropiados."

> [!IMPORTANT]
> **El usuario SIEMPRE escribe el contenido.** La IA NO genera el contenido sobre el link, solo asiste al finalizar.

**Flujo propuesto**:
```
1. USUARIO añade un link/recurso interesante
2. USUARIO escribe sus propias reflexiones y notas sobre el contenido
3. USUARIO indica que ha terminado de escribir
4. IA analiza:
   - El contenido escrito por el usuario
   - El vault existente buscando conexiones
5. IA sugiere (NO ejecuta automáticamente):
   - Wikilinks a notas existentes relevantes
   - Etiquetas apropiadas
   - Ubicación óptima en la estructura de carpetas
   - Posibles notas permanentes a derivar
6. USUARIO revisa y aprueba las sugerencias
7. IA ejecuta SOLO los cambios aprobados
```

**Principio**: La IA es un **asistente de organización**, no un generador de contenido. El conocimiento es del usuario.

---

## 5. Ecosistema de Plugins de Obsidian

Obsidian cuenta con **+2,000 plugins comunitarios**. Los siguientes son relevantes para nuestro proyecto:

### 5.1 Plugins de Automatización

| Plugin | Función | Uso en nuestro proyecto |
|--------|---------|-------------------------|
| **Dataview** | Base de datos dinámica sobre notas | Queries para encontrar conexiones |
| **Templater** | Templates dinámicos con JS | Plantillas Zettelkasten automáticas |
| **QuickAdd** | Captura rápida con comandos | Capturar links/ideas rápidamente |
| **Auto Note Mover** | Mover notas automáticamente por reglas | Organización basada en tags |
| **Tasks** | Gestión de tareas con fechas | Tracking de notas pendientes |
| **Periodic Notes** | Notas diarias/semanales/mensuales | Rutinas de revisión |

### 5.2 Plugins de IA Existentes

| Plugin | Descripción |
|--------|-------------|
| **Smart Connections** | Búsqueda semántica local, descubre conexiones |
| **Copilot for Obsidian** | Chat con el vault (RAG) |
| **Smart Second Brain** | LLMs locales con Ollama |
| **Text Generator** | Generación basada en templates |

### 5.3 API de Desarrollo de Plugins

**Documentación oficial**: https://docs.obsidian.md/

**Recursos**:
- Plugin Sample: https://github.com/obsidianmd/obsidian-sample-plugin
- Comunidad: Discord `#plugin-dev` y Foro "Developers & API"
- Lenguaje: **TypeScript**

**Posibilidad**: Desarrollar un plugin nativo que se comunique con OpenCode o directamente con OpenRouter.

---

## 6. Stack Tecnológico (Decisión)

| Componente | Decisión | Notas |
|------------|----------|-------|
| **CLI Principal** | **OpenCode** | Open source, flexible |
| **Proveedores LLM** | **OpenRouter** | Multi-modelo según necesidad |
| **Acceso al Vault** | Obsidian CLI / Local REST API | A probar cuál funciona mejor |
| **Metodología PKM** | **Zettelkasten** | - |
| **Versionado** | **Git** | - |

---

## 7. Roadmap: Pasos hacia la Implementación

### Fase 0: Validación de Infraestructura ⏳ ACTUAL

> Objetivo: Confirmar que las herramientas elegidas funcionan como esperamos.

| Paso | Descripción | Estado | Dependencias |
|------|-------------|--------|--------------|
| 0.1 | Instalar OpenCode | ❌ Pendiente | - |
| 0.2 | Configurar OpenRouter (API key, modelo) | ❌ Pendiente | 0.1 |
| 0.3 | Verificar que OpenCode + OpenRouter funcionan | ❌ Pendiente | 0.2 |
| 0.4 | Instalar Obsidian CLI (scoop/brew) | ❌ Pendiente | - |
| 0.5 | Probar comandos básicos de Obsidian CLI con vault | ❌ Pendiente | 0.4, vault de prueba |
| 0.6 | Instalar Local REST API plugin en Obsidian | ❌ Pendiente | - |
| 0.7 | Probar endpoints de Local REST API | ❌ Pendiente | 0.6 |

**Decisión pendiente tras Fase 0:**
- ¿Usamos Obsidian CLI o Local REST API para acceder al vault?

---

### Fase 1: Prueba de Concepto Mínima

> Objetivo: OpenCode lee una nota del vault y responde algo útil.

| Paso | Descripción | Estado | Dependencias |
|------|-------------|--------|--------------|
| 1.1 | Definir vault de prueba con algunas notas Zettelkasten | ❌ Pendiente | - |
| 1.2 | Configurar OpenCode apuntando al vault | ❌ Pendiente | Fase 0 completa |
| 1.3 | Instalar skills de kepano (obsidian-markdown) | ❌ Pendiente | 1.2 |
| 1.4 | Ejecutar prompt manual: "lee nota X y sugiere wikilinks" | ❌ Pendiente | 1.3 |
| 1.5 | Evaluar calidad de respuesta | ❌ Pendiente | 1.4 |

**Decisión pendiente tras Fase 1:**
- ¿El modelo entiende bien la sintaxis de Obsidian con las skills de kepano?
- ¿Qué modelo de OpenRouter funciona mejor? (Claude, GPT-4, Gemini...)

---

### Fase 2: Contexto Persistente del Vault

> Objetivo: OpenCode "conoce" la estructura y contenido del vault.

| Paso | Descripción | Estado | Dependencias |
|------|-------------|--------|--------------|
| 2.1 | Definir qué información del vault dar como contexto | ❌ Pendiente | - |
| 2.2 | Crear archivo de contexto del proyecto (tipo CLAUDE.md) | ❌ Pendiente | 2.1 |
| 2.3 | Incluir estructura de carpetas Zettelkasten | ❌ Pendiente | 2.2 |
| 2.4 | Probar prompt con contexto: "sugiere organización para nota" | ❌ Pendiente | 2.3 |

**Decisiones pendientes:**
- ¿Cuánto contexto es demasiado? (límites de tokens)
- ¿Cómo actualizamos el contexto cuando el vault cambia?

---

### Fase 3: Flujo de Trabajo Completo (MVP)

> Objetivo: Usuario escribe nota → invoca IA → IA sugiere organización → Usuario aprueba/modifica → IA aplica cambios.

| Paso | Descripción | Estado | Dependencias |
|------|-------------|--------|--------------|
| 3.1 | Definir comando/script para invocar el flujo | ❌ Pendiente | Fase 2 completa |
| 3.2 | Diseñar formato de sugerencias (wikilinks, tags, ubicación) | ❌ Pendiente | - |
| 3.3 | Diseñar mecanismo de aprobación del usuario | ❌ Pendiente | - |
| 3.4 | Implementar aplicación de cambios aprobados | ❌ Pendiente | 3.3 |
| 3.5 | Probar flujo end-to-end | ❌ Pendiente | 3.4 |

---

## 8. Decisiones Técnicas Pendientes

| # | Decisión | Opciones | Notas |
|---|----------|----------|-------|
| D1 | **Acceso al Vault** | Obsidian CLI vs Local REST API | Probar ambos en Fase 0 |
| D2 | **Modelo LLM principal** | Claude 3.5 / GPT-4o / Gemini / otros | Evaluar en Fase 1 por calidad y costo |
| D3 | **Formato de contexto** | Archivo único vs múltiples archivos | Depende de límites de tokens |
| D4 | **Mecanismo de invocación** | Comando terminal vs hotkey Obsidian | Empezar con terminal (manual) |
| D5 | **Formato de sugerencias** | Texto plano vs JSON estructurado vs diff | Afecta UX de aprobación |
| D6 | **Aplicación de cambios** | Modificar archivo directamente vs crear nuevo | Depende de D1 |
| D7 | **Búsqueda en vault** | Grep/ripgrep vs Obsidian search vs embeddings | Más adelante, para encontrar conexiones |

---

## 9. Preguntas Abiertas de Investigación

| Área | Pregunta |
|------|----------|
| **Skills** | ¿Las skills de kepano son suficientes o necesitamos crear las nuestras? |
| **Contexto** | ¿Cómo dar contexto del vault sin exceder límites de tokens? |
| **Búsqueda semántica** | ¿Usamos embeddings locales (ollama) o cloud para encontrar notas relacionadas? |
| **Memoria** | ¿El agente debe "recordar" interacciones anteriores? ¿Cómo? |
| **UX** | ¿Cómo presentamos las sugerencias al usuario? (terminal, archivo, UI?) |

---

## 8. Referencias y Recursos

### Herramientas Principales
- [OpenCode](https://opencode.ai) - CLI principal
- [OpenRouter](https://openrouter.ai) - Proveedor multi-LLM
- [Obsidian CLI](https://github.com/Yakitrak/obsidian-cli) - Acceso CLI al vault
- [Local REST API Plugin](https://github.com/coddingtonbear/obsidian-local-rest-api) - API HTTP

### Documentación Obsidian
- [Obsidian Help](https://help.obsidian.md/) - Documentación usuario
- [Obsidian Developer Docs](https://docs.obsidian.md/) - API y desarrollo de plugins
- [Plugin Sample](https://github.com/obsidianmd/obsidian-sample-plugin) - Template para plugins

### Alternativas/Referencias
- [AgentZero GitHub](https://github.com/frdel/agent-zero) - Framework de agentes
- [Claude Code Docs](https://docs.anthropic.com/claude/docs/claude-code) - Referencia de patrones

---

*Última actualización: 2026-01-29*
