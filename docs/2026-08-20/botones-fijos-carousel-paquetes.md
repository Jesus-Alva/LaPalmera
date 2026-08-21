# Flechas fijas en el carrusel de imágenes de Paquetes

## Contexto

Las flechas de siguiente/anterior imagen de `PackageImageCarousel.tsx` solo aparecían al hacer hover (`opacity-0 group-hover/carousel:opacity-100`). Tanto la card de vista previa como el panel de detalle envuelven este carrusel en un contenedor con efecto de zoom al hover (`hover:scale-105` en la card, `group-hover:scale-105` en el panel de detalle), y ese mismo hover que debía revelar las flechas terminaba ocultándolas visualmente.

## Cambios

### [frontend/components/features/package/PackageImageCarousel.tsx](../../frontend/components/features/package/PackageImageCarousel.tsx)

Se quitó la lógica de aparición condicionada a hover (`opacity-0 group-hover/carousel:opacity-100`) de ambas flechas: ahora se muestran siempre que el paquete tenga más de una imagen (`hasMultipleImages`), con fondo semitransparente (`bg-black/50`) para mantenerse legibles sobre cualquier imagen. Se subió su `z-index` (y el de los indicadores/dots) de `z-10` a `z-20` para que queden por encima del contenido incluso cuando el contenedor padre aplica el zoom.

## Patrón de arquitectura respetado

Cambio acotado al mismo componente ya creado para este carrusel (`PackageImageCarousel.tsx`), sin tocar `PackagesComponent.tsx` ni el efecto de zoom existente en las cards/panel de detalle.

## Verificación

`tsc --noEmit` no reporta errores nuevos. `/package` sigue respondiendo `200` sin errores en el contenedor `frontend-la-palmera-dev`.
