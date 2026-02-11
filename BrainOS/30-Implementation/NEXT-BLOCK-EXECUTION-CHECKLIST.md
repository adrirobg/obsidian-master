# Issue #22 - Checklist ejecutable de validacion final

Usar junto con:

- `BrainOS/30-Implementation/NEXT-BLOCK-PLUGIN-RUNTIME-PLAN.md`
- `BrainOS/30-Implementation/NEXT-BLOCK-MANUAL-REPORT-TEMPLATE.md`

---

## A) Preflight tecnico

- [ ] En rama valida para ejecucion: rama del issue (pre-merge) o rama de integracion objetivo (post-merge, por ejemplo `main`).
- [ ] Rama sincronizada con su target (`git fetch --all --prune` + update segun flujo: ff-only/rebase/merge).
- [ ] Arbol de trabajo limpio antes de validar (`git status` sin conflictos ni cambios no relacionados).
- [ ] Preflight worker OK (si existe `.codex-issue-context.md`):
  `bash scripts/preflight_worker_issue_dev_pr.sh .codex-issue-context.md`

## B) Baseline automatica

Directorio:
`BrainOS/30-Implementation/obsidian-plugin-scaffold`

- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`

Pass/fail:

- [ ] PASS: todos los comandos en exit code `0`
- [ ] FAIL: al menos un comando falla (documentar output y bloquear GO)

## C) Setup E2E manual en vault real

- [ ] Obsidian Desktop >= `1.11.4`
- [ ] Runtime activo y con CORS para Obsidian:
  `opencode serve --hostname 127.0.0.1 --port 4096 --cors app://obsidian.md`
- [ ] Contrato runtime confirmado en `/doc`:
  `/session/{sessionID}/message` disponible
- [ ] Plugin habilitado: `brainos-runtime-scaffold`
- [ ] Vault con nota de prueba para Flujo A
- [ ] Vault con carpeta `00-Inbox` y >= 3 notas no vacias para Flujo B

## D) Flujo A - Procesar nota actual

Comando:
`BrainOS: Procesar nota actual`

### Nominal (aceptacion)

- [ ] Abrir nota markdown no vacia como nota activa.
- [ ] Ejecutar comando.
- [ ] Ver propuesta en modal de revision.
- [ ] Seleccionar `Aceptar`.
- [ ] Verificar nota final modificada.
- [ ] Capturar evidencia:
  - [ ] screenshot nota antes
  - [ ] screenshot modal
  - [ ] screenshot nota despues

### Nominal (rechazo)

- [ ] Repetir sobre nota markdown no vacia.
- [ ] Seleccionar `Rechazar`.
- [ ] Verificar que el contenido queda intacto.
- [ ] Capturar evidencia:
  - [ ] screenshot modal con rechazo
  - [ ] diff o comparacion sin cambios

### Error path

- [ ] Sin nota activa markdown: el comando muestra aviso y no escribe.
- [ ] Runtime caido/desconectado: error controlado, sin escritura.
- [ ] Capturas de evidencia para ambos casos.

## E) Flujo B - Process Inbox Batch

Comando:
`BrainOS: Process Inbox Batch`

### Nominal

- [ ] Configurar `batchSize` (recomendado: `3`).
- [ ] Confirmar >= 3 notas no vacias en `00-Inbox`.
- [ ] Ejecutar comando y observar progreso secuencial por item.
- [ ] Tomar decision por item (`accept` o `reject`).
- [ ] Verificar resumen final (`processed/accepted/rejected/errors`).
- [ ] Verificar que no se elimina ninguna nota automaticamente.
- [ ] Capturar evidencia:
  - [ ] screenshot progreso item 1/N
  - [ ] screenshot progreso item 2/N
  - [ ] screenshot progreso item 3/N
  - [ ] screenshot resumen final

### Error path

- [ ] Inbox vacio: aviso controlado, sin crash.
- [ ] Inbox con items vacios: omision controlada con aviso.
- [ ] Runtime desconectado durante lote: error por item o falla controlada del lote, sin escritura automatica no confirmada.
- [ ] Capturas de evidencia para casos ejecutados.

## F) Guardrails metodologicos (nominal + error)

- [ ] No hay escritura sin confirmacion explicita.
- [ ] No auto-delete del inbox.
- [ ] Falla de runtime/red degrada en modo seguro.
- [ ] Se preserva control humano en cada decision relevante.
- [ ] Sesion runtime en modo seguro (permisos `edit`, `bash`, `webfetch` en `deny`).
- [ ] No se introduce persistencia conversacional durable en critical path.
- [ ] Se mantiene transporte HTTP+SSE.

## G) Release readiness gate (GO/NO-GO)

- [ ] GO candidato: baseline automatica OK + Flujo A/B con evidencia + guardrails en PASS.
- [ ] NO-GO: cualquier violacion de guardrails o fallo tecnico bloqueante.
- [ ] Reporte manual completado y adjuntado.
