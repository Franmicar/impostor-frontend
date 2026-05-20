---
name: Build SaaS MVP
version: 1.0.0
type: playbook
scope: product
priority: high
tags:
  - saas
  - mvp
  - startup
  - architecture
description: Flujo completo para construir un MVP SaaS validable y escalable.
---

# Build SaaS MVP

## Objetivo

Construir un MVP SaaS funcional, validable y mantenible evitando overengineering y deuda técnica temprana.

---

# Fase 1 — Validación

## Objetivos

- Detectar si existe problema real.
- Validar mercado.
- Detectar viabilidad económica.

## Pasos

1. Identificar problema principal.
2. Detectar intensidad del dolor.
3. Identificar usuario ideal.
4. Analizar mercado.
5. Detectar competidores.
6. Analizar diferenciación.
7. Validar monetización.
8. Detectar riesgos.
9. Definir MVP mínimo real.
10. Priorizar funcionalidades.

## Outputs

- ICP definido.
- Lista priorizada de features.
- Riesgos detectados.
- Estrategia MVP.
- Hipótesis de monetización.

---

# Fase 2 — Arquitectura

## Objetivos

Diseñar una base técnica escalable sin complejidad innecesaria.

## Pasos

1. Seleccionar stack.
2. Diseñar arquitectura inicial.
3. Diseñar base de datos.
4. Diseñar autenticación.
5. Diseñar APIs.
6. Definir servicios externos.
7. Definir estrategia de deploy.
8. Evaluar escalabilidad.
9. Detectar cuellos de botella.

## Reglas

- Priorizar simplicidad.
- Evitar microservicios tempranos.
- Reducir dependencias.
- Mantener separación de responsabilidades.

## Outputs

- Arquitectura inicial.
- Diagrama de componentes.
- Schema DB.
- Diseño API.
- Stack final.

---

# Fase 3 — UX/UI

## Objetivos

Diseñar experiencia clara y orientada a conversión.

## Pasos

1. Crear wireframes.
2. Diseñar onboarding.
3. Diseñar flujo principal.
4. Reducir fricción.
5. Optimizar navegación.
6. Validar mobile-first.
7. Crear design system mínimo.
8. Validar accesibilidad.

## Outputs

- Wireframes.
- User flows.
- Componentes base.
- Diseño responsive.

---

# Fase 4 — Desarrollo

## Objetivos

Construir MVP funcional rápidamente sin comprometer mantenibilidad.

## Pasos

1. Inicializar proyecto.
2. Configurar entorno.
3. Implementar autenticación.
4. Implementar core features.
5. Configurar validaciones.
6. Configurar manejo de errores.
7. Implementar logs.
8. Añadir tests críticos.
9. Optimizar rendimiento básico.

## Reglas

- Mantener commits pequeños.
- Evitar lógica duplicada.
- Mantener modularidad.
- Priorizar legibilidad.

## Outputs

- MVP funcional.
- API operativa.
- Frontend funcional.
- Infraestructura inicial.

---

# Fase 5 — QA

## Objetivos

Detectar problemas antes de producción.

## Pasos

1. Testing funcional.
2. Testing UX.
3. Testing responsive.
4. Revisar errores.
5. Validar seguridad básica.
6. Revisar rendimiento.
7. Detectar edge cases.

## Outputs

- Lista de bugs.
- Validación QA.
- Checklist completado.

---

# Fase 6 — Deploy

## Objetivos

Publicar versión inicial estable.

## Pasos

1. Configurar variables entorno.
2. Configurar dominio.
3. Configurar HTTPS.
4. Configurar logs.
5. Configurar monitoring.
6. Realizar deploy.
7. Validar producción.

## Outputs

- MVP desplegado.
- Monitoring activo.
- Producción validada.

---

# Fase 7 — Iteración

## Objetivos

Mejorar producto basado en feedback real.

## Pasos

1. Recoger feedback.
2. Analizar métricas.
3. Detectar fricción.
4. Priorizar mejoras.
5. Optimizar onboarding.
6. Mejorar conversión.
7. Iterar roadmap.

## KPIs sugeridos

- Retención.
- Activación.
- Conversión.
- Churn.
- CAC.
- LTV.