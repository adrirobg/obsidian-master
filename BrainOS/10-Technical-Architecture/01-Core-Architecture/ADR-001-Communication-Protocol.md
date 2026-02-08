# ADR-001: Protocolo de Comunicación Cliente-Servidor

## Estado
**DECIDIDO - HTTP + SSE**

Fecha: 2026-02-08  
Autor: BrainOS Technical Team  
Última actualización: Post-validación OpenCode

## Contexto

BrainOS necesita un protocolo de comunicación entre:
- Cliente: Obsidian Plugin (TypeScript)
- Servidor: OpenCode ejecutándose en modo servidor

**Validación realizada**: OpenCode SÍ soporta modo servidor (`opencode serve`) con HTTP API completa y Server-Sent Events (SSE) para comunicación en tiempo real.

## Decisión

**Protocolo para MVP: HTTP + Server-Sent Events (SSE)**

### Justificación

1. **Validado técnicamente**: OpenCode expone servidor HTTP en `localhost:4096` con:
   - API REST completa (OpenAPI 3.1)
   - Server-Sent Events para streaming
   - SDK oficial TypeScript (`@opencode-ai/sdk`)

2. **Simplicidad**: Para MVP single-tenant, HTTP+SSE es suficiente y más simple que alternativas

3. **No necesitamos MCP todavía**: Aunque MCP es el estándar emergente, añade complejidad innecesaria para el MVP. Se considerará para v2.0 si se requiere interoperabilidad con Claude Desktop, Cursor, etc.

## Arquitectura de Comunicación

```
┌─────────────────┐      HTTP Request       ┌─────────────────┐
│  Obsidian       │  ───────────────────►   │   OpenCode      │
│  Plugin         │                         │   Server        │
│                 │      SSE Stream         │   (:4096)       │
│                 │  ◄───────────────────   │                 │
└─────────────────┘                         └─────────────────┘
       │                                              │
       │         @opencode-ai/sdk                     │
       │         (TypeScript client)                  │
       │                                              │
       └──────────────────────────────────────────────┘
```

### Flujo de Comunicación

**Plugin → OpenCode (HTTP Request)**:
```typescript
import { createOpencodeClient } from "@opencode-ai/sdk"

const client = createOpencodeClient({
  baseUrl: "http://localhost:4096"
})

// Enviar solicitud
const response = await client.session.prompt({
  path: { id: sessionId },
  body: {
    parts: [{ type: "text", text: "Organiza esta nota..." }]
  }
})
```

**OpenCode → Plugin (Server-Sent Events)**:
```typescript
// Escuchar eventos del servidor
const events = await client.global.event()
for await (const event of events) {
  console.log("Evento recibido:", event.type, event.data)
  // Actualizar UI de Obsidian
}
```

## Detalles Técnicos OpenCode

### Comando de inicio
```bash
opencode serve [--port 4096] [--hostname 127.0.0.1] [--cors http://localhost:8080]
```

### Endpoints relevantes

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/global/health` | GET | Health check |
| `/global/event` | GET | SSE - Eventos globales |
| `/session` | POST | Crear sesión |
| `/session/{id}/prompt` | POST | Enviar prompt |
| `/find?pattern=` | GET | Buscar en archivos |
| `/doc` | GET | OpenAPI spec |

### Autenticación (opcional para MVP)
```bash
OPENCODE_SERVER_PASSWORD=secret opencode serve
```

## MCP: Posponido para Post-MVP

**Decisión**: No implementar MCP en MVP

**Razón**: 
- Añade capa de abstracción innecesaria para single tenant
- Complejidad adicional sin beneficio inmediato
- OpenCode ya expone HTTP API suficiente

**Cuándo reconsiderar**:
- v2.0 si se quiere soporte para Claude Desktop nativo
- Si se requiere interoperabilidad con otros clientes MCP
- Cuando el sistema sea estable y maduro

## Alternativas Descartadas

| Opción | Razón de descarte |
|--------|-------------------|
| **MCP** | Overkill para MVP, complejidad innecesaria |
| **gRPC** | Requiere HTTP/2, más complejo, sin beneficio claro |
| **WebSocket puro** | OpenCode usa SSE, WebSocket solo para PTY |
| **GraphQL** | Overhead innecesario, sin casos de uso complejos |

## Ventajas de HTTP + SSE

✅ **Validado**: OpenCode lo soporta nativamente  
✅ **SDK oficial**: Type-safe client disponible  
✅ **Simple**: Menos código, menos bugs  
✅ **Debuggable**: curl, Postman, navegador  
✅ **Bidireccional**: Requests HTTP + Events SSE  
✅ **Escalable**: Funciona para 1 usuario o 1000

## Limitaciones aceptadas

⚠️ **Unidireccional server→client**: SSE solo envía server→client, cliente usa HTTP para enviar  
⚠️ **No descubrimiento automático**: A diferencia de MCP, no hay auto-discovery de tools  
⚠️ **Menos estándar**: HTTP es universal pero no específico de LLM/AI

**Mitigación**: Estas limitaciones no afectan el MVP. Se pueden abordar en v2.0 si es necesario.

## Implementación MVP

### Fase 1: Conexión básica
- [ ] Iniciar `opencode serve` desde plugin o manualmente
- [ ] Conectar con SDK desde Obsidian
- [ ] Health check funcional
- [ ] Enviar/recibir mensaje simple

### Fase 2: Comunicación realtime
- [ ] Suscribirse a SSE stream
- [ ] Mostrar eventos en UI de Obsidian
- [ ] Manejar reconexión automática

### Fase 3: Flujo completo
- [ ] Enviar nota a procesar
- [ ] Recibir sugerencias vía SSE
- [ ] Mostrar en panel lateral

## Notas de Implementación

```typescript
// Ejemplo completo de uso
import { createOpencodeClient } from "@opencode-ai/sdk"

class BrainOSBridge {
  private client: any
  private eventSource: any

  async connect() {
    // 1. Crear cliente
    this.client = createOpencodeClient({
      baseUrl: "http://localhost:4096"
    })

    // 2. Verificar conexión
    const health = await this.client.global.health()
    console.log("OpenCode versión:", health.data.version)

    // 3. Suscribirse a eventos
    this.subscribeToEvents()
  }

  async subscribeToEvents() {
    const events = await this.client.global.event()
    for await (const event of events.stream) {
      this.handleEvent(event)
    }
  }

  async sendNoteForProcessing(noteContent: string) {
    // Crear sesión o usar existente
    const session = await this.client.session.create({
      body: { title: "BrainOS Session" }
    })

    // Enviar nota
    await this.client.session.prompt({
      path: { id: session.id },
      body: {
        parts: [{ type: "text", text: noteContent }]
      }
    })
  }

  handleEvent(event: any) {
    // Actualizar UI de Obsidian
    console.log("Evento:", event.type, event.properties)
  }
}
```

## Referencias

- **OpenCode Server Docs**: https://opencode.ai/docs/server/
- **OpenCode SDK Docs**: https://opencode.ai/docs/sdk/
- **OpenAPI Spec**: Disponible en `http://localhost:4096/doc` cuando servidor está corriendo

---

**Decision**: ✅ DECIDIDO - HTTP + SSE  
**Validación**: ✅ OpenCode `serve` confirmado  
**MCP**: ⏸️ Posponido para v2.0  
**Next Step**: Implementar PoC de conexión básica
