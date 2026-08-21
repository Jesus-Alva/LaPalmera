# Rediseño de la galería de imágenes (layout masonry)

## Contexto

Se pidió mejorar el diseño de la galería pública (`/gallery`). Se consultó al usuario entre 3 direcciones de layout (masonry tipo Pinterest, grid uniforme mejorado, bento con destacados mixtos) y se eligió **masonry**: columnas con imágenes de distinta altura, respetando su proporción original en vez de recortarlas todas a cuadrado.

## Cambios

### [frontend/components/features/gallery/GalleryImageComponent.tsx](../../frontend/components/features/gallery/GalleryImageComponent.tsx)

- **Layout masonry**: la cuadrícula (`grid grid-cols-* aspect-square`) se reemplazó por columnas CSS (`columns-1 sm:columns-2 lg:columns-3 xl:columns-4`) con cada imagen en `break-inside-avoid` para que no se corte entre columnas. Las imágenes usan `next/image` sin `fill` (con `width={600} height={600}` como placeholder de aspecto) y `className="w-full h-auto object-cover"` — esto es el patrón oficial de Next.js para que la imagen conserve su proporción real en vez de forzarse a un cuadrado.
- **Overlay al hover**: cada imagen ahora muestra un degradado oscuro desde abajo con una etiqueta "Ver imagen" + ícono de lupa (`ZoomIn` de `lucide-react`) que aparece con una transición de opacidad y desplazamiento, además del zoom sutil que ya existía en la imagen.
- **Animación de entrada**: cada imagen aparece con un fade-in + desplazamiento vertical escalonado (`delay` basado en su posición, tope de 8 imágenes para no alargar la espera en galerías grandes). Al cambiar de categoría, el contenedor se remonta (`key={selectedCategoryId}`) para que las nuevas imágenes vuelvan a animarse.
- **Filtro de categorías rediseñado**: los pills ahora usan un indicador de fondo animado compartido (`layoutId="gallery-category-pill"`, con Framer Motion) que se desliza suavemente entre categorías al cambiar de selección — mismo patrón ya usado en el proyecto para indicadores activos (Sidebar del admin, subrayado de la Navbar pública).
- El lightbox (modal de imagen ampliada) no se tocó: sigue funcionando igual, con navegación por teclado, swipe entre imágenes y contador.

## Patrón de arquitectura respetado

No se tocó la lógica de datos (`imagesByCategory`, filtrado por categoría, lightbox): el cambio fue puramente de presentación sobre el mismo componente cliente ya conectado a la API (`categories`/`images` vienen de `getPublicGalleryCategories()`/`getPublicGalleryImages()`, sin cambios). Se reutilizó el patrón de `layoutId` de Framer Motion ya establecido en otras partes del proyecto para indicadores activos animados.

## Verificación

`tsc --noEmit` no reporta errores nuevos. Se confirmó en vivo que `/gallery` responde `200` y el HTML incluye el nuevo layout de columnas y el overlay "Ver imagen".
