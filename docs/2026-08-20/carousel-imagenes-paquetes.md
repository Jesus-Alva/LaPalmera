# Carrusel de imágenes en la página de Paquetes

## Contexto

La página pública de Paquetes (`/package`) ya consumía `images_url` desde la API (`GET /public/packages`, ver `docs/2026-08-20/paquetes-galeria-nosotros-conexion-a-bd.md`), pero `PackagesComponent.tsx` solo renderizaba `pkg.image_url` (la primera imagen), por lo que un paquete con varias imágenes cargadas en el admin solo mostraba una en el sitio público.

## Cambios

### [frontend/components/features/package/PackageImageCarousel.tsx](../../frontend/components/features/package/PackageImageCarousel.tsx) (nuevo)

Componente `'use client'` reutilizable que recibe `images: string[]` y arma un mini-carrusel dentro de un contenedor `absolute inset-0` (para encajar en cualquier contenedor `relative` con `aspect-ratio` ya definido, igual que se hacía con `<Image fill />`):

- Auto-play cada 3.5s cuando hay más de una imagen (mismo criterio de tiempo que `BannerCard.tsx` en el admin).
- Flechas prev/next visibles solo en hover (`opacity-0 group-hover/carousel:opacity-100`), con `stopPropagation()` para no disparar la selección de tarjeta al hacer clic en ellas.
- Indicadores (dots) en la parte inferior.
- Si `images` viene vacío, usa `fallbackSrc` (la imagen por defecto local del paquete), igual que antes.

Este componente replica el mismo patrón visual/técnico ya usado en `BannerCard.tsx` (admin) y `BannerComponent.tsx` (home), adaptado a un tamaño de tarjeta más pequeño.

### [frontend/components/features/package/PackagesComponent.tsx](../../frontend/components/features/package/PackagesComponent.tsx)

- Se agregó el helper `getPackageImages(pkg)`, que devuelve `pkg.images_url` si tiene elementos, o cae a `[pkg.image_url]` si solo hay imagen destacada, o `[]` si no hay ninguna — mismo criterio usado para banners.
- La tarjeta de vista previa (carrusel horizontal de paquetes) y el bloque de imagen del panel de "Detalles del Servicio" ahora usan `<PackageImageCarousel />` en vez de un único `<Image />` estático.
- Se eliminaron el helper `getImageUrl` y el import de `next/image`, que quedaron sin uso al moverse la resolución de URL de imagen dentro del nuevo componente.

## Patrón de arquitectura respetado

Mismo patrón ya establecido para banners: la API pública ya devolvía el arreglo completo `images_url` (no solo la primera imagen); el único cambio necesario fue en la capa de presentación del componente cliente, sin tocar backend ni tipos (`Package.images_url: string[]` ya existía en `src/types/package.ts`).

## Verificación

`tsc --noEmit` no reporta errores nuevos en los archivos tocados. Se confirmó en vivo (contenedor `frontend-la-palmera-dev`) que `/package` responde `200` y el HTML generado incluye el marcado del nuevo carrusel (`group/carousel`).
