# 🧠 Antigravity Core - Master Index

Este es el índice y mapa maestro del sistema Antigravity Core. Su propósito es guiar al agente de IA para cargar las reglas, playbooks, checklists y skills necesarias bajo demanda (Lazy Loading), optimizando el presupuesto de tokens de contexto.

## Estructura del Framework

El framework se compone de 4 carpetas principales instaladas bajo `.antigravity/` en el proyecto:

1. **`system/` (Directivas Globales):** Reglas absolutas e invariables del sistema. Se leen al inicio de cada sesión y aplican continuamente.
2. **`knowledge/` (Conocimiento Estático):** Playbooks (workflows paso a paso), checklists de calidad y plantillas de diseño que se cargan bajo demanda según la tarea activa.
3. **`skills/` (Capacidades Ejecutables):** Extensiones funcionales compuestas por instrucciones de comportamiento y herramientas/scripts de soporte (Node.js o PowerShell).
4. **`workspace/` (Estado Dinámico):** Memoria local del proyecto actual, planes de tareas y propuestas de mejora generadas.

---

## 1. System Rules (Siempre Activas)

Estas reglas determinan el comportamiento básico, la calidad del código, la comunicación y la seguridad.
* `system/rules/architecture.md`: Principios y restricciones de diseño de software.
* `system/rules/security.md`: Directivas de seguridad y sanitización de datos.
* `system/rules/quality.md`: Estándares de calidad y prevención de deuda técnica.
* `system/rules/communication.md`: Reglas de interacción, resolución de ambigüedad y toma de decisiones.
* `system/rules/git.md`: Normas de control de versiones y gestión de ramas.
* `system/rules/productivity.md`: Criterios de eficiencia y priorización del impacto.
* `system/rules/auto-evolution.md`: Protocolo obligatorio de autoauditoría al cierre de la sesión de desarrollo.
* `system/rules/local-rules.md`: Reglas específicas, dependencias y stack del proyecto destino (creado localmente).

---

## 2. Playbooks & Checklists (Carga Bajo Demanda)

El agente debe leer estos archivos únicamente cuando la tarea actual requiera su ejecución.

### Playbooks (Workflows Procedimentales)
* **Producto y Negocio:**
  - `knowledge/playbooks/product/validate-startup.md`: Validación racional de ideas de negocio.
  - `knowledge/playbooks/product/build-saas-mvp.md`: Construcción rápida y modular de un MVP SaaS.
  - `knowledge/playbooks/product/launch-product.md`: Estrategia de despliegue comercial e iteración.
* **Ingeniería y Desarrollo:**
  - `knowledge/playbooks/engineering/fullstack-feature-flow.md`: Ciclo de vida para implementar una feature de inicio a fin.
  - `knowledge/playbooks/general/coding-standards.md`: Guías y estándares de codificación limpia.
  - `knowledge/playbooks/general/debugging-process.md`: Flujo estructurado para aislar y resolver bugs.
  - `knowledge/playbooks/general/tech-stack-selection.md`: Criterios racionales para elegir tecnologías.
* **Agentes e IA:**
  - `knowledge/playbooks/ai/ai-agent-development.md`: Guía de desarrollo de agentes autónomos fiables.
* **Análisis General:**
  - `knowledge/playbooks/general/project-analysis.md`: Flujo de inducción para analizar proyectos existentes.
  - `knowledge/playbooks/general/research.md`: Proceso de búsqueda de soluciones y documentación técnica.
  - `knowledge/playbooks/general/mockup-process.md`: Metodología para diseñar mockups de UI.

### Checklists (Control de Calidad)
* `knowledge/checklists/pre-deploy.md`: Verificaciones antes de desplegar código.
* `knowledge/checklists/production-readiness.md`: Requisitos para considerar un servicio listo para producción.
* `knowledge/checklists/security-review.md`: Auditoría de riesgos OWASP y variables de entorno.

### Plantillas (Estructuras de Documentos)
* `knowledge/templates/saas-prd-template.md`: Plantilla de especificación de producto (PRD).
* `knowledge/templates/api-design-template.md`: Plantilla para diseño de interfaces de programación.
* `knowledge/templates/ai-agent-template.md`: Estructura para documentar especificaciones de agentes IA.

---

## 3. Skills Registry (Carga Contextual)

Capacidades dinámicas asociadas a herramientas de ejecución automáticas (Node.js/PowerShell).
* **`skills/startup-validator/`**: Validación de ideas mediante análisis automatizado.
* **`skills/api-architect/`**: Diseño estructurado de contratos de APIs y schemas de base de datos.
* **`skills/landing-page-generator/`**: Generación ágil de prototipos HTML/JS.
* **`skills/ai-agent-builder/`**: Automatización de flujos multi-agente en Node.js.

---

## Instrucciones para el Agente (Lazy Loading Protocol)

1. **Carga inicial:** En tu primer mensaje, lee `system/INDEX.md` y `system/rules/*` para cargar tus restricciones fundamentales.
2. **Carga contextual:** Cuando vayas a ejecutar una tarea de una fase específica (ej. crear una base de datos), lee únicamente el playbook o skill relevante (`knowledge/playbooks/engineering/fullstack-feature-flow.md`).
3. **Liberación de memoria:** Indica explícitamente cuando termines de usar un playbook para mantener tu ventana de contexto limpia de ruido conceptual.
