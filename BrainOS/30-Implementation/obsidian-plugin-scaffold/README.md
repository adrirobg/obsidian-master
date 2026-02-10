# BrainOS Obsidian Plugin Scaffold (Issue #18)

Scaffold ejecutable de plugin Obsidian basado en [Build a plugin](https://docs.obsidian.md/plugins/Plugins/Getting+started/Build+a+plugin) y `obsidian-sample-plugin`, adaptado al contrato runtime MVP BrainOS:

- Lifecycle `onload` / `onunload` con cleanup determinístico.
- Settings persistentes en `data.json` usando `loadData`/`saveData`:
  - `runtimeBaseUrl`
  - `batchSize`
  - `auth.username` + `auth.passwordSecretId` (el secret real se guarda en `SecretStorage`, no en `data.json`)
- Comando `BrainOS: Runtime Health Check` que consulta el runtime real (`GET /global/health`) vía cliente HTTP MVP embebido (`src/runtime/*`, mismo contrato del módulo `mvp-http-client`).

Requisito de versión:
- `minAppVersion: 1.11.4` (usa `SecretStorage`/`SecretComponent`).

## Build reproducible

```bash
cd BrainOS/30-Implementation/obsidian-plugin-scaffold
npm ci
npm run dev
npm run typecheck
npm run build
```

Artefactos requeridos para cargar en Obsidian:

- `main.js`
- `manifest.json`
- `styles.css`

## Uso rápido en Obsidian

1. Copia esta carpeta a `<Vault>/.obsidian/plugins/brainos-runtime-scaffold`.
2. Asegúrate de que la carpeta final coincide con `manifest.json -> id` (`brainos-runtime-scaffold`).
3. Ejecuta `npm ci` y `npm run build` dentro de la carpeta del plugin.
4. Reinicia Obsidian o recarga plugins.
5. Activa el plugin en Obsidian.
6. Configura `Runtime base URL` (por defecto `http://localhost:4096`).
7. En settings de auth, selecciona/crea el secreto de password con `SecretComponent`.
8. Ejecuta el comando `BrainOS: Runtime Health Check`.
