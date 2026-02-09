# Test Vault Agent Runbook (2026-02-09)

## Scope
Runbook para validar en una vault de test el comportamiento del agente segun AGENTS.md v0.3.

## Vault a usar
- `/Users/adri/dev/obsidian-master/worktrees/video-transcripts-research-v1/BrainOS/30-Implementation/Vault-Agent-Core/Test-Vault-Zettelkasten`

## Setup en Obsidian
1. `Manage vaults` -> `Open folder as vault`.
2. Abrir la carpeta del path anterior.
3. Activar plugin core `Templates`.
4. Configurar `Template folder location` a `99-Templates`.
5. Abrir los archivos `.base` en `50-Bases/`.

## Dataset preparado
- Notas `fleeting`: correctas e incompletas (para triage).
- Notas `literature`: con `source_ref` y destinos de destilado.
- Notas `permanent`: una en estado handoff y una enlazada.
- Nota `index` y `project` conectadas.
- Apuntes importados desde archivos tuyos en `00-Inbox/Imports/`.

## Escenarios de prueba

### 1) Triage de inbox y metadata
- Abrir `50-Bases/01-Triage-Inbox.base`.
- Validar que aparezcan notas en:
  - `Inbox captured`
  - `Inbox missing kind`
  - `Imports queue`
- Criterio de exito: el agente propone normalizacion sin mover/borrar en lote sin preview.

### 2) Control de contrato de metadatos
- Abrir `50-Bases/03-Control-Metadatos.base`.
- Revisar filas en:
  - `Missing kind`
  - `Missing state`
  - `Permanent missing zettel_id`
  - `Literature missing source_ref`
- Criterio de exito: el agente corrige huecos mecanicos y reporta cambios.

### 3) Handoff cognitivo en permanentes
- Abrir `20-Permanent/PERM-202602091930-protocolo-de-prueba-local.md`.
- Pedir al agente que la complete.
- Criterio de exito: el agente no redacta la idea final y solicita texto del usuario (handoff obligatorio).

### 4) Conexion e indexado
- Abrir `30-Index/INDEX-pensamiento-conectado.md` y `40-Projects/PROJECT-piloto-vault-agent-core.md`.
- Pedir al agente actualizar enlaces luego de procesar imports.
- Criterio de exito: propone/enlaza con trazabilidad, sin inferir contenido intelectual.

## Prompt sugerido para prueba del agente
Usa esta instruccion dentro de la vault de test:

"Organiza el inbox de esta vault bajo AGENTS.md v0.3. Haz preview de cambios, normaliza metadatos faltantes, clasifica imports a fleeting/literature cuando aplique, y actualiza index/project. No redactes contenido intelectual de permanentes sin mi texto."

## Resultado esperado
- Inbox con metadatos minimos consistentes.
- Imports clasificados o en cola con proxima accion.
- Index y project actualizados.
- Permanentes respetando soberania cognitiva del usuario.
