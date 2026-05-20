---
name: Pre Deploy Checklist
version: 1.0.0
type: checklist
scope: deployment
priority: critical
tags:
  - deploy
  - production
  - infrastructure
  - release
description: Checklist previa al despliegue para reducir errores en producción.
---

# Pre Deploy Checklist

# Código

- [ ] No existen errores críticos conocidos.
- [ ] No existen TODOs críticos pendientes.
- [ ] No existe código muerto innecesario.
- [ ] No existen logs debug innecesarios.
- [ ] No existen secretos hardcodeados.
- [ ] El código ha sido revisado.
- [ ] Los commits están limpios y organizados.

---

# Testing

- [ ] Tests unitarios pasando.
- [ ] Tests integración pasando.
- [ ] Validación manual completada.
- [ ] Edge cases revisados.
- [ ] Flujos críticos verificados.
- [ ] Manejo errores validado.

---

# Frontend

- [ ] Responsive validado.
- [ ] Accesibilidad básica validada.
- [ ] Assets optimizados.
- [ ] Lazy loading configurado.
- [ ] SEO básico validado.
- [ ] No existen errores consola.

---

# Backend

- [ ] Validaciones activas.
- [ ] Manejo errores consistente.
- [ ] Logs estructurados.
- [ ] Rate limiting activo.
- [ ] Timeouts configurados.
- [ ] Retries configurados.
- [ ] APIs documentadas.

---

# Base de Datos

- [ ] Migraciones verificadas.
- [ ] Índices revisados.
- [ ] Queries críticas optimizadas.
- [ ] Backups disponibles.
- [ ] Rollback plan definido.

---

# Seguridad

- [ ] Variables entorno verificadas.
- [ ] Secretos protegidos.
- [ ] HTTPS activo.
- [ ] CORS configurado correctamente.
- [ ] Inputs sanitizados.
- [ ] Autenticación validada.
- [ ] Permisos revisados.

---

# Infraestructura

- [ ] Variables entorno producción configuradas.
- [ ] Dominio configurado.
- [ ] SSL válido.
- [ ] Monitoring activo.
- [ ] Alerting configurado.
- [ ] Logs centralizados.
- [ ] Health checks activos.

---

# Observabilidad

- [ ] Error tracking activo.
- [ ] Métricas activas.
- [ ] Logging validado.
- [ ] Tracing configurado.
- [ ] Dashboards operativos.

---

# Performance

- [ ] Tiempo carga aceptable.
- [ ] APIs críticas optimizadas.
- [ ] Caching validado.
- [ ] Recursos optimizados.
- [ ] Costes infraestructura revisados.

---

# Deploy

- [ ] Entorno staging validado.
- [ ] Rollback probado.
- [ ] Deploy automatizado validado.
- [ ] Dependencias verificadas.
- [ ] Versionado actualizado.

---

# Post Deploy Plan

- [ ] Validaciones post deploy definidas.
- [ ] Monitorización primeras horas preparada.
- [ ] Equipo informado.
- [ ] Plan incidentes preparado.

---

# Reglas Finales

- Nunca desplegar con errores conocidos críticos.
- Nunca desplegar sin rollback plan.
- Nunca desplegar sin monitoring.
- Nunca desplegar directamente sin validación staging.