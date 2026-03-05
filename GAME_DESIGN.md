# El Impostor - Documento de Diseño de Juego (GDD)

## 1. Visión General
**"El Impostor"** es un party game trepidante para multijugador local diseñado para jugarse pasando un solo dispositivo entre los jugadores. Toma inspiración de los juegos de deducción social pero se centra en la asociación de palabras, respuestas a preguntas, o interpretación mediante dibujos, combinados siempre con el engaño y la rapidez mental.

## 2. Bucle Principal (Core Loop)
1. **Fase de Preparación**: El anfitrión (host) introduce los nombres de todos los jugadores, selecciona la cantidad de impostores/detectives, y elige un modo de juego y varios paquetes de palabras (Ej: Anime, Animales, Películas).
2. **Fase de Revelación de Secreto**: Los jugadores se van pasando el dispositivo. Cada jugador desliza la pantalla hacia arriba para ver su rol secreto y la palabra asignada de forma segura.
3. **Fase de Discusión**: Cuando todos han visto su rol, comienza una cuenta atrás (opcional). Dependiendo del **Tipo de Juego** elegido, los jugadores deberán decir en voz alta exactamente UNA palabra, responder/hacer preguntas, o dibujar algo relacionado con la palabra secreta.
4. **Fase de Votación**: Cuando termina la discusión, los jugadores votan quién creen que es el Impostor. El jugador más votado es eliminado.
5. **Resolución**: Dependiendo del modo de juego, la partida termina inmediatamente o continúa haciéndose de día de nuevo hasta que se cumplan las condiciones de victoria.

## 3. Roles
- **Civil**: Conoce la palabra secreta real. Su objetivo es demostrar que la conoce sin ser tan obvio como para que el Impostor la averigüe, pero no ser tan ambiguo que levante sospechas.
- **Impostor**: No conoce la palabra secreta (o recibe una pista/palabra falsa dependiendo del modo). Su objetivo es camuflarse, aportar una palabra/respuesta/dibujo convincente, evitar ser eliminado y, a ser posible, deducir la palabra secreta original.
- **Detective**: Un Civil especializado que no solo vota, sino que tiene la habilidad de "Resolver el Misterio". Si en la fase de votación adivina en voz alta la palabra exacta, los Civiles ganan al instante. Si se equivoca, queda eliminado de la partida.

## 4. Modos de Juego
1. **Clásico**
   - Votación estándar. Si se elimina a un Civil, la partida continúa hasta atrapar a todos los Impostores o hasta que estos igualen o superen en número a los Civiles.
2. **Rápido**
   - Muerte súbita. Si el grupo elimina a un Civil en la primerísima ronda, los Impostores ganan la partida instantáneamente.
3. **Detective**
   - Introduce el rol del Detective, con el poder de intentar averiguar la palabra y ganar de inmediato para los Civiles.
4. **Infiltrado**
   - El giro psicológico: Se les dice falsamente a los Impostores que son *Civiles*, y se les asigna una palabra "falsa" pero muy similar en contexto (Ej: A los Civiles les toca "Sushi", y al Impostor se le dice que es "Sashimi").
5. **Equipo**
   - Fuerza un mínimo de 2 Impostores en partida. Durante la pantalla de revelación, se les chiva disimuladamente a los Impostores quiénes son los otros Impostores para que puedan ayudarse y corroborar sus coartadas de equipo.
6. **Caos**
   - Aleatoriedad total. El sistema puede asignar 0 Impostores en toda la mesa, o poner a TODOS los jugadores como Impostores. La lógica estándar desaparece y la paranoia se multiplica.

## 4.5. Tipos de Juego (Dinámicas)
Junto a los modos y roles, la versión actual introduce la capacidad de elegir cómo se va a desarrollar la comunicación durante la ronda:
- **Palabras (Words)**: Dinámica base. Los jugadores giran turnos diciendo exactamente una palabra en voz alta para describir el secreto.
- **Preguntas (Questions)**: En cada turno, los jugadores deben hacer o responder preguntas relacionadas con el rol o la temática del paquete de forma astuta.
- **Dibujos (Drawing)**: Los jugadores usan papel o una pizarra externa, y deben interpretar mediante dibujos rápidos el concepto secreto de la ronda.

## 5. Identidad Visual y UI
- **Temática**: "Glassmorfismo Oscuro" (Dark Glass). Toques y sombras con colores Cyberpunk en neón (Rosa, Cyan, Índigo) sobre fondos sombríos.
- **Animaciones**: Transiciones entre pantallas muy fluidas, gestos de rebote simulando la gravedad de físicas de cartas reales ("Desliza para revelar").
- **Componentes**: Ruletas automatizadas para echar a suertes quién habla, inputs de selectores tipo "dial" para la preparación y bloqueo de navegación seguro para evitar perder el progreso acccidentalemente.
- **Accesibilidad**: Internacionalización profunda (ES, EN, FR, CA), botones y textos anchos legibles.

## 6. Ejecución Técnica
- **Motor Frontend**: Angular 19 (Standalone Components) + Tailwind CSS v4.
- **Infraestructura Backend**: Funciones Serveless distribuyendo paquetes.
- **Plataforma**: Preparado como Aplicación Web Progresiva (PWA) instalable directamente a la pantalla inicio de dispositivos móviles.

## 7. Historial de Versiones (Changelog)

### Versión 1.1.0
- **Tipos de Juego (Dinámicas)**: Incorporación de las mecánicas de "Preguntas" y "Dibujo" como alternativas al modo clásico de "Palabras", incrementando exponencialmente los modos de interacción en mesa.
- **Internacionalización**: Integración completa de los idiomas Francés (FR) y Catalán (CA).
- **Assets Gráficos**: Nuevos iconos 3D renderizados para los paquetes de palabras (Anime, Animales, Películas).
- **Interfaz (UI) y Experiencia (UX)**: Refinamientos en la pantalla de *Setup* (ajustes de iconos y layout) y diseño de *scrollbars* personalizadas globalmente (fondo oscuro y track cyan) acorde al estilo Dark Glass. Corrección en los textos de duración de turnos.
