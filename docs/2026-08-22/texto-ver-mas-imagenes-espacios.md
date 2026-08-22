# Texto "Ver más imágenes" en las tarjetas de espacios

## Contexto

Sobre el modal de detalle agregado a "Nuestros espacios" (`docs/2026-08-22/modal-detalle-espacio-publico.md`), se pidió agregar un pequeño texto que indique que se pueden ver más imágenes del espacio al hacer clic en la tarjeta — como pista visual de que la tarjeta es interactiva.

## Cambios

### [frontend/components/features/dashboard/EspaciosComponent.tsx](../../frontend/components/features/dashboard/EspaciosComponent.tsx)

Se replicó tal cual el overlay de hover ya usado en la galería (`components/features/gallery/GalleryImageComponent.tsx`, línea 163-169: degradado oscuro desde abajo + cápsula con ícono y texto que sube ligeramente al aparecer), en vez de crear un estilo nuevo:
- La tarjeta ganó la clase `group` para poder controlar el overlay de la imagen vía `group-hover`.
- Se agregó un degradado (`bg-linear-to-t from-black/60 ...`) que aparece sobre la imagen al pasar el mouse, con una cápsula semitransparente con el ícono `Images` (de `lucide-react`) y el texto "Ver más imágenes".
- La imagen ahora también tiene un ligero zoom al hacer hover (`group-hover:scale-105`), igual que en la galería, para reforzar visualmente que la tarjeta es interactiva.

## Verificación

- `tsc --noEmit` no reporta errores nuevos.
- Verificado en vivo contra `/dashboard`: la página responde `200` y el texto "Ver más imágenes" está presente en el HTML renderizado.
