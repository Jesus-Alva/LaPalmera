# Banner del home público: carrusel cuando hay más de una imagen

## Contexto

`BannerComponent.tsx` (conectado a la BD en `docs/2026-08-20/home-publico-conexion-a-bd.md`) solo mostraba `banner.image_url`, la primera imagen del banner activo, aunque el banner tuviera más imágenes cargadas (`banner.images_url`). Se pidió que, si el banner tiene más de una imagen, se muestren en un carrusel con un efecto amigable.

## Cambio

### [frontend/components/features/dashboard/BannerComponent.tsx](../../frontend/components/features/dashboard/BannerComponent.tsx)

- Se agregó estado `currentIndex` y un `useEffect` que avanza automáticamente cada 5 segundos cuando `banner.images_url` tiene más de una imagen (`hasMultipleImages`). Si solo hay una imagen (o ninguna en BD), se comporta igual que antes.
- La transición entre imágenes usa `framer-motion` (`AnimatePresence` + `motion.div`): crossfade de opacidad (1.2s) combinado con un zoom lento y sutil (`scale: 1.06 → 1` en 5s, efecto "Ken Burns"), pensado para un banner de héroe a pantalla completa — un efecto más suave/ambiental que el carrusel con flechas usado en las cards del panel admin (`PackageCard.tsx`/`BannerCard.tsx`), acorde a que aquí es la pieza visual principal del sitio.
- Se agregaron indicadores (puntos) en la parte inferior de la sección, solo visibles cuando hay más de una imagen, permitiendo saltar manualmente a una imagen específica sin interrumpir el auto-avance.
- `images` se calcula como `banner.images_url` si tiene datos, o cae a `[banner.image_url]`, o a arreglo vacío (mostrando la imagen local por defecto `ROUTES_IMAGES.dashboard`) si no hay banner en BD — mismo criterio de respaldo ya usado en el resto del componente.

## Patrón de arquitectura respetado

- Se reutilizó `framer-motion`, ya usado en todo el proyecto (`Sidebar`, `NavbarComponent`, `PackageCard`, `BannerCard` del panel admin) para animaciones de carrusel y transición.
- No se tocó el backend ni `lib/api/public.ts`: el endpoint `/public/banners` ya devolvía `images_url` completo (agregado previamente para el carrusel de `BannerCard.tsx` en el panel admin), por lo que este cambio es puramente de presentación en el componente público.

## Impacto

- El banner del home ahora reproduce automáticamente todas las imágenes del banner activo (verificado con un banner real de 2 imágenes en la BD de desarrollo), con una transición suave, en vez de mostrar solo la primera.
