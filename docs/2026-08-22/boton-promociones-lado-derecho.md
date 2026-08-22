# Pestaña "Ver promociones" con modal de paquetes con fecha establecida

## Contexto

El usuario pidió un segundo botón fijo, simétrico al de "Ver redes sociales" (`SocialBubbles`) pero del lado derecho de la pantalla, con el texto "Ver promociones". Al hacer clic debe abrir un modal con los paquetes que tienen una fecha de disponibilidad configurada — es decir, promociones de temporada, a diferencia de los paquetes permanentes del catálogo.

`Package` ya tenía los campos `date_available_start` / `date_available_end` (opcionales) definidos en el backend (`backend/app/schemas/package.py`) y expuestos por `GET /public/packages`, así que "paquetes con fecha establecida" se traduce directamente en filtrar por `date_available_start != null`. No se necesitaron cambios de backend ni de base de datos.

## Frontend

### [frontend/components/features/package/PromotionsModal.tsx](../../frontend/components/features/package/PromotionsModal.tsx) (nuevo)
Modal que recibe `packages: Package[]` (ya filtrados), `isOpen` y `onClose`. Reutiliza `PackageImageCarousel` para las miniaturas (mismo patrón que `SpaceDetailModal.tsx`) y `framer-motion`/`AnimatePresence` para la animación de apertura/cierre, siguiendo la misma estructura visual (encabezado con barra de color + botón de cerrar, cuerpo con scroll) que ya usan `SpaceDetailModal` y el panel de detalle de `PackagesComponent`. Por cada paquete muestra imagen, título, descripción corta y el rango de fechas formateado (`"10 de diciembre de 2026 - 24 de diciembre de 2026"`, o `"Desde el ..."` si no hay fecha de fin). Si la lista llega vacía, muestra un mensaje en vez de una grilla vacía.

### [frontend/components/ui/PromotionsButton.tsx](../../frontend/components/ui/PromotionsButton.tsx) (nuevo)
Pestaña fija del lado derecho (`fixed inset-y-0 right-0`), con las mismas clases visuales que la pestaña de `SocialBubbles` pero espejadas (`rounded-l-lg` en vez de `rounded-r-lg`). A diferencia de `SocialBubbles` (que despliega un panel de burbujas), este botón abre directamente `PromotionsModal` al hacer clic. Recibe `packages: Package[]` ya filtrados por el padre y no se renderiza si la lista está vacía (no tiene sentido mostrar una pestaña que abre un modal sin contenido).

### [frontend/app/layout.tsx](../../frontend/app/layout.tsx)
`RootLayout` (ya async desde el cambio anterior de `SocialBubbles`) ahora también obtiene `getPublicPackages({ limit: 200 }).catch(() => [])` junto al fetch de `social_networks` (en el mismo `Promise.all`), filtra `packages.filter((pkg) => !!pkg.date_available_start)` y pasa el resultado a `<PromotionsButton packages={promotionalPackages} />`, envuelto en `<AuthCheck>` igual que el resto de los elementos flotantes del sitio público (se oculta en rutas de administración).

## Qué NO se hizo

- No se agregó ninguna acción de "solicitar información" (WhatsApp, formulario, etc.) dentro del modal de promociones — el usuario solo pidió mostrar los paquetes con fecha establecida, no un flujo de contacto adicional.
- No se tocó `/package` ni `PackagesComponent.tsx`: siguen mostrando todos los paquetes (con o sin fecha), la pestaña de promociones es un atajo adicional, no un reemplazo.

## Verificación

- `tsc --noEmit`: sin errores nuevos.
- No había paquetes con fecha establecida en la base de datos de desarrollo, así que se estableció temporalmente una fecha de prueba en un paquete existente (`date_available_start`/`date_available_end`), se confirmó que la pestaña "Ver promociones" y los datos del paquete llegan al HTML del home, y se revirtió el dato al finalizar.
- Se confirmó que sin paquetes con fecha establecida (estado real actual de la BD) la pestaña no se renderiza.
