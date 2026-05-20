# Rule: Dynamic Self-Evolution Protocol

Esta regla obliga al agente a ejecutar un análisis de optimización del sistema al final de cada sesión de desarrollo. Su objetivo es automatizar la detección de deuda técnica, errores frecuentes y la extracción de código repetitivo a plantillas o reglas compartidas.

---

## 1. Disparadores del Protocolo

Debes iniciar este protocolo dinámicamente cuando se cumpla alguna de las siguientes condiciones:
1. **Fin de una sesión o hito:** El usuario indica que la tarea ha finalizado, que el código funciona y se dispone a cerrar la sesión.
2. **Corrección recurrente:** Detectas que has solucionado el mismo bug técnico o configurado el mismo parámetro en archivos distintos en más de dos ocasiones durante la sesión.
3. **Duplicidad de código:** Implementas un helper, validador o cliente que crees que se convertirá en un boilerplate recurrente en otras partes del sistema.

---

## 2. Proceso de Análisis y Auditoría

Al activarse el disparador, debes seguir estos pasos secuencialmente:

1. **Revisar el Log de Aprendizaje:** Inspecciona el historial de la sesión y lee (o añade la entrada correspondiente) `workspace/memory/learning_log.jsonl`.
2. **Identificar Categoría de Mejora:**
   * **Regla Nueva o Ajustada:** Si hay un error recurrente o convención que deba forzarse (ej. "usar siempre HSL en CSS").
   * **Template / Plantilla:** Si una estructura de archivo (como un schema de base de datos o endpoint API) se está repitiendo y merece ser plantilla.
   * **Skill:** Si hay una tarea operativa manual que podría automatizarse con un script Node.js o PowerShell (ej. un script para resetear bases de datos de prueba).
3. **Generar Propuesta:**
   * Crea un archivo de propuesta en `workspace/artifacts/proposals/prop-[timestamp].md`.
   * El archivo debe contener:
     - Nombre y tipo de propuesta.
     - Justificación e impacto técnico.
     - Borrador del contenido del nuevo archivo o diff de modificación.

---

## 3. Notificación al Usuario

Al terminar tu turno tras activar el protocolo, notifica brevemente al usuario de la existencia de la propuesta sin bloquear el flujo principal:

> "He detectado un patrón repetitivo en [Área/Archivo] y he generado una propuesta de autoevolución en `workspace/artifacts/proposals/prop-[timestamp].md`. Puedes revisarla cuando lo desees."

---

## 4. Consolidación y Limpieza (Filtros de Seguridad)

Para evitar la contaminación del contexto y la acumulación de reglas inútiles:
* **No inventes reglas generales:** Las reglas propuestas deben ser específicas de este proyecto o de la lógica instalada localmente.
* **Humano en el bucle:** Nunca muevas archivos de `workspace/artifacts/proposals/` a las carpetas core `system/` o `knowledge/` sin la aprobación explícita y escrita del usuario.
