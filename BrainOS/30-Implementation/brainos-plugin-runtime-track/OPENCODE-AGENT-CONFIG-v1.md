# OPENCODE-AGENT-CONFIG-v1

Estado: Draft técnico v1 (orientado a implementación e issues)  
Fuente base: `BrainOS/30-Implementation/NEXT-PHASE-BRAINOS-METHODOLOGICAL-PLAN.md`

## 1) Objetivo

Definir cómo configurar OpenCode para BrainOS en esta fase:

1. Agente único `archiver`.
2. Configuración versionada en repo/vault.
3. Routing explícito por comando desde plugin.
4. Verificación de compatibilidad en runtime (`/doc`).

## 2) Supuestos de versión y contrato

Versión objetivo inicial validada en investigación:

- OpenCode `1.1.53`

Contrato operativo esperado:

1. Servidor HTTP (`opencode serve`).
2. Mensajería por sesión en `POST /session/:id/message`.
3. Stream SSE en `GET /event`.
4. OpenAPI en `GET /doc`.
5. Health check en `GET /global/health`.
6. Lista de agentes en `GET /agent`.

Nota:

- Si la versión real difiere, BrainOS debe verificar `/doc` y degradar de forma segura.

## 3) Estructura de archivos en repo

Archivos versionados recomendados:

1. `.opencode/opencode.jsonc`
2. `.opencode/agents/archiver.md`
3. `.opencode/skills/brainos-inbox-triage/SKILL.md`
4. `.opencode/skills/brainos-zk-organization/SKILL.md`
5. `.opencode/skills/brainos-permanent-candidate/SKILL.md`
6. `.opencode/skills/brainos-link-suggester/SKILL.md`

## 4) Configuración base (`opencode.jsonc`)

Ejemplo de baseline:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "archiver",
  "server": {
    "port": 4096,
    "hostname": "127.0.0.1",
    "mdns": false,
    "cors": ["app://obsidian.md"]
  },
  "agent": {
    "archiver": {
      "mode": "primary",
      "description": "BrainOS archiver for Zettelkasten classification and proposal generation",
      "prompt": "{file:.opencode/agents/archiver.md}",
      "temperature": 0.1,
      "permission": {
        "edit": "deny",
        "bash": "deny",
        "webfetch": "deny"
      }
    }
  }
}
```

Reglas:

1. Aunque exista `default_agent`, el plugin debe enviar `agent` explícito por request.
2. `permission` en deny para herramientas mutables en esta fase.
3. No introducir configuración de multi-agente aún.

## 5) Prompt de agente (`archiver.md`)

El prompt debe:

1. Aplicar metodología BrainOS/Zettelkasten (tipos y decisiones cerradas).
2. Producir solo salida JSON con schema `brainos.archiver.v1`.
3. Respetar guardrails:
- no auto-delete inbox,
- no cambios sin confirmación,
- no promoción irreversible automática.
4. Orquestar skills metodológicas definidas en repo.

## 6) Routing de comandos en plugin

Política cerrada:

1. `Process current note` -> `agent: "archiver"`
2. `Process Inbox Batch` -> `agent: "archiver"`

Estrategia:

1. Map de comando->agente centralizado en plugin.
2. Soporte futuro de otros agentes sin romper comandos actuales.

## 7) Contrato HTTP + SSE (plugin-runtime)

### 7.1 Flujo mínimo por nota

1. `POST /session` (crear sesión con guardrails).
2. `POST /session/:id/message` con body que incluye:
- `agent`,
- `parts`,
- opcionalmente `model`, `noReply`, etc.
3. `GET /event` para stream global.
4. Filtro client-side por `sessionID`.

### 7.2 Compatibilidad y fallback

1. Si `POST /session/:id/message` no existe en `/doc`, abortar modo metodológico y reportar incompatibilidad.
2. Si `GET /event` no existe, abortar con error explícito.
3. No aplicar cambios cuando falle validación de contrato runtime.

## 8) Arranque seguro y checks previos

Antes de habilitar procesamiento:

1. `GET /global/health` debe responder `200`.
2. `GET /doc` debe incluir endpoints requeridos.
3. `GET /agent` debe contener `archiver`.

Si falla alguno:

1. Mostrar error accionable en Obsidian.
2. No iniciar flujo de aplicación.

## 9) Seguridad y operación

1. Auth opcional server-side:
- `OPENCODE_SERVER_PASSWORD` (y opcional username).
2. CORS mínimo necesario para Obsidian desktop:
- `app://obsidian.md`.
3. No exponer host público por defecto (`127.0.0.1`).

## 10) Ejemplos operativos

Inicio local:

```bash
opencode serve --hostname 127.0.0.1 --port 4096 --cors app://obsidian.md
```

Con auth:

```bash
OPENCODE_SERVER_PASSWORD=secret opencode serve --hostname 127.0.0.1 --port 4096 --cors app://obsidian.md
```

Crear sesión:

```bash
curl -X POST http://127.0.0.1:4096/session \
  -H "Content-Type: application/json" \
  -d '{"title":"BrainOS Archiver Session"}'
```

Enviar mensaje con agente explícito:

```bash
curl -X POST http://127.0.0.1:4096/session/<SESSION_ID>/message \
  -H "Content-Type: application/json" \
  -d '{"agent":"archiver","parts":[{"type":"text","text":"..."}]}'
```

## 11) Criterios de aceptación del documento (para issue)

1. Config versionada en repo con agente `archiver`.
2. Plugin enruta explícitamente por `agent`.
3. Startup checks bloquean procesamiento si contrato runtime no cumple.
4. Guía operativa reproducible para entorno local y con auth.

## 12) Referencias

1. OpenCode server docs: https://opencode.ai/docs/server/
2. OpenCode config docs: https://opencode.ai/docs/config/
3. OpenCode agents docs: https://opencode.ai/docs/agents/
4. OpenCode server source doc: https://github.com/anomalyco/opencode/blob/dev/packages/web/src/content/docs/server.mdx
5. `BrainOS/30-Implementation/NEXT-PHASE-BRAINOS-METHODOLOGICAL-PLAN.md`
