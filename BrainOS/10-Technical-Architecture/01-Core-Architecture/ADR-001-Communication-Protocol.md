# ADR-001: Protocolo de Comunicación Cliente-Servidor

## Estado
**PENDIENTE DE DECISIÓN**

Fecha: 2026-02-07
Autor: BrainOS Technical Team

## Contexto

BrainOS necesita un protocolo de comunicación entre:
- Clientes (Obsidian Plugin, CLI, futura Web UI)
- Servidor Core (Orchestrator + Agentes)

El protocolo debe soportar:
- Request/response tradicional
- Streaming para respuestas largas (LLM)
- Eventos en tiempo real (notificaciones)
- Descubrimiento de capacidades
- Multi-cliente simultáneo

## Opciones Evaluadas

### Opción A: Model Context Protocol (MCP)

**Descripción**: Protocolo abierto de Anthropic para conectar LLMs con sistemas externos.

**Pros**:
- ✅ Estándar emergente (5,500+ servidores)
- ✅ Adoptado por OpenAI, Anthropic, Google
- ✅ Descubrimiento automático de tools/resources
- ✅ Stateful por diseño
- ✅ Comunicación bidireccional
- ✅ Ecosistema creciente (incluye obsidian-mcp-server existente)

**Contras**:
- ❌ Nuevo, puede cambiar
- ❌ Complejidad inicial
- ❌ Tooling aún madurando
- ❌ No está diseñado específicamente para plugins Obsidian

**Caso de uso ideal**: Integración con múltiples clientes LLM (Claude Desktop, Cursor, etc.)

---

### Opción B: gRPC + WebSocket

**Descripción**: Protocolo binario de alto rendimiento + WebSocket para realtime.

**Pros**:
- ✅ Alto rendimiento
- ✅ Tipado fuerte con Protocol Buffers
- ✅ Streaming bidireccional nativo
- ✅ Code generation automático
- ✅ Maduro y probado

**Contras**:
- ❌ Más complejo de implementar
- ❌ Requiere proxy HTTP/2 para navegadores
- ❌ No es estándar en ecosistema LLM
- ❌ Menor interoperabilidad

**Caso de uso ideal**: Sistema cerrado donde controlamos todo el stack

---

### Opción C: REST + Server-Sent Events (SSE)

**Descripción**: HTTP tradicional con SSE para eventos server→client.

**Pros**:
- ✅ Universal, todo lo soporta
- ✅ Simple de implementar
- ✅ Debugging fácil (curl, Postman)
- ✅ Múltiples bibliotecas disponibles

**Contras**:
- ❌ Sin descubrimiento automático
- ❌ Overhead HTTP para cada request
- ❌ SSE unidireccional (cliente→servidor necesita polling o WebSocket)
- ❌ Sin estandarización de métodos

**Caso de uso ideal**: Rapidez de implementación, compatibilidad máxima

---

### Opción D: GraphQL + Subscriptions

**Descripción**: GraphQL con subscriptions para realtime.

**Pros**:
- ✅ Flexible, cliente pide lo que necesita
- ✅ Tipado fuerte
- ✅ Subscriptions para realtime
- ✅ Buen ecosistema tooling

**Contras**:
- ❌ Overhead para casos simples
- ❌ Curva de aprendizaje
- ❌ No es estándar en LLM/AI
- ❌ Complejidad innecesaria para nuestro caso

**Caso de uso ideal**: APIs públicas complejas con múltiples consumers

---

## Análisis Comparativo

| Criterio | MCP | gRPC | REST+SSE | GraphQL |
|----------|-----|------|----------|---------|
| **Estandarización LLM** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| **Facilidad implementación** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Realtime** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Interoperabilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Madurez** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Ecosistema Obsidian** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

## Escenarios de Uso BrainOS

### Escenario 1: Plugin Obsidian Simple
Usuario escribe nota → Plugin envía a servidor → Servidor responde sugerencias

**Mejor opción**: REST (simple, directo) o MCP (si queremos estandarizar)

### Escenario 2: Chat Multi-Agente
Usuario abre chat → Múltiples interacciones con streaming → Estado persistente

**Mejor opción**: MCP (stateful) o WebSocket

### Escenario 3: Integración con Claude Desktop
Usuario quiere usar BrainOS desde Claude Desktop además de Obsidian

**Mejor opción**: MCP (nativo en Claude Desktop)

### Escenario 4: Automatización Autónoma
Agentes trabajan en background sin interacción usuario

**Mejor opción**: Cualquiera (no hay UI involucrada)

## Recomendación Preliminar

**Opción recomendada: MCP con fallback REST**

### Justificación:

1. **Estratégico**: MCP se está convirtiendo en estándar de facto. Apostar por él nos posiciona para el futuro.

2. **Multi-cliente**: Si implementamos MCP, BrainOS funciona con:
   - Obsidian Plugin (nuestro cliente)
   - Claude Desktop (sin trabajo adicional)
   - Cursor
   - Cualquier cliente MCP-compatible

3. **Obsidian ecosystem**: Ya existen servidores MCP para Obsidian que podemos usar como referencia.

4. **Complexidad manejable**: Aunque es nuevo, FastMCP (Python) y SDK oficial (TypeScript) hacen la implementación accesible.

### Implementación Híbrida Propuesta

```
Core expone:
├── MCP Server (protocolo principal)
│   └── tools: brainos_analyze_note, brainos_chat, etc.
├── REST API (fallback simple)
│   └── POST /analyze, POST /chat
└── WebSocket (opcional, para streaming UI)
```

De esta forma:
- Clientes MCP usan MCP (recomendado)
- Clientes simples pueden usar REST
- Streaming complejo puede usar WebSocket directo

## Próximos Pasos

1. [ ] Crear PoC de servidor MCP básico
2. [ ] Evaluar integración con obsidian-mcp-server existente
3. [ ] Definir schema de tools/resources para BrainOS
4. [ ] Implementar cliente MCP en plugin Obsidian
5. [ ] Benchmark vs REST para métricas de performance

## Notas

- La decisión no es irreversible, podemos soportar múltiples protocolos
- Importante: mantener abstracción en la capa de transporte
- Si MCP falla o es muy complejo, REST es nuestro plan B sólido

---

**Decision**: PENDIENTE - Awaiting PoC results
**Next Review**: After MCP PoC completion (est. 1 week)
