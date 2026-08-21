# Carrusel en el banner público de Paquetes

## Contexto

El banner de la página pública de Paquetes (`frontend/components/features/package/BannerComponent.tsx`) es distinto al `Banner` gestionable desde el admin (ese modelo no soporta asociarse a una página específica, según quedó documentado en `docs/2026-08-20/paquetes-galeria-nosotros-conexion-a-bd.md`). Este banner usa una imagen local fija definida en `ROUTES_IMAGES.paquetes.src_banner`. Se pidió que, si se registra más de una imagen para este banner, se muestren en carrusel — igual que ya ocurre con el banner de la home (`BannerComponent.tsx` del dashboard, conectado a la BD) y con las cards de banners del admin.

## Cambios

### [frontend/app/constants/routes.ts](../../frontend/app/constants/routes.ts)

`paquetes.src_banner` pasó de ser un `string` único a un arreglo `string[]`. Esto sigue el mismo patrón ya usado en este archivo para otras listas de imágenes estáticas (`inicio.espacios.lvl1/lvl2/lvl3`, que también son arreglos aunque hoy solo tengan un elemento). Para agregar más imágenes al banner de Paquetes en el futuro, solo hay que añadir rutas a este arreglo — no se requiere ningún otro cambio de código.

### [frontend/components/features/package/BannerComponent.tsx](../../frontend/components/features/package/BannerComponent.tsx)

- El prop `srcBanner` ahora acepta `string | string[]` (retrocompatible: si en algún momento se le pasa un string suelto, se normaliza internamente a un arreglo de un solo elemento).
- Cuando el arreglo tiene más de una imagen, se activa un carrusel automático (cada 5s) con transición de crossfade + zoom sutil e indicadores (dots) clicleables en la parte inferior — mismo componente visual y timing que ya se usa en el banner de la home (`components/features/dashboard/BannerComponent.tsx`).
- Con una sola imagen (caso actual), el comportamiento visual es idéntico al anterior: imagen estática sin controles de carrusel.

## Patrón de arquitectura respetado

Se reutilizó exactamente la misma mecánica de carrusel (Framer Motion `AnimatePresence`, `motion.div` con `opacity`/`scale`, dots con `setCurrentIndex`) ya implementada para el banner de la home y las cards de banners del admin, en vez de crear un mecanismo nuevo. La única diferencia es la fuente de las imágenes: en la home vienen de la BD (`banner.images_url`), aquí vienen de una constante local (`ROUTES_IMAGES`), ya que este banner de Paquetes no tiene una entidad de backend asociada.

## Verificación

`tsc --noEmit` no reporta errores nuevos en los archivos tocados. Se confirmó en vivo (contenedor `frontend-la-palmera-dev`) que `/package` responde `200` y sigue mostrando la imagen del banner (`banner-mesas.png`).
