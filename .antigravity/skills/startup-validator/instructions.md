# Instructions: Startup Validator Skill

Esta skill dota al agente de la capacidad de analizar críticamente ideas de negocio y startups antes de construir el código del MVP.

---

## 1. Entrada Requerida (Inputs)

Para iniciar el análisis, necesitas que el usuario proporcione:
* **Idea Central:** Qué hace el producto y qué dolor resuelve.
* **ICP (Público Objetivo):** A quién va dirigido.
* **Competidores Identificados:** Qué otras soluciones conocen.
* **Propuesta de Monetización:** Cómo planea cobrar.

---

## 2. Instrucciones Operativas

Cuando esta skill esté activa, debes seguir las fases definidas en `knowledge/playbooks/product/validate-startup.md` e incorporar el uso de herramientas:

1. **Investigación de Mercado Automática:**
   - Utiliza la herramienta `competitor_search` (ejecutando `node tools/search-competitors.js` con las palabras clave de la idea) para recopilar información de competidores existentes.
   - Analiza los hallazgos y clasifícalos según sus fortalezas y debilidades.
2. **Validación de Identidad y Viabilidad Técnica:**
   - Si el usuario propone nombres de marca, utiliza `check_domain` (ejecutando `powershell -File tools/check-domain.ps1` con el nombre del dominio) para verificar si el dominio principal y alternativos están libres.
3. **Análisis de Dolor e Hipótesis:**
   - Cuestiona activamente si el problema planteado es "urgente, costoso y frecuente".
   - Si detectas que es un dolor débil o un mercado saturado sin diferenciación, levanta una alerta crítica al usuario.

---

## 3. Salidas Esperadas (Outputs)

Genera un reporte estructurado bajo `workspace/artifacts/reports/` con:
* **Matriz de Competidores:** Lista filtrada mediante la investigación automática.
* **Riesgos Críticos:** Hipótesis no validadas y amenazas de mercado.
* **Estrategia del MVP Mínimo:** Qué funcionalidades construir en la primera semana para validar la idea con clientes reales al menor coste.
