# Reglas de Diseño e Integración de Avatar Frames

Este documento define las reglas de diseño oficiales y los estándares de integración técnica para todos los marcos de avatar (avatar frames) del proyecto Deceptra.

---

## Regla Crítica #1 — El Avatar NUNCA se reduce
El personaje del avatar es el elemento visual más importante del perfil del usuario y su identidad.
*   **Prohibido**: Reducir la escala interna de la imagen del avatar o comprimirla para que "quepa" dentro del marco.
*   **Permitido**: El marco debe actuar como un **overlay** decorativo exterior que se expande hacia fuera del área del avatar, o que se superpone sutilmente sobre los bordes externos de la imagen sin comprometer su área interna. El avatar debe conservar siempre el 100% de su tamaño visual establecido.

## Regla Crítica #2 — Consistencia de Grosor y Proporciones
Para evitar desbalances visuales y mantener el protagonismo del personaje:
*   El marco debe consistir en un **aro circular muy fino** que actúa como contorno inmediato del avatar.
*   El diámetro interno útil (el espacio transparente central libre de obstrucciones de este aro) debe estar entre el **95% y 98% del tamaño del avatar** en la interfaz. El aro no debe invadir el rostro ni el cuerpo del personaje.
*   El grosor visual general del aro debe mantenerse delgado y consistente en todos los temas.

## Regla Crítica #3 — Reforzar el Theme (No a los marcos genéricos)
Los marcos no deben ser simples aros o círculos de colores. Cada marco debe tener personalidad e identidad visual propia del tema correspondiente:
*   **Theme Neon**: Elementos de HUD futurista, glitches, coordenadas numéricas y segmentos asimétricos flotantes.
*   **Theme Infantil**: Formas esponjosas, nubes, estrellas tipo stickers, globos y bordes suaves irregulares de plastilina.
*   **Theme Alien**: Estructuras bio-mecánicas, garras, bioluminiscencia y cristales alienígenas flotantes.
*   **Theme Manga**: Trazos de pincel sumi-ink, líneas de velocidad cinéticas, salpicaduras de tinta y viñetas de cómic rotas con acento Rojo Acción (#D32F2F).

## Regla Crítica #4 — No Tapar Información Importante y Expansión Externa
Cualquier detalle tridimensional u overlay decorativo del marco (como orejas, cuernos, rayos, tentáculos o efectos de energía):
*   Debe expandirse principalmente **hacia el exterior** del aro circular.
*   El centro del avatar (donde se ubica la cara o expresión del personaje) debe quedar completamente libre de cualquier obstáculo o superposición visual.

---

## Integración Técnica Estándar
Todos los marcos deben ser renderizados a través del componente reutilizable `<app-avatar>` ([avatar.component.ts](file:///c:/Users/dj_ra/OneDrive/Documentos/Proyectos/impostor-words/impostor-frontend/src/app/shared/components/ui/avatar.component.ts)), el cual encapsula:
*   El avatar escalado al 100% de la caja interna.
*   El marco superpuesto absolutamente con un factor de escala dinámico (`frameScale`), garantizando que se expanda hacia fuera sin alterar al avatar.
*   **Estándar de Mapeo PNG y CSS**: Para lograr que el aro circular no tape el avatar (diámetro interno útil final del ~96%), los archivos PNG procesados deben ajustarse radialmente según el factor de escala de su tema:
    - **Temas Neon y Neon2** (`scale(1.33)`): El aro interno del PNG debe situarse al **72%** de su radio (`tgt_inner = 0.72`), resultando en $1.33 \times 72\% \approx 96\%$ de diámetro útil.
    - **Temas Alien y Manga** (`scale(1.12)`): El aro interno del PNG debe situarse al **85%** de su radio (`tgt_inner = 0.85`), resultando en $1.12 \times 85\% \approx 95\%$ de diámetro útil.
    - **Tema Infantil** (`scale(1.10)`): El aro interno del PNG debe situarse al **87%** de su radio (`tgt_inner = 0.87`), resultando en $1.10 \times 87\% \approx 96\%$ de diámetro útil.
