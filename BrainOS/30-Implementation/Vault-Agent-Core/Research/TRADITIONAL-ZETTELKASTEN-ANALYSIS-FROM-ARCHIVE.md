# Traditional Zettelkasten Analysis From Archive

## Scope
Deep analysis of:
- `/Users/adri/dev/obsidian-master/worktrees/video-transcripts-research-v1/BrainOS/90-Archive/00-Initial-Research-Root/Guía de Referencia para Obsidian y Zettelkasten.md`
- `/Users/adri/dev/obsidian-master/worktrees/video-transcripts-research-v1/BrainOS/90-Archive/00-Initial-Research-Root/IA como Socio Cognitivo y la Arquitectura del Segundo Cerebro Aumentado por IA.md`

## Key findings

### From "Guia de Referencia para Obsidian y Zettelkasten"
- Core Zettelkasten note types are explicitly defined as:
- Fleeting notes (captura rapida, temporal, sin estructura fuerte).
- Literature notes (fuente externa + referencia clara).
- Permanent notes (atomicas, en palabras propias, conectadas).
- Core principles:
- Atomicity (one idea per note).
- Explicit linking (wikilinks / bidirectional references).
- Unique identifiers for permanent notes.
- Process loop: Capture -> Process -> Connect -> Review.
- Folder and plugin suggestions exist in the file, but those are implementation options, not the method core.

### From "IA como Socio Cognitivo..."
- The most useful contribution is behavioral, not taxonomic:
- "Thinking mode before writing mode": agent should help think first, not jump to artifact output.
- Agent should act as cognitive partner: ask clarifying questions, synthesize, expose gaps.
- Local-first knowledge access is strategically important (fits Obsidian file-first model).
- The document also discusses MCP and external integrations; those are optional architecture choices, not required to define traditional Zettelkasten notes.

## Method interpretation for BrainOS

### What is method-core (adopt)
- Traditional note taxonomy:
- `fleeting`
- `literature`
- `permanent`
- Optional support notes (not core, but practical):
- `index` (structure/map note)
- `project` (execution context outside core slip-box)
- Permanent note quality:
- atomic
- self-contained
- linked to existing notes when possible
- written in own words

### What is implementation-layer (not method-core)
- Specific plugins.
- Specific folder names.
- Cloud APIs or external AI providers.
- Publishing workflows.

## Proposed note definitions (for AGENTS.md)
- `fleeting`: quick capture, low friction, temporary inbox material.
- `literature`: source-derived extraction with citation/reference.
- `permanent`: refined idea note, one concept, own wording, reusable and linked.
- `index` (recommended support): map/structure note that curates entry points.
- `project` (recommended support): planning/execution note for active work; should reference permanent notes, not replace them.

## Decision impact
- Replace Wanderloots-inspired `atom/molecule/output` taxonomy in agent core.
- Keep system non-strict: anti-orphan rule remains recommendation, not hard gate.
- Keep no-plugin-recommendation and no-external-AI constraints unchanged.
