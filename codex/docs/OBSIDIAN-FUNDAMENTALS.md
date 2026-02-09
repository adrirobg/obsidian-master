# Obsidian Fundamentals For Agent (Borrador v0.2)

## 1) Que es Obsidian para este agente
Obsidian es un entorno local de notas Markdown. Para el agente, la unidad de trabajo es el archivo (`.md`, `.base`, `.canvas`), no una base de datos externa.

Regla clave:
- File-over-app: el estado real vive en archivos del vault.

## 2) Que es una vault
Una vault es una carpeta raiz con:
- notas Markdown (`.md`)
- configuracion local (`.obsidian/`)
- otros formatos compatibles (`.base`, `.canvas`, adjuntos)

Para este proyecto, la vault de trabajo relevante esta dentro del worktree.

## 3) Primitivas que el agente debe dominar

### 3.1 Notas Markdown (`.md`)
- Contenido principal del conocimiento.
- Soporta wikilinks `[[Nota]]`, embeds `![[Nota]]`, headings y bloques.

### 3.2 Properties / Frontmatter
- Metadatos estructurados en YAML al inicio del archivo.
- El agente usa properties para estado del flujo (`kind`, `state`, `source_ref`).

### 3.3 Links y Backlinks
- Links expresan relacion semantica entre notas.
- Backlinks ayudan a descubrir contexto y reutilizacion.
- Objetivo: conectar con criterio, no coleccionar enlaces sin uso.

### 3.4 Templates
- Plantillas para estandarizar captura y distill.
- Deben reducir friccion, no imponer rigidez.

### 3.5 Daily Notes
- Canal de captura rapida con fecha.
- Util para fleeting notes y trazabilidad temporal.

### 3.6 Bases (`.base`)
- Vistas para triage y seguimiento usando properties.
- Sirve para colas operativas y control de estado.

## 4) Modelo mental operativo
El agente trabaja sobre 4 etapas:
1. Captura
2. Procesado
3. Conexion
4. Revision y reutilizacion

Cada etapa cambia properties y, cuando corresponde, crea enlaces entre notas.

## 5) Convenciones minimas para este agente
- `kind`: `fleeting|literature|permanent|index|project`
- `state`: `captured|processed|linked|reviewed`
- `source_ref`: obligatorio cuando la nota deriva de fuente externa
- `zettel_id`: obligatorio en notas `permanent`
- `created`: fecha

## 6) Limites y seguridad
- No borrado masivo ni cambios estructurales sin preview/confirm.
- Sin dependencias de IA externa en flujo base.
- Sin recomendaciones de plugins en v0.1.
- Publicacion fuera de alcance.

## 7) Errores comunes que el agente debe evitar
- Confundir nota capturada con conocimiento validado.
- Convertir notas a permanentes sin reescritura en palabras propias.
- Medir productividad por cantidad de notas.
- Forzar reglas estrictas que bloqueen captura.

## 8) Skill mapping (Kepano)
- `obsidian-markdown`: obligatorio para notas y properties.
- `obsidian-bases`: obligatorio para vistas operativas.
- `json-canvas`: opcional.

## 9) Referencias de apoyo
- `https://help.obsidian.md/properties`
- `https://help.obsidian.md/plugins/templates`
- `https://help.obsidian.md/plugins/daily-notes`
- `https://help.obsidian.md/plugins/backlinks`
- `https://help.obsidian.md/bases`
- `https://github.com/kepano/obsidian-skills`
