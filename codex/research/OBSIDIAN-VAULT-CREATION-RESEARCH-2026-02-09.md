# Obsidian Vault Creation Research (2026-02-09)

## Objetivo
Validar como crear y abrir una vault de Obsidian usando documentacion oficial actual, para preparar un entorno de prueba del Vault Agent Core.

## Fuentes oficiales consultadas
- https://help.obsidian.md/getting-started/create-a-vault
- https://help.obsidian.md/getting-started/open-a-vault
- https://help.obsidian.md/getting-started/data-storage
- https://help.obsidian.md/getting-started

Fecha de consulta: 2026-02-09.

## Hallazgos clave
1. Crear vault nueva:
   - En Obsidian, usar `Manage vaults`.
   - Elegir `Create new vault`.
   - Asignar nombre y carpeta destino.
2. Abrir vault existente:
   - En `Manage vaults`, usar `Open folder as vault`.
   - Seleccionar carpeta que contiene notas Markdown.
3. Almacenamiento y riesgo:
   - La vault es una carpeta local con archivos Markdown y carpeta `.obsidian`.
   - Evitar carpetas de sistema o ubicaciones propensas a conflictos de sync para reducir riesgo de corrupcion/perdida.
4. Implicacion para pruebas:
   - Conviene separar vault de test de vault principal para validar flujos y automatizaciones sin riesgo operativo.

## Decision aplicada en esta fase
Se crea una vault de prueba aislada en:
- `codex/fixtures/test-vault-zk`

Con esto se puede evaluar triage, metadatos, enlaces e higiene sin tocar la vault productiva.
