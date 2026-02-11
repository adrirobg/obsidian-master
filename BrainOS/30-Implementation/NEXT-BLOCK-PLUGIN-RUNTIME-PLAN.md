# PR-05 / Issue #22 - Validacion final y release readiness

Estado: listo para ejecucion reproducible por tercera persona  
Scope: cierre de fase 2 para runtime plugin (Flujo A + Flujo B)

## 1) Objetivo

Cerrar el bloque con validacion tecnica y metodologica reproducible, dejando:

1. Baseline automatica ejecutable.
2. E2E manual en Obsidian real (Flujo A y Flujo B) con evidencia.
3. Guardrails metodologicos evaluables con criterio pass/fail.
4. Criterio de decision release readiness (GO/NO-GO).

## 2) Scope y non-goals

### Scope

- Validar comandos y flujos implementados en `obsidian-plugin-scaffold`.
- Consolidar runbook/checklist para ejecucion por supervisor o tercero.
- Registrar resultados y evidencia de forma auditable.

### Non-goals

- No Canvas runtime en este bloque.
- No cambios de arquitectura fuera de MVP.
- No reemplazar HTTP+SSE ni estado in-memory del MVP.

## 3) Guardrails canonicos obligatorios

Referencias canonicamente vinculantes:

- `BrainOS/00-Meta/CANONICAL-SOURCE-OF-TRUTH-v0.1.md`
- `BrainOS/10-Technical-Architecture/TECHNICAL-REALTIME.md`
- `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-001-Communication-Protocol.md`
- `BrainOS/10-Technical-Architecture/01-Core-Architecture/ADR-003-Memory-Persistence.md`

Reglas no negociables en validacion:

1. Transporte MVP: HTTP + SSE.
2. Estado de sesion: in-memory.
3. Control humano obligatorio para aplicar cambios sensibles.
4. No auto-delete del inbox.
5. Sesiones runtime con permisos de herramientas mutables en `deny` (`edit`, `bash`, `webfetch`) para evitar escritura indirecta fuera del modal de revision.

## 4) Baseline automatica obligatoria

Directorio:

```bash
cd BrainOS/30-Implementation/obsidian-plugin-scaffold
```

Comandos (orden recomendado):

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Criterio pass:

- Todos los comandos finalizan con exit code `0`.
- Sin errores de lint/typecheck/tests/build.

Criterio fail:

- Cualquier comando falla o requiere bypass manual.

## 5) Setup para E2E manual en Obsidian real

Precondiciones minimas:

1. Obsidian Desktop >= `1.11.4`.
2. `opencode serve` corriendo y accesible desde Obsidian (por defecto `http://localhost:4096`).
   Comando recomendado para evitar bloqueo CORS en `app://obsidian.md`:
   `opencode serve --hostname 127.0.0.1 --port 4096 --cors app://obsidian.md`
   Verificar contrato runtime activo:
   `curl -sS http://127.0.0.1:4096/doc | jq -r '.paths | keys[]' | rg '/session/\\{sessionID\\}/message'`
3. Plugin compilado (`main.js`, `manifest.json`, `styles.css`) en:
   `<Vault>/.obsidian/plugins/brainos-runtime-scaffold/`
4. Plugin activado en `Settings -> Community plugins`.
5. Vault de pruebas con:
   - al menos 1 nota Markdown activa para Flujo A.
   - carpeta `00-Inbox` con >= 3 notas Markdown no vacias para Flujo B.

## 6) Flujo A (Procesar nota actual) - runbook

Comando Obsidian:

- `BrainOS: Procesar nota actual`

Resultado esperado:

1. Si no hay nota activa markdown: aviso de precondicion y no escritura.
2. Si hay nota valida: procesamiento incremental + modal de revision.
3. Sin `Aceptar`: no se modifica la nota.
4. Con `Aceptar`: se aplica propuesta en la nota objetivo.
5. Se registra decision (`accepted`/`rejected`) en estado de sesion.

Evidencia minima:

- Captura del estado previo de la nota.
- Captura del modal de revision.
- Captura del estado final:
  - rechazo: contenido igual.
  - aceptacion: contenido actualizado.

## 7) Flujo B (Process Inbox Batch) - runbook

Comando Obsidian:

- `BrainOS: Process Inbox Batch`

Resultado esperado:

1. Toma hasta `N` notas de `00-Inbox` (oldest-first, `batchSize` normalizado).
2. Procesa secuencialmente item por item.
3. Exige decision explicita por item (`accept` o `reject`).
4. Cierra con resumen (`processed`, `accepted`, `rejected`, `errors`).
5. No elimina automaticamente notas del inbox.

Evidencia minima:

- Captura de configuracion (`batchSize`) y lista de notas candidatas.
- Capturas de al menos 3 iteraciones (X/N) con decision por item.
- Captura del aviso final de resumen.

## 8) Guardrails metodologicos (nominal + error) con pass/fail

### Escenarios nominales

1. Flujo A con `accepted`:
   - Pass: hay aplicacion de cambio solo tras confirmacion.
   - Fail: se escribe sin confirmacion explicita.
2. Flujo A con `rejected`:
   - Pass: contenido original intacto.
   - Fail: mutacion de archivo pese al rechazo.
3. Flujo B con lote de 3:
   - Pass: progreso secuencial visible y decision por item.
   - Fail: salto de items o ausencia de decision explicita.

### Escenarios de error

1. Runtime caido/desconectado:
   - Pass: error controlado, sin escritura.
   - Fail: bloqueo sin feedback o cambio parcial no confirmado.
2. Nota vacia o no markdown:
   - Pass: precondicion rechaza ejecucion sin escribir.
   - Fail: intenta procesar contexto invalido.
3. Inbox con items vacios:
   - Pass: los vacios se omiten con aviso, sin crash.
   - Fail: falla total del lote por items vacios.

## 9) Criterio de release readiness

Decision `GO` solo si se cumplen todas:

1. Baseline automatica completa en verde.
2. Checklist E2E de Flujo A y Flujo B completado con evidencia.
3. Guardrails nominales y de error en pass.
4. Sin hallazgos bloqueantes de seguridad/control de usuario.

Decision `NO-GO` si ocurre al menos una:

1. Escritura sin confirmacion explicita.
2. Auto-delete del inbox.
3. Ruptura del contrato HTTP+SSE o de limites in-memory en MVP.
4. Fallas reproducibles sin workaround documentado.

## 10) Riesgos finales y follow-ups

1. E2E manual depende de entorno GUI real de Obsidian.
   - Follow-up: ejecutar checklist en vault real y adjuntar reporte.
2. Cambios de schema/eventos runtime aguas arriba.
   - Follow-up: mantener adaptador de eventos y repetir smoke en cada release.
3. Validacion metodologica parcial si falta evidencia de uso real.
   - Follow-up: completar reporte manual con capturas y decision final GO/NO-GO.
4. Latencia alta observada en procesamiento runtime durante Flujo B (inbox batch de 3 notas).
   - Evidencia: `POST /session/{id}/message` con `durationMs: 33501` durante validacion manual del lote.
   - Follow-up: medir p50/p95 por flujo y ajustar modelo/configuracion para reducir tiempo por nota.

## 11) Referencias oficiales y de proyecto

- Obsidian build plugin: https://docs.obsidian.md/plugins/Plugins/Getting+started/Build+a+plugin
- Obsidian release submission: https://docs.obsidian.md/plugins/Plugins/Releasing/Submit+your+plugin
- Obsidian secret storage: https://docs.obsidian.md/plugins/guides/secret-storage
- OpenCode server docs: https://opencode.ai/docs/server/
- OpenCode SDK docs: https://opencode.ai/docs/sdk/
