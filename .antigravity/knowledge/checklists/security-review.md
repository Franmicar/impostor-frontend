---
name: Security Review Checklist
version: 1.0.0
type: checklist
scope: security
priority: critical
tags:
  - security
  - owasp
  - backend
  - frontend
  - infrastructure
description: Checklist de revisión de seguridad para aplicaciones y APIs.
---

# Security Review Checklist

# Authentication

- [ ] Autenticación obligatoria en endpoints protegidos.
- [ ] Passwords hasheadas correctamente.
- [ ] JWT expiración configurada.
- [ ] Refresh tokens seguros.
- [ ] Sesiones invalidadas correctamente.
- [ ] MFA evaluado si aplica.
- [ ] Rate limiting en login.

---

# Authorization

- [ ] RBAC implementado correctamente.
- [ ] Validación permisos server-side.
- [ ] Usuarios no pueden acceder recursos ajenos.
- [ ] Principio mínimo privilegio aplicado.
- [ ] Endpoints administrativos protegidos.

---

# Input Validation

- [ ] Todos los inputs validados.
- [ ] Sanitización activa.
- [ ] Protección SQL Injection.
- [ ] Protección NoSQL Injection.
- [ ] Protección XSS.
- [ ] Protección command injection.
- [ ] Validación tipos y tamaños.

---

# API Security

- [ ] HTTPS obligatorio.
- [ ] CORS configurado correctamente.
- [ ] Rate limiting activo.
- [ ] CSRF protection activa.
- [ ] API keys protegidas.
- [ ] Headers seguridad configurados.
- [ ] Endpoints sensibles protegidos.

---

# Secrets Management

- [ ] No existen secretos hardcodeados.
- [ ] Variables entorno protegidas.
- [ ] Secretos rotables.
- [ ] Accesos mínimos definidos.
- [ ] Tokens expirables.

---

# Database Security

- [ ] Queries parametrizadas.
- [ ] Backups protegidos.
- [ ] Conexiones cifradas.
- [ ] Accesos restringidos.
- [ ] Datos sensibles cifrados.

---

# Frontend Security

- [ ] No exponer secretos frontend.
- [ ] CSP configurado.
- [ ] Cookies seguras.
- [ ] Protección clickjacking.
- [ ] Dependencias auditadas.

---

# Infrastructure Security

- [ ] Firewalls configurados.
- [ ] SSH restringido.
- [ ] Puertos innecesarios cerrados.
- [ ] Monitoring activo.
- [ ] Logs seguridad activos.
- [ ] Alertas configuradas.

---

# Dependency Security

- [ ] Dependencias auditadas.
- [ ] Vulnerabilidades revisadas.
- [ ] Librerías abandonadas eliminadas.
- [ ] Versiones actualizadas.

---

# Logging & Monitoring

- [ ] Logs seguridad activos.
- [ ] Accesos auditados.
- [ ] Intentos fallidos registrados.
- [ ] Alertas anomalías activas.
- [ ] Error tracking activo.

---

# File Upload Security

- [ ] Tipos archivo validados.
- [ ] Tamaños limitados.
- [ ] Escaneo malware evaluado.
- [ ] Nombres sanitizados.
- [ ] Storage seguro.

---

# AI / LLM Security

- [ ] Prompt injection evaluado.
- [ ] Outputs validados.
- [ ] Tool access restringido.
- [ ] Datos sensibles filtrados.
- [ ] Contexto validado.

---

# Production Security

- [ ] Debug mode desactivado.
- [ ] Stack traces ocultos.
- [ ] HTTPS validado.
- [ ] Certificados válidos.
- [ ] Backup recovery probado.

---

# OWASP Validation

- [ ] Broken Access Control revisado.
- [ ] Cryptographic Failures revisado.
- [ ] Injection revisado.
- [ ] Insecure Design revisado.
- [ ] Security Misconfiguration revisado.
- [ ] Vulnerable Components revisado.
- [ ] Authentication Failures revisado.
- [ ] Logging & Monitoring revisado.

---

# Final Rules

- Nunca confiar en inputs cliente.
- Nunca exponer información sensible.
- Nunca asumir seguridad implícita.
- Priorizar defensa en profundidad.
- Validar seguridad antes de producción.