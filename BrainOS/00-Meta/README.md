# BrainOS - Sistema de Gestión del Conocimiento Aumentado

## Visión de Producto

BrainOS es un **sistema agregador de PKM (Personal Knowledge Management)** que fusiona:

1. **Gestión Zettelkasten Inteligente**: Automatización del flujo completo (fleeting → literature → permanent)
2. **Potenciador Cognitivo**: Deep research, debate multi-agente, desarrollo de ideas
3. **Segundo Cerebro Vivo**: Offloading inteligente de información con memoria persistente

## Principios Fundamentales

### 1. Multi-Agente por Diseño
- Agentes especializados con roles definidos
- Coordinación mediante orquestador
- Comunicación inter-agente cuando sea necesario

### 2. Agnosticismo Tecnológico
- **LLM**: BYOK (OpenRouter, OpenAI, Anthropic, Ollama)
- **Embeddings**: Opcional (local Ollama o cloud)
- **Storage**: Vault local + sincronización opcional

### 3. Niveles de Autonomía Configurables
- **Autónomo**: Organización automática, tagging, commits
- **Semi-autónomo**: Sugerencias inline durante escritura
- **Invocado**: Chat/debate bajo demanda

### 4. Multi-Plataforma (Agregador)
- Core independiente de la UI
- Adaptadores para diferentes frontends
- Inicialmente: Obsidian (plugin) + CLI

## Estructura del Repositorio

```
BrainOS/
├── 00-Meta/                    # Este documento, roadmap, ADRs
├── 10-Technical-Architecture/  # Infraestructura, código, APIs
├── 20-Methodology-System/      # Metodología Zettelkasten, agentes
├── 30-Implementation/          # Código implementado
└── 90-Archive/                 # Decisiones descartadas
```

## Estado Actual

🟡 **Fase de Diseño y Planificación**

- [ ] Arquitectura técnica detallada
- [ ] Diseño del sistema multi-agente
- [ ] Definición de interfaces y contratos
- [ ] Prototipo de componentes críticos

## Sesiones Paralelas Activas

### Rama Técnica (Infraestructura)
- MCP vs HTTP vs WebSockets
- Estrategia de embeddings
- Storage y persistencia
- Seguridad y autenticación

### Rama Metodológica (Sistema)
- Taxonomía de agentes
- Flujos Zettelkasten automatizados
- Protocolos de comunicación agente-usuario
- Diseño de interacciones multi-agente

## Decisiones Pendientes (ADRs)

1. **ADR-001**: Protocolo de comunicación (MCP vs gRPC vs REST)
2. **ADR-002**: Arquitectura de embeddings (cuándo activar)
3. **ADR-003**: Modelo de persistencia de memoria agente
4. **ADR-004**: Estrategia de orquestación multi-agente
5. **ADR-005**: Estrategia de deployment (monolito vs microservicios)

## Roadmap Tentativo

### Fase 0: Fundamentos (Ahora)
- [ ] Decisiones arquitectónicas documentadas
- [ ] Proof of Concept de componentes críticos
- [ ] Definición de interfaces

### Fase 1: Core Functionality
- [ ] Agente organizador Zettelkasten
- [ ] Integración Obsidian básica
- [ ] Sistema de embeddings opcional

### Fase 2: Multi-Agente
- [ ] Orquestador de agentes
- [ ] Especialización agentes (archivero, investigador, crítico)
- [ ] Chat/debate multi-agente

### Fase 3: Potenciador Cognitivo
- [ ] Deep research integrado
- [ ] Debate socrático
- [ ] Síntesis automática

### Fase 4: Agregador Multi-Plataforma
- [ ] API REST pública
- [ ] Adaptadores adicionales (VS Code, web)
- [ ] Sync entre plataformas

## Notas

Este proyecto está siendo desarrollado con un enfoque ** deliberado y pausado**. No hay prisa. La calidad arquitectónica y la coherencia del sistema son prioritarias sobre la velocidad de implementación.

**Fecha de inicio**: 2026-02-07
**Última actualización**: 2026-02-07
