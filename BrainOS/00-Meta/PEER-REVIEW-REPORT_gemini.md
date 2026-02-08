# Revisión BrainOS - Antigravity (AI Assistant)

## 1. Resumen Ejecutivo
BrainOS presenta una visión ambiciosa y técnicamente sólida para transformar Obsidian en un entorno de "Pair Programming para el Pensamiento". La arquitectura híbrida (Plugin UI + OpenCode Brain) es la decisión correcta para evitar cargar el proceso principal de Obsidian. La documentación demuestra una madurez sorprendente en la metodología Zettelkasten, aunque detecto riesgo de sobre-ingeniería en la fase inicial, especialmente en la orquestación multi-agente y la sincronización bidireccional en tiempo real.

## 2. Fortalezas Principales
1.  **Filosofía "Human-in-the-loop"**: El diseño respeta explícitamente que la IA no debe reemplazar el pensamiento, sino aumentarlo. Los modos "Sugerencia" y "Ghost Text" son implementaciones perfectas de esta filosofía.
2.  **Arquitectura Desacoplada**: Separar el "Cerebro" (OpenCode) de la "Interfaz" (Obsidian Plugin) vía WebSocket es brillante. Permite que el procesamiento pesado no congele la UI y facilita el BYOK (Bring Your Own Key/Model).
3.  **Sistema de Inbox Estructurado**: El algoritmo de clasificación y los workflows por tiempo (2/10/30 min) atacan el dolor real del usuario (parálisis por acumulación) con una solución pragmática.

## 3. Problemas Críticos (Bloqueantes)
1.  **Problema**: Indecisión en el Protocolo de Comunicación (ADR-001).
    **Impacto**: Alto.
    **Sugerencia**: `TECHNICAL-REALTIME.md` asume WebSocket, pero `ADR-001` duda con MCP. **Decisión recomendada**: Usa **WebSocket** directo para el MVP. MCP añade una capa de complejidad abstracción que no necesitas para un "Single Tenant" PoC. Migra a MCP solo si decides abrir el sistema a clientes de terceros (ej. Claude Desktop). Para latencia <200ms en Canvas, WebSocket crudo es superior.

2.  **Problema**: Complejidad de Sincronización de Estado (Race Conditions).
    **Impacto**: Alto.
    **Sugerencia**: La estrategia "User wins always" es necesaria pero insuficiente para el modo Canvas colaborativo. Si el agente reorganiza 50 nodos mientras el usuario mueve 1, el estado puede corromperse visualmente. Necesitas un sistema de "Bloqueo optimista" de nodos o versionado de estado (vector clocks simplificados) en el `SharedState`.

3.  **Problema**: Inconsistencia en Persistencia (ADR-003).
    **Impacto**: Medio.
    **Sugerencia**: SQLite + JSON es viable, pero tener "cache" en JSON y "sesiones" en SQLite duplica lógica de acceso. Unifica todo en **SQLite** desde el día 1. JSON solo para configuración estática. SQLite es suficientemente rápido para caché y simplifica los backups.

## 4. Problemas Menores (Mejoras)
1.  **Exceso de Agentes en Fase 1**: 6 agentes (Organizador, Archivero, Conector, Investigador, Crítico, Síntesis) es demasiado para gestionar al inicio. El usuario se confundirá. Recomiendo colapsar en 3: "Asistente" (Organizador/Archivero), "Compañero" (Conector/Crítico) y "Investigador" (Deep work).
2.  **Dashboard de Inbox**: La UI propuesta es densa. Un usuario con 50 items en inbox se sentirá abrumado por las estadísticas. Simplificar a "Siguiente Acción" vs "Estadísticas".
3.  **Overhead de Embeddings**: Aunque el ADR-002 propone "Auto-activación", la implementación de un Vector Store local es pesada. Considera usar simplemente búsqueda por keywords + reranking con LLM pequeño para el MVP, posponiendo embeddings reales.

## 5. Preguntas Abiertas
1.  **Gestión de Costos**: Si el usuario conecta GPT-4o o Claude 3.5 Sonnet, el "loop" continuo de análisis en background (monitor de canvas, inline suggestions) disparará el consumo de tokens. ¿Cómo se controla el "presupuesto" diario?
2.  **Privacidad vs Funcionalidad**: Si uso Ollama (local) para privacidad, ¿perderé la capacidad de los agentes más inteligentes (Researcher/Debate) que requieren modelos grandes? El sistema debe degradarse graciosamente.

## 6. Recomendaciones Prioritarias

### Inmediato (Antes de empezar)
-   **Cerrar ADR-001**: Confirmar WebSocket para MVP.
-   **Definir "Presupuesto de Tokens"**: Diseñar el sistema para que no analice *cada* pulsación de tecla, sino que use *debouncing* agresivo (ej. analizar solo tras 2s de inactividad o explícitamente).

### Corto plazo (Primeras 2 semanas)
-   **Prototipo "Ghost Node"**: Crear la prueba de concepto técnica de dibujar un nodo fantasma en Obsidian Canvas vía WebSocket. Si esto no se siente "nativo" y fluido, la propuesta de valor principal (Visual Collaboration) falla.
-   **Skill "Organizador" Básico**: Solo clasificación de Inbox. Fleeting -> Literature.

### Largo plazo
-   **Migración a MCP**: Una vez estable, envolver el servidor WebSocket en un servidor MCP para permitir que otros clientes de IA accedan al Vault.

## 7. Features Sugeridas
1.  **"Mode Switcher" Físico/Virtual**: Un botón visible que cambie explícitamente entre "Modo Silencioso" (cero IA), "Modo Asistido" (sugerencias) y "Modo Pair" (chat activo). El usuario necesita sentir que puede "apagar" al otro cerebro.

## 8. Calificación General
-   **Viabilidad técnica**: 8/10 (El reto es la latencia y sync, no la IA)
-   **Alineación Zettelkasten**: 10/10 (Excelente comprensión metodológica)
-   **Experiencia de usuario**: 9/10 (El concepto de UI híbrida es muy potente)
-   **Viabilidad de implementación**: 7/10 (Riesgo de scope creep alto)
-   **TOTAL**: 8.5/10

## 9. ¿Recomendarías proceder?
[x] Sí, con los cambios sugeridos

## 10. Comentarios Adicionales
El proyecto tiene un "product-market fit" personal muy alto. La clave del éxito no será qué tan lista es la IA, sino qué tan **invisible** es la integración. Si BrainOS se siente como "otra ventana de chat", fallará. Si se siente como "mi editor tiene buenas ideas", triunfará. Céntrate obsesivamente en la **latencia** y la **UX no intrusiva** (Ghost text/nodes).
