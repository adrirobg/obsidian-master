# Test Vault Zettelkasten (Vault Agent Core)

Esta vault es un entorno de prueba para validar el agente de gestion del vault con reglas del AGENTS.md v0.3.

## Objetivo
- Probar captura, triage, conexion y revision sin tocar tu vault principal.
- Evaluar organizacion de notas mixtas: notas buenas, notas incompletas y apuntes importados.

## Estructura
- `00-Inbox/`: capturas y entradas sin procesar.
- `00-Inbox/Imports/`: apuntes importados desde tu repositorio actual.
- `10-Literature/`: notas derivadas de fuentes.
- `20-Permanent/`: notas permanentes (con handoff cognitivo respetado).
- `30-Index/`: notas de estructura.
- `40-Projects/`: ejecucion por proyecto.
- `50-Bases/`: vistas `.base` de triage/revision.
- `99-Templates/`: plantillas operativas.

## Apertura en Obsidian
1. Obsidian -> `Manage vaults`.
2. `Open folder as vault`.
3. Seleccionar esta carpeta:
   - `codex/fixtures/test-vault-zk`

## Config minima sugerida
1. Activar plugin core `Templates`.
2. Configurar `Template folder location` a `99-Templates`.
3. Activar plugin core `Daily notes` (opcional).
4. Abrir los archivos en `50-Bases/` para vistas de operacion.

## Nota de seguridad metodologica
- Esta vault respeta el guardrail: el agente no debe redactar contenido intelectual final en notas `permanent` sin texto explicito del usuario.
