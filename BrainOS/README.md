# BrainOS

## Un Sistema de Gestión del Conocimiento Aumentado por IA

BrainOS es un **ecosistema de colaboración en tiempo real** entre tú y agentes de IA especializados, diseñado para potenciar tu sistema Zettelkasten y transformar tu vault de Obsidian en un verdadero segundo cerebro.

### 🎯 Filosofía: Pair Programming con IA

No es una herramienta que ejecuta comandos. Es un **colaborador cognitivo** que trabaja junto a ti:

- **Visual**: Organiza contigo en el Canvas de Obsidian
- **Contextual**: Sugiere mientras escribes (tipo Copilot)
- **Profundo**: Investiga y debate contigo en tiempo real
- **Terminal**: Potencia total cuando la necesitas

---

## 🏗️ Arquitectura

```
┌─────────────────┐  HTTP (requests)   ┌─────────────────┐
│    OBSIDIAN     │  ───────────────►  │    OPENCODE     │
│                 │    Tiempo Real     │                 │
│                 │  ◄───────────────  │                 │
│                 │   SSE (eventos)    │                 │
│ • Canvas API    │                    │ • Skills        │
│ • Editor Ext    │                    │ • Agentes       │
│ • UI Panels     │                    │ • LLM           │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         └──────────────┬───────────────────────┘
                        │
              ┌─────────▼──────────┐
              │    VAULT MD        │
              │  (filesystem)      │
              └────────────────────┘
```

**Estado MVP v0.1 (cerrado):**
- Protocolo de integración: **HTTP + SSE** (ADR-001).
- Persistencia de estado: **in-memory** durante sesión; solo configuración en `data.json` (ADR-003).
- WebSocket custom, MCP como transporte principal y persistencia avanzada: **post-MVP**.

**Tres modalidades de colaboración:**

### 1. 🎨 Modo Canvas: Visual & Espacial
- Arrastra notas, el agente sugiere agrupaciones
- Ve previews de conexiones antes de aplicar
- Organiza visualmente, se refleja en el filesystem

### 2. ✍️ Modo Editor: Inline & Contextual  
- Sugerencias tipo Ghost Text mientras escribes
- Detecta conceptos y sugiere wikilinks
- Completions inteligentes

### 3. 🧠 Modo Terminal: Power & Batch
- Investigación profunda con múltiples agentes
- Debate socrático (Investigador vs Crítico)
- Procesamiento batch del vault

---

## 📁 Estructura del Proyecto

```
BrainOS/
├── 📄 README.md                    ← Este archivo (punto de entrada)
├── 📄 VISION-INTEGRATED.md         ← Visión completa del sistema
│
├── 📁 00-Meta/                     ← Documentación meta
│   ├── README.md
│   ├── CANONICAL-SOURCE-OF-TRUTH-v0.1.md
│   └── CANONICAL-CONTRADICTIONS-MAP.md
│
├── 📁 10-Technical-Architecture/   ← Implementación técnica
│   ├── TECHNICAL-REALTIME.md       ← Referencia aspiracional (post-MVP)
│   └── 01-Core-Architecture/
│       ├── ADR-001-Communication-Protocol.md
│       ├── ADR-002-Embedding-Strategy.md
│       └── ADR-003-Memory-Persistence.md
│
├── 📁 20-Methodology-System/       ← Diseño del sistema (Zettelkasten)
│   ├── METHODOLOGY-MASTER.md       ← Agentes y flujos (ACTUALIZADO)
│   └── INBOX-SYSTEM.md             ← Sistema de Inbox y Procesamiento (NUEVO)
│
├── 📁 30-Implementation/           ← Código (futuro)
│
└── 📁 90-Archive/                  ← Decisiones descartadas
```

---

## 🚀 Cómo Empezar

### Prerrequisitos

- [Obsidian](https://obsidian.md/) instalado
- [OpenCode](https://opencode.ai/) instalado
- Un vault de Obsidian con algunas notas

### Instalación Rápida

```bash
# 1. Clonar configuración BrainOS en tu vault
cd ~/Obsidian/MiVault
git clone https://github.com/brainos/core .brainos

# 2. Instalar plugin Obsidian (próximamente en Community Plugins)
# Por ahora: copiar a .obsidian/plugins/brainos/

# 3. Iniciar OpenCode con BrainOS
opencode

# 4. Conectar desde Obsidian
# Abrir command palette → "BrainOS: Connect"
```

### Uso Básico

**Desde Obsidian:**
- Escribe una nota → BrainOS sugiere wikilinks
- Abre Canvas → BrainOS propone organización
- Selecciona texto → "Debate con BrainOS"

**Desde Terminal:**
```bash
$ opencode
> Organiza mi inbox
> Investiga "productividad profunda" y crea nota
> Inicia debate sobre [[MiIdeaControvertida]]
```

---

## 🧩 Componentes

### Agentes Especializados

| Agente | Rol | Modo |
|--------|-----|------|
| **Organizador** | Clasifica notas, sugiere estructura | Canvas + Terminal |
| **Archivero** | Navegación, MOCs, recuperación | Canvas |
| **Conector** | Sugiere wikilinks, detecta relaciones | Editor |
| **Investigador** | Deep research, síntesis | Terminal + Panel |
| **Crítico** | Revisa, cuestiona, mejora | Editor + Debate |

### Skills de OpenCode

- `canvas-organizer`: Organización visual
- `inline-assistant`: Sugerencias contextuales  
- `deep-researcher`: Investigación profunda
- `socratic-debate`: Debate multi-agente

---

## 📊 Comparativa

| Feature | Smart Connections | Copilot | **BrainOS** |
|---------|------------------|---------|-------------|
| Canvas Collaboration | ❌ | Parcial | ✅✅✅ |
| Inline Suggestions | ❌ | Básico | ✅✅✅ |
| Multi-Agente Debate | ❌ | ❌ | ✅✅✅ |
| Terminal + UI | ❌ | ❌ | ✅✅✅ |
| Zettelkasten Native | ❌ | ❌ | ✅✅✅ |
| Live Pair Programming | ❌ | ❌ | ✅✅✅ |

---

## 🗺️ Roadmap

### Fase 0: PoC (Ahora)
- [ ] Bridge HTTP+SSE básico
- [ ] Un skill simple
- [ ] Canvas preview básico

### Fase 1: Core
- [ ] Canvas organizer completo
- [ ] Inline suggester
- [ ] 3 agentes básicos

### Fase 2: Inteligencia
- [ ] Embeddings opcionales
- [ ] Deep research agent
- [ ] Multi-agente debate

### Fase 3: Ecosistema
- [ ] Plugin Community Store
- [ ] Documentación completa
- [ ] Templates preconfigurados

---

## 📚 Documentación

- **[Visión Integrada](VISION-INTEGRATED.md)** - Concepto completo del sistema
- **[Fuente Canónica v0.1](00-Meta/CANONICAL-SOURCE-OF-TRUTH-v0.1.md)** - Decisiones cerradas MVP y pendientes reales
- **[Arquitectura Técnica](10-Technical-Architecture/TECHNICAL-MASTER.md)** - Baseline técnico MVP + evolución post-MVP
- **[Metodología](20-Methodology-System/METHODOLOGY-MASTER.md)** - Agentes y flujos Zettelkasten
- **[ADRs](10-Technical-Architecture/01-Core-Architecture/)** - Decisiones arquitectónicas

---

## 🤝 Contribuir

BrainOS está en fase de diseño. Si quieres contribuir:

1. Lee la [Visión](VISION-INTEGRATED.md)
2. Revisa los [ADRs](10-Technical-Architecture/01-Core-Architecture/)
3. Abre un issue con tus ideas

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE)

---

**BrainOS** - *Tu segundo cerebro, potenciado por IA*

**Estado**: 🟡 En diseño activo
