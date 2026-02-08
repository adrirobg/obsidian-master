# Arquitectura del Ecosistema PKM Híbrido: "BrainOS"

Esta arquitectura fusiona la inmediatez de un **Plugin Nativo de Obsidian** con la potencia bruta de un **Agente IA Externo (OpenCode)**.

## 1. Visión del Ecosistema

El sistema se compone de dos hemisferios conectados:

### Hemisferio Derecho: La Interfaz (Obsidian Plugin)
Vive *dentro* de Obsidian. Su función es "sentir" y "actuar" en la UI.
*   **Nombre clave**: `brainos-obsidian-plugin`
*   **Rol**: Sensor & Actuador UI.
*   **Capacidades**:
    *   Detectar qué nota estás editando activo.
    *   Leer la selección de texto actual.
    *   Mostrar paneles laterales (Chat), modales y notificaciones.
    *   Interceptar comandos (`Ctrl+P`).
    *   Invocar al "Hemisferio Izquierdo".

### Hemisferio Izquierdo: El Cerebro (OpenCode / Servicio IA)
Vive *fuera* de Obsidian (Terminal/Background). Su función es "pensar" y "procesar".
*   **Nombre clave**: `opencode-agent`
*   **Rol**: Procesamiento Pesado & Razonamiento.
*   **Capacidades**:
    *   Ejecutar Modelos LLM (via OpenRouter).
    *   Operaciones de sistema de archivos masivas.
    *   Búsqueda semántica (RAG) sobre todo el vault.
    *   Ejecución de herramientas (python, git, etc.).

## 2. El Puente (The Bridge)

¿Cómo se comunican? Tenemos tres opciones viables:

### Opción A: Shell Exec (Directo) ⚡
El Plugin ejecuta comandos de terminal directamente.
*   `Plugin` -> `exec('opencode cmd "..."')` -> `Estándar Output` -> `Plugin`
*   **Pros**: Sencillo, sin servidores corriendo.
*   **Contras**: Bloqueante si no se maneja bien, requiere configurar el path de node/opencode en el plugin.

### Opción B: Servidor Local (Robustez) 🌐
OpenCode (o un script intermedio) corre un servidor HTTP local en el puerto `3000`.
*   `Plugin` -> `fetch('http://localhost:3000/analyze', { body: currentNote })` -> `Respuesta JSON` -> `Plugin`
*   **Pros**: Desacoplado, asíncrono, estándar web.
*   **Contras**: Tienes que tener el servidor corriendo ("encender el cerebro").

> **Decisión Recomendada**: **Opción B (Servidor Local)** para el Ecosistema completo. Es lo más escalable y permite debuggear fácilmente con Chrome DevTools (Network Tab).

## 3. Interfaces del Ecosistema (Capas de Interacción)

Para cubrir la visión de "Ecosistema Total", implementaremos tres capas de interacción:

### Capa 1: Comandos (Acción Rápida)
*   **Uso**: Tareas atómicas y repetitivas.
*   **UI**: Command Palette (`Ctrl+P`), Menú Contextual (Click Derecho).
*   **Ejemplos**: "Refinar Texto", "Generar Tags", "Traducir selección".

### Capa 2: Chat & Asistencia (Conversacional)
*   **Uso**: Exploración, dudas, brainstorming.
*   **UI**: Panel Lateral (`ItemView`), Modal Flotante.
*   **Ejemplos**: "¿Qué notas tengo sobre X?", "Ayúdame a desarrollar esta idea".

### Capa 3: Canvas & Visual (Espacial)
*   **Uso**: Conexión de conceptos, mapas mentales.
*   **UI**: Integración con JSON Canvas.
*   **Ejemplo**: "Organiza estas 5 notas en un mapa conceptual dentro del Canvas".

## 4. Principios de Diseño (User Centric)

1.  **No Intrusivo (User in Control)**:
    *   Por defecto: **Sugerir, no actuar**. El plugin muestra Diffs o Modales de confirmación.
    *   Excepción: **Workflows Aprobados**. El usuario puede marcar ciertos flujos como "Auto-run" (ej: "Siempre añadir tags automáticos al mover a /Archive").

2.  **Visibilidad Configurable**:
    *   **Foreground**: Barra de progreso para tareas que el usuario espera (ej: "Resumiendo nota").
    *   **Background**: Indicador discreto (status bar) para tareas de mantenimiento (embeddings, backups).

## 5. Flujo de Trabajo Ejemplo: "Organizar Nota"

1.  **Usuario**: Termina de escribir una nota rápida y pulsa botón "BrainOS: Organizar".
2.  **Plugin**: 
    *   Captura contenido de la nota.
    *   Envía request POST a `localhost:3000/task/organize`.
    *   Muestra estado "🧠 Pensando..." en la barra de estado.
3.  **Cerebro (Agente)**:
    *   Recibe contenido.
    *   Consulta reglas Zettelkasten y busca notas similares (RAG).
    *   Genera propuesta: "Mover a `/Conceptos`, añadir tags `#pkm`, linkear a `[[Nota A]]`".
    *   Devuelve JSON.
4.  **Plugin**:
    *   Recibe JSON.
    *   Muestra un Modal con Diff: "He pensado estos cambios, ¿Aceptas?".
    *   **Usuario**: Click "Aceptar".
    *   Plugin aplica los cambios usando la API nativa de Obsidian (`app.vault.modify`).

## 4. Stack Tecnológico del Ecosistema

*   **Plugin**: TypeScript, API de Obsidian, React (para UI compleja como el Chat).
*   **Backend**: Node.js (Express/Fastify) envolviendo a OpenCode o llamando a OpenRouter directamente.
*   **Debug**: Chrome DevTools (accediendo al plugin via `Ctrl+Shift+I`).

## 5. Hoja de Ruta Inmediata

1.  **Scaffold Plugin**: `npm init obsidian-plugin` (o similar).
2.  **Scaffold Server**: Crear un pequeño servidor Node que será el "proxy" de inteligencia.
3.  **Conexión**: Hacer que el plugin diga "Hola" al servidor y reciba "Mundo".

¿Te parece bien esta arquitectura de Ecosistema Híbrido?
