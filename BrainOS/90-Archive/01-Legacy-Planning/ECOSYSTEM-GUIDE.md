# Ecosistema OpenCode y Obsidian - Guía de Preparación

## 1. OpenCode - Estado del Ecosistema

### 1.1 Skills Nativas (Built-in)

OpenCode soporta **Agent Skills** nativamente desde v1.0.190:

**Ubicaciones donde OpenCode busca skills**:
- `.opencode/skills/<nombre>/SKILL.md` (proyecto local)
- `~/.config/opencode/skills/<nombre>/SKILL.md` (global)
- `.claude/skills/<nombre>/SKILL.md` (compatible Claude)
- `.agents/skills/<nombre>/SKILL.md` (compatible genérico)

**Formato SKILL.md**:
```yaml
---
name: nombre-skill
description: Descripción de qué hace
license: MIT (opcional)
compatibility: opencode (opcional)
metadata:
  clave: valor
---

## What I do
- Capacidad 1
- Capacidad 2

## When to use me
Cuándo invocar esta skill.

## Instructions
Pasos detallados para el agente.
```

### 1.2 Plugins Disponibles Relevantes

#### **opencode-mem** (69 stars)
- **URL**: https://github.com/tickernelz/opencode-mem
- **Descripción**: Sistema de memoria persistente usando base de datos vectorial local
- **Uso para BrainOS**: Permitir que OpenCode recuerde información sobre el vault entre sesiones
- **Instalación**: `npm install opencode-mem` o agregar a `opencode.json`

#### **opencode-skillful** (169 stars)
- **URL**: https://github.com/zenobi-us/opencode-skillful
- **Descripción**: Descubrimiento e inyección lazy-loaded de skills
- **Uso**: Cargar skills bajo demanda, útil para vaults grandes

#### **opencode-workspace** (90 stars)
- **URL**: https://github.com/kdcokenny/opencode-workspace
- **Descripción**: Sistema de orquestación multi-agente
- **Uso**: Coordinar múltiples tareas de organización

### 1.3 Repositorios de Skills para PKM

#### **ballred/obsidian-claude-pkm** (901 stars)
- **URL**: https://github.com/ballred/obsidian-claude-pkm
- **Descripción**: Kit completo de inicio para PKM con Obsidian + Claude Code
- **Relevancia**: MUY ALTA - Diseñado específicamente para Zettelkasten con Obsidian
- **Incluye**: Estructura de carpetas, templates, workflow de procesamiento

#### **gapmiss/obsidian-plugin-skill** (72 stars)
- **URL**: https://github.com/gapmiss/obsidian-plugin-skill
- **Descripción**: Skill especializada para desarrollo de plugins de Obsidian
- **Incluye**: 27 reglas ESLint de Obsidian, guías de seguridad y compatibilidad
- **Uso**: Crear plugins de Obsidian con mejores prácticas

#### **mtymek/opencode-obsidian**
- **URL**: https://github.com/mtymek/opencode-obsidian
- **Descripción**: Integración OpenCode directamente en la barra lateral de Obsidian
- **Uso**: Tener OpenCode disponible sin salir de Obsidian

### 1.4 Awesome OpenCode - Lista Curada

**URL**: https://github.com/awesome-opencode/awesome-opencode (2,000+ stars)

Plugins relevantes para PKM:
- **Agent Memory**: Memoria persistente tipo Letta
- **Agent Skills (JDT)**: Loader dinámico de skills
- **OpenCode Sessions**: Gestión de sesiones multi-agente
- **OpenCode Snippets**: Expansiones de texto inline

---

## 2. Guía de Desarrollo de Plugins Obsidian

### 2.1 Recursos Oficiales

**Documentación Oficial**:
- **Guía**: https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin
- **API TypeScript**: https://github.com/obsidianmd/obsidian-api (2.1k stars)
- **Plugin Sample**: https://github.com/obsidianmd/obsidian-sample-plugin (3.8k stars)

**Sample Plugin - Estructura**:
```
obsidian-sample-plugin/
├── main.ts                 # Entry point
├── manifest.json           # Metadata del plugin
├── styles.css             # Estilos opcionales
├── esbuild.config.mjs     # Configuración build
├── package.json           # Dependencias
├── tsconfig.json          # Config TypeScript
└── version-bump.mjs       # Script de versionado
```

### 2.2 APIs Clave para BrainOS

**Editor API**:
```typescript
// Acceder al editor activo
const activeView = app.workspace.getActiveViewOfType(MarkdownView);
const editor = activeView?.editor;

// Leer contenido
const content = editor.getValue();

// Escribir contenido
editor.setValue(newContent);

// Posición del cursor
const cursor = editor.getCursor();
```

**Vault API**:
```typescript
// Leer archivo
const file = app.vault.getAbstractFileByPath("ruta/nota.md");
const content = await app.vault.read(file);

// Crear archivo
await app.vault.create("nueva-nota.md", "contenido");

// Listar archivos
const files = app.vault.getMarkdownFiles();
```

**MetadataCache API**:
```typescript
// Leer frontmatter
const cache = app.metadataCache.getFileCache(file);
const frontmatter = cache?.frontmatter;

// Detectar cambios
app.metadataCache.on('changed', (file, data, cache) => {
  // Reaccionar a cambios
});
```

**Workspace API**:
```typescript
// Abrir panel lateral
const leaf = workspace.getRightLeaf(false);
await leaf.setViewState({ type: 'brainos-sidebar' });

// Eventos del workspace
app.workspace.on('file-open', (file) => {
  // Nota abierta
});
```

### 2.3 Mejores Prácticas (Oficiales)

**Seguridad**:
- ❌ Evitar `innerHTML`, `outerHTML`, `insertAdjacentHTML`
- ✅ Usar APIs de DOM seguras

**Manejo de Recursos**:
- ✅ Limpiar recursos en `onunload()`
- ❌ No usar `detach` de leaves en `onunload`

**Vault**:
- ✅ Usar `Vault.process` en lugar de `Vault.modify` para modificaciones en background
- ✅ Usar `FileManager.processFrontMatter` para modificar frontmatter
- ✅ Usar `normalizePath()` para rutas definidas por usuario

**Editor**:
- ✅ Preferir Editor API sobre `Vault.modify` para archivo activo
- ✅ Usar `EditorTransaction` para cambios atómicos

**Comandos**:
- ❌ No asignar hotkeys por defecto
- ✅ Usar callback apropiado para cada tipo de comando

### 2.4 Herramientas de Desarrollo

**obsidian-plugin-cli** (No oficial pero recomendado):
```bash
npm install obsidian-plugin-cli --save-dev
```

Scripts mejorados en `package.json`:
```json
{
  "scripts": {
    "dev": "obsidian-plugin dev --with-stylesheet src/styles.css src/main.ts",
    "build": "obsidian-plugin build --with-stylesheet src/styles.css src/main.ts"
  }
}
```

**Hot-Reload Plugin**:
- Plugin que recarga automáticamente durante desarrollo
- Evita tener que desactivar/reactivar manualmente

### 2.5 Flujo de Desarrollo Recomendado

**Setup Inicial**:
```bash
# 1. Crear vault dedicado para desarrollo (nunca usar vault principal)
mkdir brainos-dev-vault
cd brainos-dev-vault/.obsidian/plugins

# 2. Clonar sample plugin
git clone https://github.com/obsidianmd/obsidian-sample-plugin.git brainos

# 3. Instalar dependencias
cd brainos
npm install

# 4. Build inicial
npm run dev
```

**Iteración**:
1. Modificar código
2. `npm run dev` compila automáticamente
3. Reload plugin en Obsidian (o usar Hot-Reload)
4. Probar cambios
5. Repetir

---

## 3. Skills Personalizadas para BrainOS

### 3.1 Estructura de Skills BrainOS

```
.opencode/
└── skills/
    ├── zettelkasten-organizer/
    │   └── SKILL.md
    ├── vault-navigator/
    │   └── SKILL.md
    └── note-synthesizer/
        └── SKILL.md
```

### 3.2 Skill: Zettelkasten Organizer (Ejemplo)

```markdown
---
name: zettelkasten-organizer
description: Organiza notas siguiendo el método Zettelkasten. Clasifica fleeting/literature/permanent, sugiere ubicaciones, tags y conexiones.
license: MIT
compatibility: opencode
metadata:
  domain: pkm
  methodology: zettelkasten
---

## What I do
- Clasificar notas nuevas en fleeting, literature o permanent
- Sugerir ubicación óptima en estructura de carpetas
- Proponer tags relevantes basados en contenido
- Identificar notas relacionadas para wikilinks
- Detectar notas huérfanas (sin conexiones)
- Sugerir conversión de fleeting → literature → permanent

## When to use me
- Al crear o editar notas en el vault
- Cuando el usuario pide "organizar" o "procesar"
- Al detectar notas sin categorizar
- Para mantenimiento periódico del sistema

## Instructions

### 1. Clasificación de Notas

Cuando encuentres una nota nueva:
- **Fleeting**: Ideas rápidas, sin desarrollar, temporales
- **Literature**: Notas sobre fuentes externas, con referencias
- **Permanent**: Ideas atómicas desarrolladas, con conexiones
- **Structure**: Índices, MOCs, notas de estructura

### 2. Estructura de Carpetas Sugerida

```
vault/
├── 00-Inbox/           # Notas fleeting sin procesar
├── 10-Literature/      # Notas de lecturas/fuentes
├── 20-Permanent/       # Notas permanentes Zettelkasten
├── 30-Projects/        # Proyectos activos
└── 90-Archive/         # Notas archivadas
```

### 3. Generación de IDs

Para notas permanentes, usar formato:
- `YYYYMMDD - Título Descriptivo`
- Ejemplo: `20240207 - Concepto de Segundo Cerebro`

### 4. Wikilinks

Sugerir conexiones usando sintaxis Obsidian:
- `[[ID - Título]]` para notas permanentes
- `[[Título]]` para notas literature

### 5. Tags Sugeridos

Usar formato: #categoria/subcategoria
- #concepto/nombre
- #proyecto/nombre
- #persona/nombre
- #estado/semilla

## Output Format

Siempre responder con:
```
📋 Tipo: [fleeting/literature/permanent]
📁 Ubicación: /ruta/sugerida/
🏷️ Tags: [#tag1, #tag2]
🔗 Conexiones: [[Nota 1]], [[Nota 2]]
📝 Acción recomendada: [mover/copiar/renombrar]
```
```

### 3.3 Skill: Vault Navigator (Ejemplo)

```markdown
---
name: vault-navigator
description: Navega y encuentra notas en el vault. Busca por contenido, tags, fechas o conexiones.
license: MIT
---

## What I do
- Buscar notas por contenido o tags
- Encontrar notas relacionadas a una temática
- Identificar clusters de conocimiento
- Sugerir notas para reconectar
- Crear y mantener MOCs (Maps of Content)

## When to use me
- Cuando el usuario busca "notas sobre X"
- Para encontrar conexiones perdidas
- Al crear índices o MOCs
- Para mantenimiento del vault

## Instructions

### Búsqueda Semántica

Buscar no solo por keywords exactas, sino por:
- Conceptos relacionados
- Sinónimos
- Temas similares
- Contexto de las notas

### Sugerencias de MOC

Crear MOC cuando:
- Hay 5+ notas sobre el mismo tema
- El usuario solicita "índice de X"
- Se detecta un cluster temático emergente

### Formatos de Respuesta

Para búsquedas:
```
🔍 Resultados para "productividad":
1. [[20240201 - Deep Work]] (literature)
2. [[20240205 - Sistemas vs Metas]] (permanent)
3. [[20240206 - Atención Profunda]] (permanent)

💡 Sugerencias de conexión:
- Conectar nota 2 con nota 3 (tema relacionado)
```
```

---

## 4. Integración OpenCode ↔ Obsidian

### 4.1 Opciones de Integración

**Opción A: Plugin Obsidian con SDK de OpenCode**
```typescript
// Plugin Obsidian usa SDK de OpenCode
import { createOpencodeClient } from "@opencode-ai/sdk"

export default class BrainOSPlugin extends Plugin {
  private opencodeClient: any

  async onload() {
    this.opencodeClient = createOpencodeClient({
      baseUrl: "http://localhost:4096"
    })

    // Comando: Organizar nota actual
    this.addCommand({
      id: 'organize-note',
      name: 'Organizar nota actual',
      callback: () => this.organizeCurrentNote()
    })
  }

  async organizeCurrentNote() {
    const note = this.app.workspace.getActiveFile()
    const content = await this.app.vault.read(note)
    
    // Enviar a OpenCode
    const response = await this.opencodeClient.session.prompt({
      body: {
        parts: [{
          type: "text",
          text: `Organiza esta nota Zettelkasten:\n\n${content}`
        }]
      }
    })
    
    // Mostrar sugerencias en panel
    this.showSuggestions(response.data)
  }
}
```

**Opción B: OpenCode con vault como contexto**
```bash
# En la carpeta del vault
opencode

# OpenCode tiene acceso a todos los archivos .md
# Usar skills de BrainOS para procesar
```

### 4.2 Recomendación para BrainOS

**Opción A (Recomendada)**: Plugin Obsidian + OpenCode SDK
- Mejor UX: UI integrada en Obsidian
- Comandos y atajos de teclado
- Panel lateral nativo
- Comunicación bidireccional HTTP + SSE

### 4.3 Configuración OpenCode para BrainOS

**`opencode.json` en raíz del vault**:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "name": "BrainOS Vault",
  "skills": [
    "zettelkasten-organizer",
    "vault-navigator"
  ],
  "plugins": [
    "opencode-mem"
  ],
  "agents": {
    "brainos": {
      "model": "openrouter/anthropic/claude-3.5-sonnet",
      "systemPrompt": "Eres BrainOS, un asistente experto en Zettelkasten..."
    }
  }
}
```

---

## 5. Setup de Desarrollo Recomendado

### 5.1 Estructura del Proyecto

```
brainos-project/
├── BrainOS/                          # Documentación
│   ├── 00-Meta/
│   ├── 10-Technical-Architecture/
│   └── 20-Methodology-System/
│
├── vault-dev/                        # Vault de desarrollo
│   ├── .obsidian/
│   │   └── plugins/
│   │       └── brainos/             # Plugin en desarrollo
│   │           ├── main.ts
│   │           ├── manifest.json
│   │           └── ...
│   │
│   └── .opencode/
│       └── skills/
│           ├── zettelkasten-organizer/
│           └── vault-navigator/
│
└── opencode-server/                  # Configuración servidor
    └── (opencode serve se ejecuta aquí)
```

### 5.2 Dependencias

**Plugin Obsidian**:
```json
{
  "dependencies": {
    "obsidian": "latest",
    "@opencode-ai/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "esbuild": "^0.20",
    "obsidian-plugin-cli": "^0.2.0",
    "typescript": "^5"
  }
}
```

### 5.3 Comandos de Desarrollo

```bash
# Terminal 1: OpenCode server
cd vault-dev
opencode serve --port 4096

# Terminal 2: Build plugin
cd vault-dev/.obsidian/plugins/brainos
npm run dev

# Terminal 3: Obsidian (abrir vault-dev)
open vault-dev
```

---

## 6. Recursos Adicionales

### Documentación OpenCode
- **Skills**: https://opencode.ai/docs/skills/
- **Plugins**: https://opencode.ai/docs/plugins/
- **SDK**: https://opencode.ai/docs/sdk/
- **Server**: https://opencode.ai/docs/server/

### Documentación Obsidian
- **Build Plugin**: https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin
- **API Reference**: https://docs.obsidian.md/Reference/TypeScript+API/Reference
- **Sample Plugin**: https://github.com/obsidianmd/obsidian-sample-plugin

### Comunidad
- **OpenCode Discord**: https://opencode.ai/discord
- **Obsidian Forum**: https://forum.obsidian.md/
- **Awesome OpenCode**: https://github.com/awesome-opencode/awesome-opencode

---

**Estado**: Documento vivo - Actualizar conforme se descubran nuevos recursos

**Última actualización**: 2026-02-08
