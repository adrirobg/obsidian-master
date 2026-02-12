# BrainOS Agent Methodology Lab

Espacio de trabajo para investigar y madurar la metodologia BrainOS/Zettelkasten
antes de integrarla de forma definitiva en el plugin.

## Objetivo

1. Definir y validar AGENTS + skills metodologicas.
2. Ejecutar meta-trabajo iterativo desde OpenCode sobre un vault de prueba.
3. Consolidar criterios listos para convertirse en especificaciones e issues.

## Estructura

- `vault/`: vault de prueba versionado.
- `vault/AGENTS.md`: baseline metodologico del agente.
- `vault/.opencode/skills/`: skills del archivero para iteracion.

## Carpetas del vault de prueba

- `vault/00-Inbox`
- `vault/10-Literature`
- `vault/20-Permanent`
- `vault/25-MOC`

## Marco metodológico (v1)

### 1. Los Dos Sistemas (Inboxes/Cajas)

Para gestionar eficazmente el conocimiento, el sistema se divide conceptual y estructuralmente en dos areas de trabajo distintas para separar el consumo de la creacion:

- **Caja de Referencias (Reference Slip Box):** Es el sistema externo o "gestor de referencias". Su funcion es almacenar y gestionar la informacion que proviene de fuera (las fuentes). Aqui residen las notas que rastrean el origen de la informacion (citas bibliograficas, datos del libro, autor) y las notas de literatura derivadas de ellas. El objetivo es mantener el contexto original de la informacion externa.
- **Caja de Ideas / Generador de Ideas (Idea Generator Slip Box):** Es el sistema interno o "caja de pensamiento". Aqui es donde vive tu conocimiento real. Contiene tus pensamientos propios, interpretaciones y las conexiones que realizas entre conceptos. Es el lugar exclusivo para las Notas Permanentes, donde se mezcla la informacion externa con tu pensamiento interno para generar nuevas ideas.

### 2. Tipología de Notas (Clásica)

Utilizando la terminologia clasica de Zettelkasten (sin adaptaciones moleculares), definimos los siguientes tipos:

- **Notas Efimeras (Fleeting Notes):** Son apuntes rapidos, ideas fugaces o recordatorios tomados al vuelo (en tu `Daily Note` o `Inbox`). No tienen estructura ni cuidado en el formato y estan destinadas a ser procesadas y luego eliminadas o archivadas; no forman parte permanente del sistema.
- **Notas de Literatura (Literature Notes):** Son la extraccion de informacion de las fuentes. Al leer, extraes conceptos clave y los escribes con tus propias palabras en notas breves y atomicas (un concepto por nota). Estas notas se mantienen estrictamente vinculadas a su fuente bibliografica original para no perder el contexto.
- **Notas Permanentes (Permanent Notes / Zettels):** Son la cristalizacion del conocimiento. Tomas una nota de literatura, la combinas con tus propios pensamientos y creas una nota independiente. Esta nota debe ser comprensible por si misma (descontextualizada de la fuente original) y enlazarse con otras notas permanentes existentes para formar cadenas de pensamiento.
- **Notas de Proyecto:** Son notas destinadas a la produccion final (un articulo, una tesis). Sirven para agrupar y secuenciar varias notas permanentes con un objetivo de publicacion especifico, guiando tus "insights" hacia un resultado tangible.

### 3. Flujo de las Notas: Metodología C.O.D.E.

Para operacionalizar el flujo de trabajo en Obsidian, aplicamos las cuatro etapas del metodo CODE (Capture, Organize, Distill, Express), que mapean el proceso de convertir informacion en conocimiento:

- **C (Capture - Capturar):** Es la entrada de informacion. Corresponde a la creacion de **Notas Efimeras** (en tu `Daily Note`) y **Notas de Fuente** (bibliografia). Aqui "buscas" nuevas experiencias e informacion y capturas aquello que resuena contigo (citas, ideas crudas) sin preocuparte por el formato final.
- **O (Organize - Organizar):** Es la gestion de la estructura. En lugar de organizar por temas rigidos al principio, utilizas topicos y etiquetas (`tags`) o carpetas amplias para clasificar tus fuentes en la *Caja de Referencias*. El objetivo es preparar el terreno para que las notas sean recuperables, vinculando las notas efimeras a sus fuentes bibliograficas.
- **D (Distill - Destilar):** Es el proceso critico de conversion. Revisas tus notas capturadas y extraes la esencia en **Notas de Literatura** (conceptos depurados) y luego las transformas en **Notas Permanentes**. Aqui es donde ocurre la "decontextualizacion": extraes la idea de la fuente original y la reescribes para que tenga sentido por si misma dentro de tu *Caja de Ideas*.
- **E (Express - Expresar):** Es la salida o "output". Corresponde al uso de **Notas de Proyecto**. Tomas tus notas permanentes ya procesadas y conectadas, y las ensamblas para crear trabajos tangibles (escritos, videos, publicaciones). Es el acto de "recontextualizar" tu conocimiento para compartirlo con otros.

### 4. Adaptación al Ecosistema Obsidian

Obsidian es la herramienta ideal para ejecutar este sistema porque sus funcionalidades nativas y plugins permiten "mapear" literalmente este proceso mental:

- **Enlaces (Links `[[ ]]`):** Son las sinapsis del sistema. Permiten conectar las Notas de Literatura con las Permanentes y estas entre si. Obsidian facilita esto mediante el autocompletado y los `backlinks`, permitiendo que el conocimiento crezca de forma no lineal.
- **Dataview:** Automatiza la gestion de la *Caja de Referencias*. Permite crear indices dinamicos basandose en los metadatos de las notas, eliminando el mantenimiento manual de listas.
- **Grafico (Graph View):** Permite visualizar fisicamente como tus notas (nodos) se agrupan y conectan. Esto ayuda a revelar conexiones emergentes y clusters de conocimiento no planificados.
- **Canvas:** Es el espacio de trabajo para la fase de *Expresion*. Puedes arrastrar tus Notas Permanentes a un tablero, organizarlas espacialmente y conectarlas para estructurar el borrador final antes de escribirlo.
