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
   - A través de validaciones, el anfitrión configura la partida. Si algo en las combinaciones (Modo de juego vs Cantidad de detectives, por ejemplo) es incoherente el slider del Setup no se lo permitirá. 
   - Cuando se verifica llama `GameEngineService.startGame()`, asignando roles aleatoriamente, repartiendo palabras señuelo a impostores según el "Game Mode" y movilizando a los usuarios sin demora.
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
- **Tailwind Config**: Colores estandarizados de raíz (Primario->Rosa, Secundario->Cyan) y un CSS index general de trackeo de barras de carga "webkit-scrollbars" teñido.
- **Glassmorfismo**: Estructura de capas creada con múltiples opacidades (`bg-white/10`, `bg-black/30`), un emborronamiento nativo fuerte (`backdrop-blur-md/xl`) y un uso muy pronunciado de brillos por los bordes en el formato drop-shadows y bordes blancos que da volumen a un entorno muy sombrío de fondo.
