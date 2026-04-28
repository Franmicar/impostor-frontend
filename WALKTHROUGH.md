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
│   ├── guards/          # Guardianes de ruta (como 'prevent-exit-guard' para atrapar escapes accidentales en botones Back de navegador)
│   └── services/        # Servicios (Singleton)
│       ├── api/         # Inyección HttpClient a backend remoto para buscar y descargar los paquetes de palabras
│       ├── game-engine/ # Componente Maestro en memoria (Gestión de Roles, votaciones, estado y pases de pantalla)
│       ├── timer/       # Contador asíncrono con observables para dominar la pantalla de votación
│       └── confirm/     # Servicio UI re-aprovechable promesando modales nativos con Tailwind
├── features/            # Dominios tipo "Páginas" Standalone
│   ├── home/            # Bienvenida
│   ├── rules/           # Normas y descripciones funcionales de cada modo
│   ├── setup/           # UI de creación (Sliders lógicos de balanceo, Inputs, Fetch de categorías conjuntas)
│   ├── play/            # Fase vital drag & drop / La Ruleta CSS para el turno de palabra
│   ├── vote/            # Selección mutua contra impostores y ventana de acierto para "Detective"
│   └── results/         # Destino de cierre calculando queryParams
└── shared/              # Fragmentos pequeños reutilizables (Menús de confirmación base)
```

## 4. Flujo de Aplicación 
1. **Arranque (Bootstrapping)**: La aplicación arranca enteramente en `main.ts/app.ts` enlazando proveedores troncales de Router y la máquina `TranslateService`.
2. **Setup y Configuración (`/setup`)**: 
   - A través de validaciones, el anfitrión configura la partida seleccionando entre las diferentes dinámicas (Tipo "Palabras", "Preguntas" o "Dibujo"). Si algo en las combinaciones (Modo de juego vs Cantidad de detectives, por ejemplo) es incoherente el slider del Setup no se lo permitirá. 
   - Cuando se verifica llama `GameEngineService.startGame()`, combinando el Tipo de Juego estipulado, asignando roles aleatoriamente, repartiendo palabras señuelo a impostores según el "Game Mode" y movilizando a los usuarios sin demora.
3. **Pilar de Juego (`/play`)**:
   - Componente core gestionado enteramente mediante indexación de array y comprobaciones a `@HostListener` de ratón/pantalla táctil (drag-and-drop de la Carta).
   - Cuando cada usuario devuelve la Carta, el sistema avanza al siguiente hasta que `isRevealPhaseFinished()` se emite a verdadero.
   - En ese punto una Ruleta basada íntegramente en interpolaciones matemáticas de array y duraciones calculadas CSS anima durante 4 segundos quién inicia.
4. **Debate y Sangre (`/vote`)**:
   - Protegido fuertemente bajo la guardia del navegador contra cierres en falso.  
   - Modales en paralelo abren nuevas opciones condicionadas bajo el modo de la partida (El botón "Resolver" de los Detectives no sale en Partida Normal o Caos sin Detectives).  
   - Según expide la lógica de los votos o penalizaciones, salta el método iterativo `checkWinConditions()` de `GameEngine` para comprobar si existe victoria local y enviarnos por tubo a `router.navigate()`.
5. **Muro de Resultados (`/results`)**:
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
