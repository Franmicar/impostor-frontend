# Deceptra Design System - Reglas UI

Este documento contiene las reglas y normativas del sistema de diseño **Deceptra Design System**, implementado para mantener una coherencia visual impecable en toda la aplicación bajo los estilos **Neon/Cyberpunk** e **Infantil**.

## 1. Botones (Jerarquía de Acciones)

### 🔵 Botón Primario (`ButtonPrimaryComponent`)
- **Uso**: Acciones principales de la pantalla (ej. "Empezar partida", "Siguiente jugador", "Guardar").
- **Tipografía**: Todo en MAYÚSCULAS (`uppercase tracking-widest`), fuente en negrita (`font-bold`).
- **Estilo**: Fondo con degradado de `primary` a `secondary` (`bg-gradient-to-r from-primary to-secondary`) con efecto de resplandor (`drop-shadow`).
- **Regla Estricta**: **NUNCA** llevan un icono en su interior. Solamente texto.

### ⚪ Botón Secundario (`ButtonSecondaryComponent`)
- **Uso**: Acciones secundarias o de apoyo (ej. "Cambiar palabra", "Volver a pintar", "Ver dibujo").
- **Tipografía**: Formato "Sentence case" (Solo la primera letra en mayúscula).
- **Estilo**: Efecto *Glassmorphism* (`bg-glass border border-glass-border`) con texto color primario o neutro.
- **Regla Estricta**: **SIEMPRE** llevan un icono a la izquierda del texto.

### 🔘 Botones de Icono
- **`IconButtonComponent`**: Botones redondos de tamaño estándar (ej. Botón de "Atrás", "Reglas" o "Ajustes" en el Header). Siempre con fondo glassmorphism.
- **`IconButtonMiniComponent`**: Botones redondos más pequeños, utilizados para acciones secundarias inmediatas (ej. botones de información `(i)`, o los botones de suma y resta `+` / `-`).

---

## 2. Textos y Cabeceras

### 📝 Textos de Encabezado (`TextHeaderComponent`)
- **Uso**: Títulos principales de las pantallas o secciones.
- **Estilo**: Texto transparente con relleno de degradado (`bg-clip-text bg-gradient-to-r from-primary to-secondary`).
- **Sombreado**: Deben incluir un resplandor (`drop-shadow`) con el color primario o secundario para destacar sobre fondos oscuros.

---

## 3. Imágenes y Avatares

### 🖼️ Reglas para Imágenes Generales (Iconos de Setup, Modos, etc.)
- **Estilo**: Neon / Cyberpunk / Brillante.
- **Transparencias**: Las imágenes pueden tener fondos transparentes si el diseño del asset nativo ya incluye el brillo o la forma deseada (como en "Modo de juego").

### 👤 Reglas para Avatares (Jugadores)
- **Forma y Contenedor**: Deben ser **completamente redondos** (`rounded-full`).
- **Bordes**: Deben incluir un borde distintivo (generalmente de color primario o secundario) para diferenciarlos claramente del resto de los elementos de la UI.

---

## 4. Contenedores y Layouts

### 🗂️ Tarjetas y Selectores
- **`CardComponent`**: Utilizado para agrupar información. Siempre debe aplicar *glassmorphism* (`bg-glass`, bordes semitransparentes).
- **`SelectComponent`**: Para todos los menús desplegables nativos, aplicando el estilo unificado de cristal.

---

## 5. Excepciones de Diseño Único
Ciertos elementos críticos tienen diseños hechos a medida que **NO** deben ser forzados a usar los componentes genéricos:
1. **Banner Premium**: Contiene ilustraciones completas, gradientes animados y proporciones únicas.
2. **Botón de VOTAR / ELIMINAR**: Utiliza un degradado rojo/rosa que indica una acción de peligro o crítica, fuera de la jerarquía normal.
3. **Acciones Específicas de Rol**: El botón de "Detective" mantiene un estilo específico de color índigo.
