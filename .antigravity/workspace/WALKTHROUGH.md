# El Impostor - Walkthrough Arquitectónico (Frontend)

## 1. Introducción
Este documento es la guía y paseo de arquitectura técnica ("walkthrough") para enseñar cómo funciona **El Impostor (Frontend)**. Cubre la estructura de carpetas, el stack tecnológico, de qué forma fluye la lógica y cómo interactúan las piezas para servir la experiencia local de forma continua.

## 2. Stack Tecnológico
- **Framework**: Angular 19 basado estrictamente en "Standalone Components" (Sin NgModules).
- **Estilos**: Tailwind CSS v4. Efecto de "Glassmorfismo" a medida y re-utilizado para el tema opaco con neones.
- **Manejo de Estado (State)**: Programación reactiva propia introduciendo las Señales (`signal` y `computed`), eliminando el overhead de una librería extra, en forma de fuente de la verdad para el núcleo del juego.
- **Internacionalización (i18n)**: Uso de `@ngx-translate/core` para permutar plantillas de idioma (ES, EN, FR, CA).
- **PWA Ready**: Declarado y configurado como archivo que fomenta la instalación directa en dispositivos locales para funcionar como app nativa a pantalla completa.

## 3. Arquitectura y Árbol de Ficheros
```text
src/app/
├── core/
│   ├── guards/          # Guardianes de ruta (como 'prevent-exit-guard' para evitar salidas accidentales)
│   ├── models/          # Modelos de datos (e.g. profile.model.ts)
│   └── services/        # Servicios (Singleton)
│       ├── api/         # Inyección HttpClient para llamadas de red al backend
│       ├── game-engine/ # Componente Maestro en memoria (Gestión de Roles, votaciones, estado)
│       ├── profile/     # Servicio de perfil (Google Login, subida de foto a Firebase Storage, Firestore, cola de sync offline)
│       ├── voice-chat/  # Conexión WebRTC en sala remota con LiveKit para chat de voz en vivo
│       ├── socket/      # Sincronización bidireccional en tiempo real para modo online con Socket.io
│       ├── timer/       # Contador asíncrono con observables para la fase de discusión
│       └── confirm/     # Servicio UI reutilizable para modales de confirmación
├── features/            # Dominios tipo "Páginas" Standalone
│   ├── home/            # Pantalla de bienvenida
│   ├── profile/         # Gestión de perfil de usuario, recortador de avatar (ngx-image-cropper) y progreso de nivel
│   ├── rules/           # Normas de juego y explicaciones de roles
│   ├── setup/           # UI de configuración inicial (sliders de balanceo de partida, inputs de jugadores)
│   ├── play/            # Fase de visualización de cartas y Ruleta CSS para turnos
│   ├── vote/            # Fase de discusión y votación con chat de voz en tiempo real
│   └── results/         # Pantalla final calculando estadísticas de victoria
└── shared/              # Fragmentos pequeños reutilizables (Header, Footer, AuthProfileComponent)
```

## 4. Flujo de Aplicación 
1. **Arranque (Bootstrapping)**: La aplicación arranca enteramente en `main.ts/app.ts` enlazando proveedores troncales de Router, Capacitor y la máquina `TranslateService`.
2. **Setup y Configuración (`/setup`)**: 
   - A través de validaciones, el anfitrión configura la partida seleccionando entre las diferentes dinámicas (Tipo "Palabras", "Preguntas" o "Dibujo"). Si algo en las combinaciones (Modo de juego vs Cantidad de detectives, por ejemplo) es incoherente el slider del Setup no se lo permitirá. 
   - Cuando se verifica llama `GameEngineService.startGame()`, combinando el Tipo de Juego estipulado, asignando roles aleatoriamente, repartiendo palabras señuelo a impostores según el "Game Mode" y movilizando a los usuarios sin demora.
3. **Pilar de Juego (`/play`)**:
   - Componente core gestionado enteramente mediante indexación de array y comprobaciones a `@HostListener` de ratón/pantalla táctil (drag-and-drop de la Carta).
   - Cuando cada usuario devuelve la Carta, el sistema avanza al siguiente hasta que `isRevealPhaseFinished()` se emite a verdadero.
   - En ese punto una Ruleta basada íntegramente en interpolaciones matemáticas de array y duraciones calculadas CSS anima durante 4 segundos quién inicia.
4. **Debate y Sangre (`/vote`)**:
   - Protegido fuertemente bajo la guardia del navegador contra cierres en falso.  
   - En partidas online, se inicializa el **Chat de Voz WebRTC** a través de `VoiceChatService`, conectando al servidor de LiveKit de manera segura para permitir la interacción por voz de los jugadores en la fase de votación.
   - Modales en paralelo abren nuevas opciones condicionadas bajo el modo de la partida (El botón "Resolver" de los Detectives no sale en Partida Normal o Caos sin Detectives).  
   - Según expide la lógica de los votos o penalizaciones, salta el método iterativo `checkWinConditions()` de `GameEngine` para comprobar si existe victoria local y enviarnos por tubo a `router.navigate()`.
5. **Perfil de Usuario (`/profile`)**:
   - Si el usuario está autenticado con Google, puede editar sus datos. La UI permite cambiar el nombre, apellidos, color de avatar e iniciales reactivas en tiempo real.
   - El recortador integrado (`ngx-image-cropper`) procesa fotos locales del dispositivo, las redimensiona a un tamaño ligero de `200x200` y las sube a Firebase Storage para no colapsar la base de datos Firestore.
   - Soporta guardado y sincronización offline en segundo plano (Preferences).
6. **Muro de Resultados (`/results`)**:
   - Lee el final de esa URL y expinta el resultado en función del modo fallado/ganado junto con qué agentes estaban implicados.


## 5. El Corazón (Signals de Motor)
Toda la lógica de *El Impostor* está empaquetada centralmente en el Singleton `GameEngineService`:
- Preserva un gran `players = signal<Player[]>([])` como listado activo general durante una hora de sesión.
- Cada cambio como una inyección de id, marca de flag `isEliminated = true`, modifica al completo las UI circundantes gracias a la función cacheada en `computed()`.

## 6. Sistema Visual de Diseño
- **Tailwind Config**: Colores estandarizados de raíz (Primario->Rosa, Secundario->Cyan) y un CSS index general de trackeo de barras de carga "webkit-scrollbars" teñido de cyan con fondo oscuro (estilizado globalmente).
- **Glassmorfismo**: Estructura de capas creada con múltiples opacidades (`bg-white/10`, `bg-black/30`), un emborronamiento nativo fuerte (`backdrop-blur-md/xl`) y un uso muy pronunciado de brillos por los bordes en el formato drop-shadows y bordes blancos que da volumen a un entorno muy sombrío de fondo.

## 7. Actualizaciones Recientes (v1.1.0)
- **Implementación de Dinámicas de Juego**: Expansión del Core (`GameEngineService`) e interfaz en `/setup` para acomodar la selección entre mecánicas de Palabras, Preguntas y Dibujo como selector principal de partida.
- **Localización Expandida**: La arquitectura de i18n ahora maneja y carga dinámicamente traducciones en FR y CA en las directivas y componentes de configuración.
- **Assets y Medios**: Integración robusta de recursos visuales y logos 3D en la selección de paquetes.

### Versión 1.2.0
- **Integración Firebase (Cloud Presets)**: Adición de `@angular/fire` para el guardado de perfiles de jugadores habituales asociados al usuario de Google y sincronizados en la nube.
- **Optimización de Medios (DOM Canvas)**: Refactor del input file para redimensionar en un Canvas invisible del lado cliente y comprimir a `base64` en JPEG las fotografías subidas para los avatares, evitando cuellos de botella en la base de datos de Firebase.
- **Flujo de Votación Visual**: Modificación del `GameEngineService` y la pantalla `/vote` para transportar el árbol de datos complejos (`photoUrl`) hasta la fase de votación de forma intacta.
- **Modales UI Internos**: Completa purga de las interrupciones nativas del navegador y reimplementación de sistemas de alerta por Signal atados a traducciones puras dentro del componente.

### Versión 1.2.1
- **Mejoras QoL en Diseño Dibuja**: Reestructuración del layout de la pantalla de la pizarra, pasando los selectores de colores y la acción de deshacer antes del temporizador principal. Adición de colores grises y marrones fijos y preestablecidos.
- **Flujo 'Volver a Pintar' y Galería**: Configuración en la pantalla de votación y en memoria (signal multilineal) para que, en modalidades ágiles, los jugadores puedan elegir entre continuar con las capas del lienzo de la ronda anterior o iniciar un borrado completo nuevo, registrando en un paginador interactivo los bocetos anteriores. 
- **Instalación de Librería de Recorte (ngx-image-cropper)**: Se subió a 5MB el límite para avatares y se incorporó de forma nativa la librería más utilizada para recorte en formato base 1:1, asegurando máxima precisión estética y manteniendo en 200px la subida final para evitar carga asincrónica pesada.

### Versión 1.3.0
- **Refactorización de Viewport para Navegadores**: Sustitución global de las métricas `screen` y `100vh` en favor del estándar puro `dvh` (Dynamic Viewport Height) a través de TailwindCSS en todos los micro-componentes para solventar los parpadeos y bandas blancas nativas de iOS Safari y Chrome Android.
- **Construcción de App Nativa**: Modernización arquitectónica enchufando **Ionic Capacitor v8**. Acoplamiento del motor a Angular e inyección directa de un Workflow (`build-android.yml`) en GitHub Actions para el empaquetado autónomo, testeo y compilación del entorno Java 21 y node, emitiendo artefactos `.apk` para consumo inmediato.

### Versión 1.3.1
- **Aesthetic y Metadatos**: Se completó la inyección de Favicon dinámico web, renombrado de etiquetas y generación autónoma de Splash Screens (pantallas de carga) e Íconos adaptados para todo el ecosistema Android mediante IA siguiendo la guía del Glassmorfismo Oscuro Neón.
- **Flujo de Renderizado de GPU**: Refactor del deslizado de cartas de roles en `/play` para inyectar optimización `will-change: transform` e interpolaciones físicas Spring, logrando tirones ultrasuaves a 60fps en pantallas táctiles nativas.
- **Corrección Criptográfica (Login App & DB)**: Refactor integral de la sincronía Capacitor-Firebase Auth para posibilitar el inicio de sesión nativo de Android sin popups, garantizando que el motor de Angular lea las credenciales correctas en tiempo unificado y evite los bloqueos de seguridad de tipo Firestore Fetch Limits.
- **Pipelines App Bundles**: Alteración completa del archivo maestro Cloud de GitHub Actions en YAML, pasando de generar el binario `.apk` a certificar en cada rama Master un archivo opcional `.aab` de publicación optimizada listo para subir a la Google Play Store.

### Versión 1.4.0
- **Rebranding (Deceptra)**: Actualización completa de la identidad del juego hacia el nombre oficial "Deceptra", incluyendo mejoras de la UI visual y renombrado nativo de la app.
- **Publicación en Google Play Console**: Modificación y estabilización definitiva del Application ID de Android (`com.ras.impostorapp`), implementando incrementos de código y permisos restrictivos nativos requeridos para publicación como el de publicidad (`AD_ID`).
- **Automatización Segura de Firmas (PEPK)**: Extensión y resolución profunda en los pipelines de Integración Continua (CI) en GitHub Actions para lidiar con el encriptado automático del Keystore hacia las normativas de Play Store. Integración de la herramienta de cifrado PEPK (Play Encrypt Private Key) salvando colisiones asíncronas del TTY y sintaxis con Java 8.
- **Expansión de Contenido General**: Revisión estética y limpieza de artefactos obsoletos preparatoria para el ciclo de lanzamiento continuo.

### Versión 1.4.1
- **Visualizador de Paquetes**: Integración de modal asíncrono estilo *glassmorfismo* en la configuración inicial, permitiendo previsualizar el contenido (palabras) exacto de cada paquete activo mediante peticiones REST al backend.
- **Mecánica de Cambio Dinámico**: Adición de la acción "Cambiar palabra" en pleno juego (fase play), posibilitando reiniciar la ronda en vivo, resetear la palabra secreta e invocar una nueva distribución pseudo-aleatoria de roles a través del motor `GameEngineService` con un solo clic.
- **Ajustes QoL y de Diseño**: Refinamientos UI/UX en las botoneras de configuración y unificación visual para mantener la responsividad de los componentes de configuración en la versión móvil y tablet.

### Versión 1.4.2
- **Gestión de Suscripciones (Premium)**: Implementación de pantalla nativa de pagos con 3 niveles (Mensual, Trimestral y Anual) utilizando la pasarela nativa vía RevenueCat. Inyección de rutas de acceso desde `/home` y `/setup` bajo el botón "Comprar Premium".
- **Motor Multi-Temas (Theme Service)**: Transición del antiguo switch Binario ("Modo oscuro") hacia un administrador de ecosistemas de color (`ThemeService`), integrando 3 paletas globales con interpolaciones de variables en TailwindCSS: *Neón / Cyberpunk (Principal)*, *Neón 2 (Regalo Premium)*, e *Infantil (Gratis)*.
- **Expansión Visual (Arte por IA)**: Sustitución íntegra de casi 20 ilustraciones de los paquetes y fondos base para homogeneizar el aspecto hacia el *Neon Cyberpunk*, y generación de una alternativa *Infantil* amigable completa.
- **QoL en UI y Anuncios**: Configuración estricta del padding base del navegador Capacitor (`pb-[76px]`) para sortear el overol nativo del banner de Google AdMob y evitar ocultación de botones fijos interactivos. Modificación del Application ID de prueba en AndroidManifest.

### Versión 1.4.3
- **Refinamiento UI Premium y Layout**: Reestructuración del padding global (`pb-[96px]`) para sortear el banner dinámico de AdMob garantizando accesibilidad total a botones flotantes de pie de página en todo el circuito de configuración (`/setup` y sub-vistas). Estandarización de las sombras (`box-shadow`) en botones modales tipo *cancelar/salir* para homogeneizar toda la aplicación.
- **Glassmorfismo 3D Avanzado**: Reinvención de la clase CSS (`.setup-img-box`) responsable de encapsular iconografías dinámicas. Integración de capas difuminadas (`::before`), gradientes radiales excéntricos y refracción lumínica para emular materialidad de cristal reflectante bajo la estética Cyberpunk, parametrizado inteligentemente por `ThemeService` para adaptarse cromáticamente a "Neon 1" (Cyan) y "Neon 2" (Esmeralda/Oro).
- **Hardening Autenticación**: Resolución estructural de los vectores de Firebase Android (`google-services.json`) para soportar correctamente los flujos OAuth nativos del SDK `@capacitor-firebase/authentication` en despliegues físicos `.apk`.
- **Actualizaciones Legales**: Modernización de la política de privacidad expuesta por el Backend para amparar explícitamente los protocolos OAuth2 (Google Login) frente a normativas Play Store.

### Versión 1.4.4
- **Sistema de Feedback In-App**: Integración nativa de un formulario de reporte de errores ("Bugs") y "Sugerencias" en la pantalla de Ajustes. El sistema captura silenciosamente metadatos del dispositivo (SO, Modelo, Versión App) mediante `@capacitor/device` e inyecta los tickets directamente en Firestore (`reports`), abstrayendo al usuario de usar clientes de correo externos.
- **Identidad de Soporte Dedicada**: Despliegue de un correo electrónico oficial de soporte (`support.deceptra@gmail.com`) expuesto en la aplicación y acoplado en las normativas de la política de privacidad.

### Versión 1.4.5
- **Refactorización de Arquitectura UI**: Creación de componentes genéricos `HeaderComponent` y `FooterComponent` para centralizar y estandarizar las cabeceras (con títulos dinámicos y navegación) y pies de página (control de paddings condicionales para Ads) en más de 8 pantallas.
- **Optimización de UX Premium**: El `FooterComponent` inyecta dinámicamente un espaciado reducido (`padding-bottom: 30px`) frente al habitual (`80px`) para suprimir el margen muerto cuando el usuario tiene Premium. Esto centraliza la lógica visual en un solo bloque.
- **Gestión de Back Button**: Implementación del plugin `@capacitor/app` para interceptar la navegación nativa en Android, permitiendo salir de la app en la pantalla `/home`, y protegiendo con modales de advertencia pantallas críticas (Play, Vote, Draw) frente a pulsaciones de hardware de salida accidental.
- **Calibración de Títulos Dinámicos**: En la pantalla de juego (`play.ts`), la cabecera ahora interpola el título de "Rol y palabra" a "¿Quién empieza?" basándose en la fase activa del engine, mejorando la legibilidad.
- **Correcciones Globales de Layout y UI**: Eliminación de contenedores internos con `overflow-y-auto` en favor de permitir scroll global sobre el `body`, previniendo que efectos lumínicos (glassmorfismo, neones) se recorten. Depuración de la grilla de fondo en la sección de Dibujo y ajustes responsive en la titulación de Resultados para evitar derrames en pantallas móviles.
- **Expansión y Refinamiento del Modo Detective**: Actualización de la lógica del juego para exigir un mínimo de 4 jugadores. Rediseño del modal de "Resolver", depurándolo de palabras duplicadas en la lista sugerida e implementando comprobación en tiempo real para bloquear el botón de "Adivinar" hasta que la palabra exista. Paralelización de botones ("Votar" y "Resolver") con nueva iconografía.
- **Localización Completa**: Adición y normalización en los 8 idiomas soportados de las nuevas cadenas para cabeceras y estados del juego.
- **Google Login Nativo (Configuración en desarrollo)**: Ajustes en el cliente para lidiar con `@capacitor-firebase/authentication` requiriendo tokens nativos.

### Versión 1.4.6
- **Hotfix de la versión 1.4.5**: Últimos retoques de UI y el inicio de sesión con Google ya funciona.

### Versión 1.4.7
- **Arquitectura de Carga Centralizada (`UiService`)**: Consolidación de un sistema atómico de gestión de estados de carga utilizando *Signals* en Angular. Se han integrado servicios críticos (`ApiService`, `AuthService`, `ThemeService`, `CloudPresets`, etc.) bajo este patrón para enmascarar transiciones y evitar doble peticiones.
- **Deduplicación de Promesas**: Optimización del `ApiService` para cachear llamadas a la base de datos de paquetes, evitando peticiones redundantes cuando múltiples componentes solicitan los datos simultáneamente.
- **Estandarización de Interfaz (Cabeceras)**: Refinamiento de la posición y estética de los controles de usuario (Login / Perfil) para que estén unificados visualmente a través de las pantallas Home, Rules, Settings y Setup, alojados en la esquina superior derecha bajo el nuevo componente `AuthProfileComponent`.
- **Refinamiento de Responsive & TextOverflow**: Mejora radical del componente `TextHeaderComponent`, implementando truncado dinámico basado en anchos (`font-size: clamp()`) y corrigiendo la herencia de gradientes CSS para que los textos largos se mantengan coloridos, de alto contraste y confinados en una sola línea.
- **Modal de Confirmación de Cierre de Sesión**: Inclusión de un flujo seguro de *Logout* integrado directamente en `AuthProfileComponent`, mejorando la UX al evitar cierres de sesión por pulsaciones accidentales sobre el avatar del perfil.
- **Ajustes de UI en Móviles (AdMob Pushing)**: Inyección dinámica de la clase `.no-pb` a través de un listener de enrutado para anular márgenes de reserva de AdMob en pantallas clave, evitando cortes en la interfaz principal.
- **Mejora del Tema Neon 2**: Integración de filtros SVG nativos (`<feColorMatrix>`) en el `index.html` para re-colorear el tema con precisión óptica a verdes y amarillos, eliminando los tonos azules/rojos del CSS Filter original.

### Versión 1.4.8
- **Optimización de Interfaz para Pantallas Pequeñas**: Resolución de conflictos de superposición de layouts, botones cortados y problemas de espaciado en dispositivos móviles (específicamente en resolución de 360x740).
- **Refactorización de Capas de Fondo y Scroll**: Implementación de una arquitectura `fixed inset-0` separando los fondos estáticos de gradiente (`z-30`) y los contenedores `overflow-y-auto` (`z-40`), solucionando los problemas de recortes o *clipping* del fondo (efecto "corte negro") al hacer scroll.
- **Soporte AdMob Dinámico Avanzado**: Refinamiento de la política de `padding-bottom` universal para asegurar que ningún botón de acción crítica en `Home`, `Play`, `Premium` y `Results` quede tapado o inutilizable por los banners publicitarios.
- **Internacionalización Profunda (i18n)**: Integración masiva de cientos de claves de traducción omitidas previamente. Localización completa de la pantalla "Premium" (planes y botones), "Ajustes" (selección de temas, reportes de bugs, preferencias de hardware), "Setup" (gestión de grupos y creación de paquetes) y "Paquetes Personalizados" a los 10 idiomas.
- **Persistencia de Lenguaje Inteligente**: Inyección y orquestación del `UiService` junto al uso de almacenamiento nativo de Capacitor/Web (`localStorage` / `Preferences`) para garantizar que la selección de idioma no solo muestra transiciones de carga fluidas, sino que persiste y se reanuda correctamente al cerrar y volver a abrir la aplicación.

### Versión 1.4.9
- **Centrado y Ajuste Dinámico de Setup**: Reestructuración del contenedor principal de la pantalla de ajustes de partida, eliminando justificaciones forzadas para anclar de forma natural el contenido al tope, mejorando drásticamente el espacio sobrante en móviles de formato panorámico y pantallas alargadas.
- **Mejora Componente Select (Dropdowns)**: Rediseño completo de los comportamientos de apertura de menús desplegables de tiempo (ahora se abren hacia arriba) y ajuste dinámico inteligente de anchura alineado al margen derecho para evitar solapamientos con los botones.
- **Parametrización de Versión (i18n)**: Integración de lectura directa del `package.json` a través de Angular para inyectar dinámicamente la versión de la app en la pantalla de Ajustes. Todos los archivos `.json` de idioma ahora utilizan la variable `{{version}}`.
- **Auditoría de Traducciones Automática**: Desarrollo de scripts para comparar árboles JSON e inyección automática de claves faltantes de `Setup`, `Draw` y `Play` detectadas en los idiomas Alemán, Catalán y Francés.

### Versión 1.5.0
- **Migración a Capacitor Preferences**: Erradicación del uso de `localStorage` síncrono en favor de `@capacitor/preferences` para toda la persistencia de datos (configuración, tema, idioma y estado del juego), garantizando estabilidad y rendimiento en el entorno móvil nativo.
- **Modernización de UI con Signals y OnPush**: Sustitución de decoradores antiguos (`@Input()`, `@Output()`) por la API moderna de Signals de Angular 21. Implementación transversal de `ChangeDetectionStrategy.OnPush` en componentes modulares y de configuración para maximizar los FPS.
- **Prevención de Fugas de Memoria (Memory Leaks)**: Limpieza y blindaje de todas las suscripciones de RxJS (ej. `results.ts`, `ads.service.ts`) utilizando el operador `takeUntilDestroyed()`.
- **Validación Estricta de Inputs**: Inclusión de límites de caracteres de seguridad para nombres de jugadores (3-15) y palabras de paquetes personalizados (2-30).

### Versión 1.5.1
- **Gestión de Teclado y Banners**: Integración con `@capacitor/keyboard` para auto-ocultar el banner publicitario de AdMob cuando se despliega el teclado del sistema, asegurando que no haya bloqueos de UI (e.g. inputs de texto).
- **Backend Seguro de Reportes**: Creación de un endpoint dedicado (`api/reports`) con Firebase Admin SDK para evadir las restricciones de cliente. Reforzamiento con límite de 1000 caracteres y alerta automática al correo de soporte mediante `nodemailer`.
- **Acceso Premium Manual**: Modificación del `BillingService` para contrastar un flag dedicado en la base de datos (`isPremiumTester`) y conceder privilegios PRO instantáneamente y en remoto a testers seleccionados.
- **Infraestructura Multi-Tema Remoto**: Adecuación exhaustiva en `ThemeService` del motor de persistencia física de descargas asíncronas vía `@capacitor/filesystem`. El servicio ahora sabe interceptar y cachear recursos empaquetados pesados en el almacenamiento del sistema para minimizar el payload base de la app (Programado para v1.5.2).
- **Paridad Estética en Roles**: Corrección de fugas de diseño en la ruleta central y las tarjetas en `play.ts`, forzando dimensiones idénticas (`h-[380px]`) independientemente de si el contenedor aloja el contenido de "Civil" o de "Impostor", evitando "spoilers" en la rotación de pantalla.

### Versión 1.5.2
- **Soporte Completo R2 Cloudflare (Descarga Nativa):** Implementación técnica de alojamiento externo y descarga asíncrona de recursos Premium (temas Infantil, Alien, Manga) para aligerar el bundle nativo. Configuración de reglas CORS e inyección dinámica con `Capacitor.convertFileSrc`.
- **Refactorización de Footer y Espaciado:** Consolidación de la estructura Flexbox para el footer dinámico. Corrección exhaustiva del desbordamiento del box-model en contenedores de botones (`app-button-primary` y `app-button-secondary`) utilizando `flex-1` puro en lugar de anchos forzados, respetando milimétricamente el padding global.
- **Consistencia UI de Estado:** Desacoplamiento estricto del estado seleccionado y guardado de los paquetes y jugadores. Modificación de la pantalla de Jugadores para evitar guardar en la caché visual los cambios no confirmados explícitamente mediante el botón guardar.
- **Correcciones Signals ThemeService:** Depuración de efectos reactivos (`NG0203`) y estados de carga infinitos inyectando bloques `try-finally` que previenen el bloqueo de renderizado en caídas de red.

### Versión 1.5.3
- **Mejoras en el Tema Infantil y Carga:** Rediseño adaptativo y dinámico para el fondo del footer y la pantalla de carga global. Se han eliminado los colores oscuros Cyberpunk fijos (`slate-900` y brillos neón) en favor de variables CSS integradas (`--footer-gradient-via` y `--loading-bg`). En el tema Infantil, ahora el footer se funde sobre celeste claro (`sky-50`) y la pantalla de carga usa un fondo celeste suave (`sky-100` con 95% de opacidad) con brillos y texto en naranja y azul, logrando total coherencia estética.
- **Sincronización Completa de Traducciones (i18n):** Limpieza, depuración y eliminación de claves de traducción obsoletas en todos los idiomas del proyecto, asegurando archivos de traducción sincronizados y consistentes.
- **Incremento de Versión:** Actualización coordinada a la versión `1.5.3` tanto en `package.json` como en `android/app/build.gradle` de Capacitor para la preparación y publicación de la release.

### Versión 2.0.0
- **Sistema de Perfiles de Usuario (`ProfileService` & `ProfileComponent`):**
  - Implementación completa de la pantalla de perfil (`/profile`) con soporte para Google Login usando autenticación de Capacitor Firebase.
  - Creación de un editor de perfil interactivo para modificar apodo, nombre, apellidos y color de avatar de forma reactiva con iniciales dinámicas.
  - Integración del plugin de recorte de imágenes (`ngx-image-cropper`) en el cliente, permitiendo redimensionar fotos de avatares a `200x200` y subirlas a Firebase Storage.
  - Cola de persistencia sin conexión (`impostor_pending_profile_{uid}`) a través de `Preferences` para guardar cambios locales y sincronizarlos cuando vuelva la conexión.
  - Fallback seguro para evitar pantallas de carga infinitas en caso de errores de permisos o fallas de red con Firestore.
- **Chat de Voz Social en Tiempo Real (`VoiceChatService`):**
  - Integración técnica del cliente WebRTC mediante el SDK **LiveKit Client**.
  - Conexión dinámica y automática durante la fase de discusión y votación (`/vote`).
  - Gestión interactiva de estados de micrófono de jugadores, indicación visual de locutor activo (burbujas de audio flotantes) y control deslizante de volumen local de alta responsividad.
- **Sincronización Multijugador Authoritative (`SocketService` & `GameEngine`):**
  - Sincronización del estado de juego multijugador online bidireccional mediante sockets.
  - Autoreconexión silenciosa de salas y restauración del estado de partida tras recargas de página inesperadas.
  - Unificación de identidad de jugadores emparejando la ID del socket con la ID de Google Auth (si están logueados) o UUID de dispositivo local para evitar incoherencias en llamadas WebRTC.
- **Generación de Assets Nativos Multiplataforma:**
  - Regeneración completa de iconos adaptativos y pantallas de carga nativos (iOS y Android) desde el archivo maestro `icon.png` de `1024x1024` píxeles usando Capacitor Assets.
- **Traducción del Botón de Guardado de Perfil:**
  - Corrección de la clave de traducción del botón de guardado en el pie de página (`'SAVE'` en inglés -> `'PROFILE.SAVE'`).
  - Inyección de la clave de traducción `"SAVE"` correspondiente en los 10 ficheros JSON de internacionalización del proyecto.
- **Alineación de Versión y Empaquetado:**
  - Incremento coordinado a la versión `2.0.0` (Android `versionCode 15`, iOS Xcode `2.0.0`).
  - Ejecución de `npx cap sync` para el empaquetado nativo y limpieza de archivos temporales/scripts de depuración obsoletos en `scratch/`.

### Versión 2.1.0
- **Integración de Clave RevenueCat iOS**: Configuración de la clave de producción real (`appl_oluTSHNzbYXkQiXaXQKFVEDEuxB`) en `environment.ts` para habilitar las compras y restauraciones de suscripciones en dispositivos de Apple.
- **Rematch Lobby y Sincronización Multiplayer**: Refactor del flujo online y local post-partida en `/results`. Implementación de ready-check con estados listos de jugadores en tiempo real, sincronización del anfitrión y mitigación de condiciones de carrera al guardar ajustes.
- **Refactorización de Imágenes, Avatares y Marcos**: 
  - Extracción del modal de edición de avatar a un componente compartido y reutilizable `AvatarPickerModalComponent` para simplificar y limpiar código redundante.
  - Recolor físico mediante script de los avatares y marcos para el tema *Neon 2* (reemplazando los filtros CSS incompatibles con multijugador).
  - Eliminación de marcos por defecto para jugadores locales y soporte de visualización sin marcos.
  - Cambio a `object-contain` en marcos de avatar y eliminación de `overflow-hidden` en el recortador de fotos para evitar recortes visuales.
- **Toasts Informativos Temporales**: Sustitución de los modales bloqueantes de éxito por Toasts animados temporales al guardar perfil, presets locales, reportar errores o realizar compras.
- **QoL en UI y Ruleta**: Reducción de fuentes e incremento de padding lateral (`pl-10`) en las etiquetas de la ruleta para evitar que los nombres se solapen con el pin central. Ajuste de espaciados en Settings y micrófono silenciado en tiempo de votación.
- **Aplazamiento de Estadísticas y Logros (v2.2.0)**: Ocultación temporal mediante comentarios de las tarjetas de logros y estadísticas en `/profile`, postergando su activación para el próximo ciclo.

### Versión 2.1.1
- **Actualización de Precios de Temas**: Cambio de los precios de compra individuales de los temas Alien y Manga a 4.99€ en los archivos de traducciones y ajustes.
- **Ignorar Carpetas en Vercel**: Adición de `.vercelignore` para evitar que Vercel intente compilar o procesar las carpetas nativas `android/` e `ios/`.
- **Alineación de Versión**: Incremento a la versión `2.1.1` (Android `versionCode 17`, iOS Xcode `2.1.1`).

### Versión 2.1.2
- **Dinámica de Sockets Multiplayer**: Endpoint de red adaptativo en `SocketService` usando `isDevMode()` para usar localhost en desarrollo local y la URL de producción en Render en compilaciones nativas de producción.
- **Carga de Temas y CDN Fallback**: Exclusión de plataformas nativas Capacitor del bypass de desarrollo local y fallback automático a la CDN pública de Cloudflare R2 si no existen los archivos locales de temas secundarios.
- **Ajuste de Cabecera iOS**: Integración de padding superior dinámico (`env(safe-area-inset-top)`) en `HeaderComponent` para evitar solapes con la Dynamic Island.
- **Control en Login de Apple**: Bloque `try-catch` alrededor del inicio de sesión nativo de Apple para reportar errores visuales en caso de cancelaciones o fallos.
- **Monetización AdMob en Online**: Anuncios intersticiales configurados al salir de la partida online, volver a configuración o cada dos intentos de revancha ("Rematch") para incentivar la compra de Premium.
- **Control de Versiones y Distribución**: Versión establecida en `2.1.2` (Android `versionCode 18`, iOS Xcode `CURRENT_PROJECT_VERSION = 18`).
