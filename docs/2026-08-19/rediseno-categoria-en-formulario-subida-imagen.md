# Rediseño: Creación de categoría más visible en el formulario de subida de imagen

## Contexto

Se solicitó rediseñar el formulario de subida de imagen (`gallery_image`) para que la creación de categorías tenga mayor protagonismo dentro del flujo, en lugar de quedar oculta detrás de un botón pequeño (`+`).

## Cambios

### [frontend/components/forms/Gallery/CategorySelector.tsx](../../frontend/components/forms/Gallery/CategorySelector.tsx)

Se reestructuró el componente de selección de categoría con un patrón de **selector de modo** (segmented control), en vez del combo + botón de "+" oculto:

- Un control tipo píldora con dos opciones: **"Elegir categoría"** y **"Crear categoría"**, siguiendo el mismo lenguaje visual de pestañas redondeadas ya usado en el resto del módulo de Galería (`rounded-full`, `bg-gray-100`, estado activo en blanco con sombra).
- Modo **"Elegir categoría"**: mantiene el `<select>` existente sin cambios de comportamiento.
- Modo **"Crear categoría"**: ahora se muestra como una tarjeta destacada con borde punteado azul (`border-2 border-dashed border-blue-300`) y fondo `bg-blue-50/60`, coherente con el patrón de "zona de acción" (`border-dashed`) que ya usa `gallery_image/page.tsx` para el estado vacío de imágenes. Incluye:
  - Un ícono distintivo (`Sparkles`) en una insignia circular.
  - Texto de apoyo explicando el propósito ("Organiza tus imágenes creando una categoría a la medida").
  - Input más prominente con placeholder de ejemplo y botón "Crear" con ícono `FolderPlus`.
- Si no existen categorías al cargar el componente, el modo "Crear categoría" se activa automáticamente (no tiene sentido mostrar un selector vacío).
- Al crear una categoría exitosamente, se selecciona automáticamente y el componente vuelve al modo "Elegir categoría".
- Se eliminó el estado `showNewCategory` (booleano) en favor de un estado `mode: 'existing' | 'new'`, más explícito.

### [frontend/components/forms/Gallery/ImageUploadModal.tsx](../../frontend/components/forms/Gallery/ImageUploadModal.tsx)

- Se envolvió `CategorySelector` con un `<label>` ("Categoría *"), igual que el resto de campos del formulario (`Texto alternativo (alt)`), para mantener consistencia visual y de accesibilidad.

## Patrón de arquitectura respetado

- Se mantiene el mismo lenguaje visual del módulo (colores `blue-600`/`blue-50`, bordes punteados para "agregar algo nuevo", píldoras redondeadas para selección de categoría, iconografía de `lucide-react`).
- No se agregaron dependencias nuevas ni se modificó la capa de datos (`lib/api/gallery.ts`); el cambio es puramente de presentación sobre el mismo flujo de estados y llamadas ya existentes.
- Se conserva la corrección previa de formularios anidados (el modo "Crear categoría" sigue sin usar un `<form>` propio).

## Impacto

- La creación de categorías ahora es una acción visualmente prioritaria y auto-explicativa dentro del modal de subida de imagen, sin cambiar la lógica de negocio ni los endpoints consumidos.
