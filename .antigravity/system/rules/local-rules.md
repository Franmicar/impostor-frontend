# Local Project Rules & Specification

Este archivo está reservado para definir especificaciones, reglas y estándares exclusivos de este proyecto destino. Es heredado por el agente junto con el Core general de Antigravity.

## Especificaciones del Proyecto

* **Nombre del Proyecto:** [Ej. Mi Startup SaaS]
* **Lenguajes y Stack:** [Ej. Node.js (v18), TypeScript, PostgreSQL, Tailwind]
* **Framework principal:** [Ej. Next.js App Router]
* **Estrategia de Testing:** [Ej. Jest + Playwright]

---

## Convenciones Locales del Código

Define aquí reglas que invaliden o complementen las reglas globales:
* **Estructura de Carpetas:** [Ej. Seguir Clean Architecture con src/domain, src/infra, src/presentation]
* **Estilo de Nombres:** [Ej. camelCase para variables, PascalCase para componentes React, kebab-case para endpoints API]
* **Manejo de Estados/Base de datos:** [Ej. Usar Prisma como ORM único y ejecutar migraciones asíncronas en local]

---

## Overrides de Reglas del Core

Si este proyecto requiere relajar o modificar alguna regla de `system/rules/*`, especifícalo aquí:
* *Ejemplo:* `Override system/rules/git.md`: Se permite hacer push directo a la rama `development` en entornos de desarrollo ágil local si todos los tests pasan localmente.
