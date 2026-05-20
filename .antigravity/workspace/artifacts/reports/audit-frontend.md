# Auditoría Técnica: Frontend (Angular 21 / Capacitor)

**Fecha de Auditoría:** 07/05/2026
**Módulo:** `impostor-frontend/src`
**Tecnologías:** Angular 21, Capacitor, TailwindCSS 3.4, Firebase, RxJS

## 1. Arquitectura y Mejores Prácticas (Angular 21)

### Hallazgos Positivos
* **Standalone Components:** El proyecto está adoptando exitosamente la arquitectura moderna; todos los componentes revisados utilizan `standalone: true`. Esto evita la complejidad de los `NgModules`.
* **State Management Moderno:** El servicio núcleo (`game-engine.ts`) ha sido migrado a **Angular Signals**, haciendo un excelente uso de `signal<T>` y `computed()`.

### Deuda Técnica y Desviaciones
* **Uso de Decoradores Legacy:** Existen múltiples componentes en `src/app/shared/components/ui/` y `src/app/features/` que siguen utilizando masivamente `@Input()` y `@Output()` junto con `EventEmitter`.
  * **Acción Correctiva:** Migrar a las nuevas primitivas reactivas `input()`, `input.required()`, `output()` y `model()` para mantener la consistencia con el paradigma Signals impuesto en Angular v20+.
* **Detección de Cambios (Change Detection):** Ningún componente define explícitamente `ChangeDetectionStrategy.OnPush`. 
  * **Riesgo:** Angular sigue ejecutando la verificación de cambios por defecto (sobre todo el árbol de componentes impulsado por Zone.js).
  * **Acción Correctiva:** Implementar `ChangeDetectionStrategy.OnPush` en todos los componentes UI para habilitar un futuro *Zoneless* y mejorar significativamente el rendimiento.
* **Inyección de Dependencias Constante en 'root':** La etiqueta `providedIn: 'root'` se aplica sistemáticamente. Aunque válido para Singletons globales (ej. `ThemeService`), se debe evaluar si todos los servicios requieren este ciclo de vida o si pueden ser de ámbito de componente (Component-scoped).

## 2. Rendimiento y Fugas de Memoria (RxJS)

* **Fugas de Memoria (Memory Leaks):** Se han detectado múltiples suscripciones no gestionadas. Por ejemplo:
  * `settings.ts`: `this.translate.use(lang).subscribe(...)`
  * `results.ts`: `this.route.queryParams.subscribe(...)`
  * `theme.service.ts`: `this.billing.isPremium$.subscribe(...)`
* **Acción Correctiva:** El proyecto carece del uso de `takeUntilDestroyed()`. Todas las suscripciones dentro del contexto de inyección de un componente deben ser envueltas con `takeUntilDestroyed()` o convertidas a Signals usando `toSignal()` para destruir las suscripciones de RxJS automáticamente al desmontarse el componente. Alternativamente, usar el `AsyncPipe` en plantillas.

## 3. Integración con Firebase

* **Secretos Hardcodeados:** Las credenciales del proyecto (como `apiKey`, `appId`, `messagingSenderId`, etc.) están explícitas en texto claro en `src/environments/environment.ts`.
* **Riesgo:** Si bien las keys de Firebase son inherentemente expuestas en clientes frontend web/mobile, el checklist de seguridad establece firmemente que no deben existir secretos *hardcodeados* en el repositorio de código fuente.
* **Acción Correctiva:** Las credenciales deben ser inyectadas mediante variables de entorno en el pipeline de CI/CD al momento de compilación (`ng build`), y es imperativo verificar en **Google Cloud Console** que la `apiKey` tenga restricciones de HTTP Referrers, dominios y APIS específicas (solo para Identity Toolkit o Firestore si corresponde).

## 4. Vulnerabilidades y Checklist de Seguridad

De acuerdo con las reglas globales `security-review.mdc` y `security.mdc`:

* **Insecure Local Storage:** Se está utilizando `localStorage.setItem` y `localStorage.getItem` en `theme.service.ts`, `setup.component.ts` y otros lugares para persistir la configuración (`impostor-theme`, `impostify_lang`) y el estado temporal (`impostorSetupState`).
  * **Riesgo (OWASP):** La API de `localStorage` es sincrónica, no está encriptada y es susceptible a lecturas/escrituras mediante inyecciones XSS.
  * **Acción Correctiva:** Al ser una aplicación empaquetada con **Capacitor**, se debe migrar este almacenamiento al plugin `@capacitor/preferences` (Storage Nativo Seguro), el cual asegura el aislamiento e integridad del dato a nivel de Sistema Operativo (Sandboxing), además de preparar el camino para encriptación de variables si en un futuro se requiere persistir estados sensibles.
* **Sanitización de Inputs:** El uso del Input Binding de Angular (`[property]`, `{{}}`) ofrece protección natural contra XSS. Sin embargo, no se verificó un control explícito sobre la longitud máxima de nombres de usuarios o palabras personalizadas ingresadas en la vista de *Setup Players/Packages*, lo que podría derivar en denegación de servicio a nivel de UI si los strings introducidos son excesivamente grandes.

---
**Conclusión:** La aplicación va en excelente camino de modernización (Signals en core, Standalone, Capacitor 8), pero retiene un conjunto de deudas técnicas de versiones anteriores de Angular (Inputs, Outputs, RxJS libre, CD por defecto) y prácticas de almacenamiento de SPAs de navegador (localStorage directo) que deben ser refinadas para cumplir con los estándares de nivel de Producción y Seguridad de la arquitectura Antigravity.
