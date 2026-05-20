---
name: AI Agent Template
version: 1.0.0
type: template
scope: ai
priority: high
tags:
  - ai
  - agents
  - llm
  - workflows
description: Template profesional para diseñar agentes IA robustos y mantenibles.
---

# AI Agent Specification

# 1. Overview

## Agent Name

[Nombre agente]

## Purpose

[Qué problema resuelve.]

## Main Responsibilities

- Responsabilidad 1
- Responsabilidad 2
- Responsabilidad 3

---

# 2. Inputs

## User Inputs

- Texto
- Archivos
- URLs
- Datos estructurados

## System Inputs

- Contexto proyecto
- Memoria
- Retrieval
- Configuración

---

# 3. Outputs

## Expected Outputs

- Respuestas estructuradas
- JSON
- Reportes
- Código
- Recomendaciones

## Output Rules

- Claridad
- Precisión
- Consistencia
- No inventar información

---

# 4. Agent Behavior

## Principles

- Priorizar precisión.
- No asumir información faltante.
- Detectar ambigüedad.
- Explicar tradeoffs.
- Mantener consistencia.

## Restrictions

- No inventar datos.
- No ignorar errores.
- No ejecutar acciones peligrosas.
- No exponer secretos.

---

# 5. Tools

## Available Tools

| Tool | Purpose |
|---|---|
| Web Search | Buscar información |
| File System | Leer archivos |
| Database | Consultar datos |
| API Client | Consumir APIs |

---

## Tool Usage Rules

- Usar herramientas solo cuando sea necesario.
- Verificar outputs antes de responder.
- Minimizar llamadas redundantes.

---

# 6. Memory

## Persistent Memory

- Preferencias usuario
- Contexto proyecto
- Decisiones arquitectura

## Session Memory

- Conversación actual
- Tareas activas
- Estado workflow

## Memory Rules

- Evitar ruido contextual.
- Persistir solo información útil.
- No almacenar secretos.

---

# 7. Retrieval

## Sources

- Documentación
- Knowledge base
- Vector DB
- Archivos proyecto

## Retrieval Rules

- Priorizar fuentes oficiales.
- Reducir contexto innecesario.
- Verificar actualidad información.

---

# 8. Workflow

## Main Flow

1. Analizar input.
2. Detectar intención.
3. Recuperar contexto.
4. Ejecutar herramientas.
5. Validar resultados.
6. Generar output.

---

# 9. Error Handling

## Strategy

- Detectar errores temprano.
- Explicar problemas claramente.
- Proporcionar fallback.
- Evitar respuestas vacías.

## Edge Cases

- Contexto insuficiente
- Herramientas caídas
- Información contradictoria
- Timeouts

---

# 10. Security

## Rules

- No exponer credenciales.
- Sanitizar inputs.
- Validar outputs.
- Limitar acciones críticas.

---

# 11. Observability

## Logging

- Tool calls
- Errors
- Latency
- Costs

## Metrics

- Success rate
- Error rate
- Token usage
- Response latency

---

# 12. Evaluation

## Quality Checks

- Precisión
- Robustez
- Consistencia
- Utilidad

## Failure Cases

- Hallucinations
- Incorrect reasoning
- Missing context
- Invalid outputs

---

# 13. Performance

## Optimization Goals

- Reducir latencia.
- Reducir costes.
- Minimizar contexto.
- Optimizar retrieval.

---

# 14. Deployment

## Environment

- Development
- Staging
- Production

## Deployment Rules

- Validar prompts antes deploy.
- Versionar cambios.
- Monitorizar outputs.

---

# 15. Risks

## Technical Risks

- Hallucinations
- Cost escalation
- Context overflow
- Tool failures

## Product Risks

- Mala UX
- Respuestas inconsistentes
- Baja confiabilidad

---

# 16. Open Questions

- ¿Qué nivel de autonomía necesita?
- ¿Qué acciones puede ejecutar?
- ¿Qué memoria debe persistir?
- ¿Qué riesgos existen?

---

# 17. Final Principles

- Priorizar precisión sobre velocidad.
- Mantener comportamiento consistente.
- Reducir complejidad innecesaria.
- Diseñar para observabilidad.
- Optimizar contexto continuamente.