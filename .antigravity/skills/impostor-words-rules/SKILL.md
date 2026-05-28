---
description: Reglas personalizadas, convenciones y preferencias para el proyecto Deceptra
---

# Reglas del proyecto Deceptra

Esta *skill* contiene las reglas y convenciones de obligado cumplimiento para el proyecto de `impostor-words`. Sigue estas directrices estrictamente en todas tus respuestas y acciones mientras trabajes en este proyecto.

## 1. Terminal y Sistema Operativo
- El sistema operativo del usuario es **Windows**.
- La terminal utilizada es **PowerShell**.
- **Regla estricta:** Al encadenar o agrupar la ejecución de múltiples comandos, utiliza **siempre el punto y coma (`;`)**, y **NUNCA utilices el operador `&&`** (ya que fallará en PowerShell). 
  - *Correcto:* `cd mi-carpeta ; npm install`
  - *Incorrecto:* `cd mi-carpeta && npm install`

## 2. Textos e Internacionalización (i18n)
- Todos los textos visibles por el usuario deben usar el sistema de **internacionalización (i18n)**.
- **Regla estricta:** Está prohibido insertar texto estático (hardcoded) directamente en el HTML o en los archivos TypeScript/JavaScript. Añade o reutiliza siempre las claves y archivos de traducción (ej. `.json` de traducciones).

## 3. Git y GitHub
- **Regla estricta:** Todas las nuevas funcionalidades, versiones futuras e implementaciones se deben trabajar siempre en la rama `develop`. Una vez que el código esté completado y testeado, se subirá a la rama principal (`main`), aplicando esto tanto para el repositorio de frontend como para el de backend.
- **Regla estricta:** NO realices operaciones de commit, ni hagas `push` al repositorio de forma automática o proactiva.
- Solo debes añadir (`git add`), realizar el commit (`git commit`) y subir los cambios a GitHub (`git push`) cuando yo, el usuario, **te indique de manera explícita** que lo hagas.
- **Regla estricta (Release de Versiones):** Antes de subir los cambios correspondientes a una nueva versión de la aplicación, es **OBLIGATORIO** dejar anotados todos los cambios en el archivo `WALKTHROUGH.md` y haber incrementado/actualizado la versión en los archivos pertinentes (`package.json` y `android/app/build.gradle`).
- **Regla estricta:** Al realizar operaciones de git o Vercel, ten siempre en cuenta y cerciórate de si estamos trabajando sobre el repositorio del frontend (`/impostor-frontend`) o sobre el de backend (`/impostor-backend`), ejecutando los comandos de manera separada y explícita para cada uno en caso de cambiar ambas partes.

## 4. UI y Alertas
- **Regla estricta:** Queda terminantemente prohibido usar la función nativa `alert()` de JavaScript.
- En su lugar, debes usar siempre los modales personalizados de la propia aplicación o su sistema de notificaciones/dialogs.

## 5. Assets & Imágenes Visuales
- **Regla estricta:** Al generar, referenciar o trasladar cualquier imagen, logo, favicon o screenshot dentro del código del frontend, **SIEMPRE** deben colocarse y rutearse estáticamente dentro de la carpeta `public/` (ej. `public/assets` o `public/icons`). En las configuraciones PWA modernas de Angular no se utiliza `src/assets`.
- **Regla estricta:** Todas las imágenes o logos generados por IA para este proyecto (ya sean para frontend o assets móviles) deben usar indefectiblemente los estándares, paletas y el pipeline de validación descritos en [IMAGE_GENERATION.md](file:///c:/Users/dj_ra/OneDrive/Documentos/Proyectos/impostor-words/impostor-frontend/.antigravity/skills/impostor-words-rules/IMAGE_GENERATION.md).
- **Regla estricta:** Los marcos de avatar (avatar frames) deben seguir los estándares de diseño y de integración técnica especificados en el skill [avatar-frame-design](file:///c:/Users/dj_ra/OneDrive/Documentos/Proyectos/impostor-words/impostor-frontend/.antigravity/skills/impostor-words-rules/avatar-frame-design/SKILL.md) (y detallados en [AVATAR_FRAMES.md](file:///c:/Users/dj_ra/OneDrive/Documentos/Proyectos/impostor-words/impostor-frontend/.antigravity/skills/impostor-words-rules/AVATAR_FRAMES.md)).
- Mantén la estética del proyecto definida en Tailwind: "Glassmorfismo oscuro" con acentos neón ("Rosa Primario" `#f20db9` y "Cyan Secundario" `#0df2f2`), adaptándose cromáticamente según el tema activo siguiendo las fichas artísticas del skill.


## 6. Frontend: Angular & Capacitor (Nueva v1.5.0)
- **Persistencia (Regla estricta):** Está PROHIBIDO usar `localStorage`, `sessionStorage` o cookies para el estado de la aplicación. Debes utilizar siempre **`@capacitor/preferences`** para garantizar la persistencia de los datos nativos en la app móvil.
- **Reactividad:** Utiliza siempre la API de **Signals** de Angular 21 (`input()`, `output()`, `model()`, `computed()`). No utilices los decoradores antiguos como `@Input()` o `@Output()`.
- **Rendimiento UI:** Todo nuevo componente creado debe llevar obligatoriamente `changeDetection: ChangeDetectionStrategy.OnPush` para maximizar el rendimiento renderizado en dispositivos móviles.
- **Fugas de Memoria (RxJS):** Toda suscripción manual (ej. `this.route.queryParams.subscribe()`) debe canalizarse siempre a través de `pipe(takeUntilDestroyed(this.destroyRef))` para prevenir *memory leaks* en los ciclos de vida de la aplicación móvil.
