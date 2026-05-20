---
name: Production Readiness Checklist
version: 1.0.0
type: checklist
scope: production
priority: critical
tags:
  - production
  - deploy
  - infrastructure
  - scalability
  - reliability
description: Checklist para validar que un sistema está preparado para producción.
---

# Production Readiness Checklist

# Arquitectura

- [ ] Arquitectura documentada.
- [ ] Dependencias identificadas.
- [ ] Servicios críticos definidos.
- [ ] Cuellos de botella evaluados.
- [ ] Estrategia escalabilidad definida.

---

# Código

- [ ] Código revisado.
- [ ] Sin errores críticos conocidos.
- [ ] Sin código muerto innecesario.
- [ ] Sin secretos hardcodeados.
- [ ] Logs debug eliminados.
- [ ] Configuración separada por entorno.

---

# Testing

- [ ] Tests unitarios pasando.
- [ ] Tests integración pasando.
- [ ] Tests E2E críticos pasando.
- [ ] Edge cases revisados.
- [ ] Validación manual completada.
- [ ] Flujos críticos verificados.

---

# Seguridad

- [ ] HTTPS activo.
- [ ] Variables entorno protegidas.
- [ ] Autenticación validada.
- [ ] Permisos revisados.
- [ ] Inputs sanitizados.
- [ ] Rate limiting activo.
- [ ] Dependencias auditadas.
- [ ] OWASP review completado.

---

# Infraestructura

- [ ] Deploy automatizado.
- [ ] CI/CD funcionando.
- [ ] Entorno staging validado.
- [ ] Infraestructura documentada.
- [ ] DNS configurado.
- [ ] SSL válido.
- [ ] Health checks activos.

---

# Base de Datos

- [ ] Migraciones verificadas.
- [ ] Índices optimizados.
- [ ] Backups activos.
- [ ] Recovery probado.
- [ ] Conexiones seguras.
- [ ] Queries críticas optimizadas.

---

# Observabilidad

- [ ] Monitoring activo.
- [ ] Error tracking activo.
- [ ] Logging centralizado.
- [ ] Alertas configuradas.
- [ ] Dashboards operativos.
- [ ] Métricas críticas definidas.

---

# Performance

- [ ] APIs optimizadas.
- [ ] Frontend optimizado.
- [ ] Caching configurado.
- [ ] Latencia validada.
- [ ] Costes infraestructura evaluados.
- [ ] Recursos optimizados.

---

# Escalabilidad

- [ ] Horizontal scaling evaluado.
- [ ] Límites sistema identificados.
- [ ] Estrategia colas definida.
- [ ] Timeouts configurados.
- [ ] Retries configurados.
- [ ] Circuit breakers evaluados.

---

# Fiabilidad

- [ ] Rollback plan definido.
- [ ] Recovery plan documentado.
- [ ] Redundancia evaluada.
- [ ] Dependencias externas monitorizadas.
- [ ] Fallbacks definidos.

---

# APIs & Integraciones

- [ ] APIs documentadas.
- [ ] Contratos definidos.
- [ ] Versionado implementado.
- [ ] Integraciones externas validadas.
- [ ] Timeouts externos configurados.

---

# Frontend

- [ ] Responsive validado.
- [ ] Accesibilidad básica validada.
- [ ] SEO básico configurado.
- [ ] Performance frontend validada.
- [ ] Errores cliente monitorizados.

---

# Operaciones

- [ ] Equipo conoce proceso deploy.
- [ ] Procedimientos incidentes definidos.
- [ ] Ownership definido.
- [ ] Accesos revisados.
- [ ] Costes monitorizados.

---

# AI / LLM Systems

- [ ] Cost tracking activo.
- [ ] Prompt versioning activo.
- [ ] Hallucination risks evaluados.
- [ ] Guardrails configurados.
- [ ] Context limits evaluados.

---

# Compliance

- [ ] Política privacidad disponible.
- [ ] Gestión datos usuarios validada.
- [ ] Retención datos definida.
- [ ] Logs compliance revisados.

---

# Final Validation

- [ ] Sistema estable en staging.
- [ ] Deploy reproducible.
- [ ] Monitoring operativo.
- [ ] Recovery validado.
- [ ] Riesgos conocidos documentados.

---

# Final Rules

- Nunca desplegar sin observabilidad.
- Nunca desplegar sin rollback.
- Nunca desplegar sin backups.
- Nunca desplegar con errores críticos conocidos.
- Priorizar estabilidad sobre velocidad.