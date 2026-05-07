---
name: API Design Template
version: 1.0.0
type: template
scope: backend
priority: high
tags:
  - api
  - backend
  - architecture
  - rest
description: Template profesional para diseñar APIs mantenibles, escalables y seguras.
---

# API Design Document

# 1. Overview

## API Name

[Nombre API]

## Purpose

[Qué problema resuelve.]

## API Type

- REST
- GraphQL
- gRPC
- WebSocket

## Architecture Style

- Monolith
- Modular monolith
- Microservices
- Serverless

---

# 2. Business Context

## Domain

[Dominio negocio.]

## Stakeholders

- Frontend
- Mobile
- Third-party integrations
- Internal services

---

# 3. Functional Requirements

## Main Features

### Feature 1

#### Description

[Descripción funcional.]

#### Endpoints relacionados

- GET /resource
- POST /resource

#### Business Rules

- Regla 1
- Regla 2

---

# 4. API Standards

## Naming Conventions

### Rules

- Usar nombres descriptivos.
- Usar plural para recursos.
- Evitar verbos innecesarios.
- Mantener consistencia.

### Correct Examples

/users
/orders
/payments

### Wrong Examples

/getUsers
/createOrder
/paymentData

---

## Versioning Strategy

/api/v1/users

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User not found"
  }
}
```

---

# 5. Authentication & Authorization

## Authentication Strategy

- JWT
- OAuth2
- API Keys
- Session-based

## Roles

- Admin
- User
- Service account

---

# 6. Data Modeling

## Main Entities

### Entity: User

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | Primary key |
| email | String | Yes | Unique |

---

## Validation Rules

- Email unique.
- Password minimum length.
- Input sanitization.
- Schema validation.

---

# 7. Endpoint Definitions

## GET /users

### Description

Obtener lista usuarios.

### Query Params

| Param | Type | Required | Description |
|---|---|---|---|
| page | Number | No | Pagination |
| limit | Number | No | Page size |

### Response

```json
{
  "success": true,
  "data": []
}
```

---

## POST /users

### Description

Crear usuario.

### Request Body

```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```

### Validations

- Email válido.
- Password segura.
- Email no duplicado.

---

# 8. Error Handling

## Principles

- Errores consistentes.
- Mensajes claros.
- No exponer información sensible.
- Logs internos detallados.

---

## Error Codes

| Code | Meaning |
|---|---|
| INVALID_INPUT | Invalid request |
| UNAUTHORIZED | Missing auth |
| FORBIDDEN | Access denied |
| NOT_FOUND | Resource missing |
| INTERNAL_ERROR | Unexpected error |

---

# 9. Security Requirements

## Security Measures

- HTTPS only.
- Rate limiting.
- CSRF protection.
- SQL injection prevention.
- XSS prevention.
- Secrets management.

---

# 10. Performance & Scalability

## Optimization Strategy

- Pagination.
- Indexing.
- Query optimization.
- Caching.
- Async jobs.

---

# 11. Observability

## Logging

- Structured logs.
- Correlation IDs.
- Error tracking.
- Audit logs.

## Monitoring

- Response time
- Error rate
- Throughput
- DB latency

---

# 12. Testing Strategy

## Required Tests

- Unit tests
- Integration tests
- Contract tests
- Load tests
- Security tests

---

# 13. Deployment Strategy

## Environment Structure

- Development
- Staging
- Production

## CI/CD

- Automated tests.
- Linting.
- Security checks.
- Deployment validation.

---

# 14. Documentation

## Required Docs

- OpenAPI/Swagger
- Authentication guide
- Error codes
- SDK examples

---

# 15. Risks

## Technical Risks

- Scaling bottlenecks.
- DB contention.
- Third-party dependency failures.

## Security Risks

- Credential leakage.
- Broken access control.
- Injection attacks.

---

# 16. Open Questions

- ¿Qué dependencias externas existen?
- ¿Qué límites de escalabilidad hay?
- ¿Qué partes son críticas?

---

# 17. Final Principles

- Priorizar consistencia.
- Mantener APIs predecibles.
- Diseñar para mantenibilidad.
- Evitar complejidad innecesaria.
