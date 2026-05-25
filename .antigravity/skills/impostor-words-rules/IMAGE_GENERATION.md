---
description: Pipeline y reglas oficiales de generación artística para los assets de Deceptra
---

# Guía de Generación Artística de Assets (Deceptra)

Este documento establece las normativas artísticas obligatorias, el pipeline de prompts y la lista de validación para la creación de cualquier asset visual en Deceptra. Estas reglas aseguran la máxima coherencia visual y conceptual en todas las pantallas y temas.

---

## 1. Reglas Artísticas Obligatorias

### 🚫 1. Prohibición de Textos o Letras
*   **Regra Estricta:** Ninguna imagen generada por IA debe contener letras, palabras, firmas, números, etiquetas de interfaz de usuario simuladas (fake UI) o texto decorativo.
*   **Motivo:** Introduce problemas graves de internacionalización (i18n), ya que el texto no puede ser traducido dinámicamente y da un aspecto amateur e incoherente con el estilo limpio de la app.
*   **Solución:** Representa las mecánicas mediante símbolos, acciones de personajes, u objetos.

### 🚫 2. Prohibición de Marcos o Bordes Artificiales
*   **Regla Estricta:** Las imágenes generadas deben ocupar el 100% del lienzo cuadrado. Está prohibido incluir marcos decorativos, bordes simulados, esquinas redondeadas generadas artificialmente, o recuadros.
*   **Motivo:** El recorte de esquinas (`border-radius`) y los bordes luminosos o entintados los controla dinámicamente la aplicación a través de CSS/Tailwind según el tema activo. Un borde en el asset restringe el redimensionado y destruye el diseño responsive.

### 🎨 3. Coherencia Temática Absoluta
*   Todas las imágenes de un mismo tema deben pertenecer a la misma sesión visual. Deben compartir:
    *   Misma iluminación (ej. luces directas vs. difusas, glow de neón).
    *   Mismo tipo de fondo (grado de detalle, profundidad y atmósfera).
    *   Mismo nivel de detalle e identidad artística.
*   **Evitar:** Combinar cliparts planos 2D con ilustraciones hiperdetalladas 3D o imágenes fotorrealistas dentro de la misma interfaz.

### 🧩 4. Claridad Conceptual y Funcional
*   Cada imagen debe tener una narrativa visual directa que apoye el significado conceptual del elemento asociado (el modo de juego, el tipo de pregunta, etc.).
*   **Evitar:** Imágenes bonitas y abstractas pero vacías de significado funcional.

### 📐 5. Perspectiva Frontal Directa (Front-Facing View)
*   **Regla Estricta:** Todas las imágenes del juego deben estar encuadradas desde una perspectiva frontal directa (de frente, vista frontal pura, a la altura de los ojos). Está prohibido utilizar perspectivas anguladas o de tres cuartos (3/4 view), planos picados, inclinaciones de cámara o vistas tridimensionales en diagonal.
*   **Motivo:** Para las tarjetas de configuración y listados de Deceptra, la asimetría de los ángulos de cámara rompe la armonía y legibilidad del panel. La perspectiva de frente asegura que todos los iconos de las tarjetas parezcan pertenecer a la misma botonera física y estén al mismo nivel.

### 📏 6. Margen de Seguridad Mínimo (Límite Estricto 5% a 8%)
*   **Regla Estricta:** El espacio o margen de fondo visible alrededor del sujeto u objeto principal debe estar limitado estrictamente a un rango de entre **5% y 8% del tamaño total de la imagen** en cada uno de sus lados. El objeto central debe ser el elemento dominante absoluto y estar sumamente cercano al encuadre.
*   **Motivo:** Garantizar que en las tarjetas y menús móviles de la app, el icono resulte grande, nítido y de legibilidad inmediata, evitando de esta forma composiciones donde el sujeto se vea alejado o el fondo resulte dominante.

### 🌌 7. Uso del Fondo de Ciudad Cyberpunk Difuminada
*   **Regla Estricta:** Todas las imágenes del tema Neon deben usar como fondo una ciudad cyberpunk nocturna desenfocada/difuminada (blurred cyberpunk city lights) en tonos morados oscuros, azul noche, magenta y cian. Este fondo aporta dinamismo, vida y profundidad sin competir con el objeto principal. Prohibido usar degradados planos o fondos oscuros de estudio lisos.

### ✨ 8. Objetos con Estilo de Dibujo 2D e Iluminación Neón (Glow Outline)
*   **Regla Estricta:** El objeto o los objetos representados deben tener un estilo de ilustración digital 2D (estilo anime/webtoon cyberpunk) con contornos limpios y definidos (bold outlines) y sombreado plano (cel shading). Todo el delineado y los filamentos de luz deben brillar con un glow de neón en rosa neón (#f20db9) y cian eléctrico (#0df2f2). Prohibido cualquier tipo de renderizado 3D, fotorrealismo, o texturas realistas como fibra de carbono, metal cepillado o tornillería tridimensional.

### 🔍 9. Protagonismo y Destacado del Objeto
*   **Regla Estricta:** El objeto debe destacar de manera clara e inmediata en la imagen. El fondo es únicamente un soporte secundario que sirve de marco perimetral estrecho, evitando que el fondo domine o deje grandes áreas vacías.

### 📐 10. Relación de Aspecto 1:1 y Resolución Óptima (256x256 px)
*   **Regla Estricta:** Todas las imágenes y recursos de tipo icono en la interfaz (Setup, Modos de Juego y Tipos de Partida) deben tener un formato de lienzo estrictamente cuadrado con una relación de aspecto **1:1** perfecta, y deben exportarse y guardarse a una resolución final de exactamente **256x256 píxeles**.
*   **Motivo:** Evita deformaciones, estiramientos o recortes irregulares en el navegador y los dispositivos móviles. Además, reduce el peso del recurso en un 95%+ (pasando de ~1.7 MB a menos de ~120 KB por archivo), eliminando el efecto borroso o dientes de sierra (*aliasing*) que produce el escalado por software desde imágenes de origen excesivamente grandes.

---

## 2. Ficha Artística por Tema

### A. Tema Neon (Default) / Neon2
*   **Estética:** Ilustración digital 2D estilo anime/webtoon cyberpunk. Formas estilizadas y gráficas, trazos negros limpios y definidos, sombreado plano (cel shading) y acabados limpios. Nada de realismo o volumen 3D.
*   **Iluminación y Delineado:** Delineado neón brillante y contornos luminosos (glow outlines) en rosa neón (#f20db9) y cian eléctrico (#0df2f2), proyectando un halo de luz suave sobre los bordes del dibujo 2D.
*   **Paleta de Colores:** 
    *   **Neon:** Rosa Primario (`#f20db9`), Cyan Secundario (`#0df2f2`).
    *   **Neon2:** Amarillo Neón (`#f2e70d`), Verde Eléctrico (`#0df23a`).
*   **Fondos:** Vista nocturna difuminada y desenfocada de una metrópolis cyberpunk con destellos y luces de neón en tonos morados, magenta y cian.





### B. Tema Infantil
*   **Estética:** Estilo "Flat-color" amigable, infantil y cálido. Formas simplificadas y redondeadas con texturas suaves y amables.
*   **Paleta de Colores:** Tonos pastel, naranjas suaves, azul cielo y blanco puro.
*   **Fondos:** Fondos luminosos degradados y limpios, sin sombras duras ni elementos tecnológicos agresivos.

### C. Theme Alien (Sci-Fi / Holográfico)
*   **Estética:** Tecnología orgánica alienígena, pantallas biológicas, interfaces holográficas.
*   **Paleta de Colores:** Verde Ácido (`#39FF14`), Morado Eléctrico (`#AB47BC`).
*   **Fondos:** Vacío cósmico oscuro, escaneos holográficos de rejilla y texturas bioluminiscentes.

### D. Theme Manga (Novela Gráfica / Cómic)
*   **Estética:** Alto contraste estilo tinta y papel japonés (sumi-ink). Uso de tramas de semitono (screentones), líneas de velocidad cinética y siluetas dramáticas.
*   **Paleta de Colores:** Negro absoluto (`#121212`), Blanco papel / Gris de trama, Acento único en Rojo Acción (`#D32F2F`).
*   **Fondos:** Patrones de líneas de velocidad, semitono diagonal o degradados de puntos de cómic.

---

## 3. Pipeline Oficial de Generación Artística (Fase 3)

Ningún asset de imagen debe ser incorporado directamente en la base de código sin seguir este pipeline secuencial:

```
[Paso 1: Análisis] ────> [Paso 2: Prompting] ────> [Paso 3: Generación] ────> [Paso 4: Validación] ────> [Paso 5: Aprobación]
```

1.  **Paso 1: Análisis de Contexto:** Definir la pantalla en la que aparecerá el asset, el tema activo, y la intención funcional (ej. representar "tiempo de turno").
2.  **Paso 2: Estructura del Prompt:** Redactar el prompt para Nano Banana asegurando que:
    *   Describa el concepto visual principal y los acentos cromáticos.
    *   Incluya explícitamente palabras clave negativas contra textos y bordes (ej: `no text, no letters, full square canvas, no artificial frames`).
3.  **Paso 3: Generación Unitaria:** Invocar el motor de generación para obtener **únicamente una imagen**.
4.  **Paso 4: Validación Automática:** Pasar el asset por la lista de verificación (ver sección 4).
5.  **Paso 5: Aprobación del Usuario:** Presentar la imagen de muestra generada al usuario. **Frenar el pipeline y esperar confirmación manual.** Si es aprobado, se exporta a WebP y se rutea en el manifest. Si se rechaza, se itera el prompt.

---

## 4. Lista de Validación Visual (Visual Validation Checklist)

Antes de dar un asset por pre-aprobado, verifica los siguientes puntos:

*   [ ] **¿Sin Texto?** No contiene letras, labels, números ni firmas.
*   [ ] **¿Sin Bordes?** El canvas llega limpio a los bordes sin marcos ni biseles artificiales.
*   [ ] **¿Alineación de Color?** Usa exclusivamente los colores del theme asignado (ej: verde ácido y morado para Alien).
*   [ ] **¿Coherencia Temática?** Si se coloca junto a otras imágenes del mismo tema, parece parte del mismo juego y estilo artístico.
*   [ ] **¿Significado Funcional?** El usuario final puede asociar intuitivamente el dibujo con lo que representa (ej. la lupa representa detectives).
*   [ ] **¿Formato y Resolución?** Cuadrada 1:1 perfecta, resolución final exacta de **256x256 px** (para iconos y miniaturas) o la correspondiente según plantilla, guardada como PNG optimizado.
