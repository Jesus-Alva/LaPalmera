# Banners: carrusel de imágenes en las cards (como en Paquetes)

## Contexto

Las cards de Banners (`BannerCard.tsx`) solo mostraban una imagen (la "destacada"), aun cuando un banner tuviera varias imágenes cargadas en su catálogo. Se solicitó que, si un banner tiene más de una imagen, se muestren en un carrusel dentro de la card, igual que ya ocurre en las cards de Paquetes (`PackageCard.tsx`).

## Decisión de arquitectura

El carrusel de `PackageCard.tsx` depende de que el backend entregue **todas** las imágenes del paquete en un arreglo (`images_url: string[]`), no solo la primera. Los banners, en cambio, solo exponían `image_url` (la primera imagen). Se replicó exactamente el mismo patrón dato+UI que ya existe para Paquetes:

- Backend: agregar `images_url` a la respuesta de banners, construido igual que en `packages.py` (subconsulta con `ROW_NUMBER()` particionada por catálogo, agrupando todas las imágenes).
- Frontend: agregar `images_url` al tipo `Banner` y reutilizar la lógica de carrusel de `PackageCard.tsx` (autoplay, flechas, dots) en `BannerCard.tsx`.

## Cambios

### Backend

#### [backend/app/schemas/banner.py](../../backend/app/schemas/banner.py)

- Se agregó `images_url: Optional[List[str]] = []` a `BannerOut`, análogo a `PackageOut.images_url`.

#### [backend/app/api/v1/endpoint/banners.py](../../backend/app/api/v1/endpoint/banners.py)

- `list_banners`: la subconsulta que antes solo tomaba la primera imagen (`rn == 1`) ahora se recorre completa para construir `images_map` (todas las imágenes por banner) además de `first_image_map` (la destacada), igual que en `list_packages` de `packages.py`. Se agregó `images_url=images_map.get(banner.id, [])` a la respuesta.
- `get_banner`: antes retornaba el objeto ORM `Banner` directamente (sin imágenes). Ahora construye explícitamente un `BannerOut`, consultando el catálogo de imágenes del banner y devolviendo tanto `image_url` (la primera) como `images_url` (todas), igual que hace `get_package` en `packages.py`.
- Se aplicó y verificó que la app FastAPI importa correctamente tras el cambio; no se requirió una nueva migración porque no se tocó el esquema de base de datos, solo la forma de armar la respuesta.

### Frontend

#### [frontend/src/types/banners.ts](../../frontend/src/types/banners.ts)

- Se agregó `images_url?: string[];` a la interfaz `Banner`.

#### [frontend/components/forms/Banners/BannerCard.tsx](../../frontend/components/forms/Banners/BannerCard.tsx)

- Se replicó la lógica de carrusel de [PackageCard.tsx](../../frontend/components/forms/Packages/PackageCard.tsx): estado `currentImageIndex`/`isAutoPlaying`, autoplay cada 3s vía `useEffect`, navegación `goPrev`/`goNext`/`goToImage` (pausando el autoplay 5s tras interacción manual), transición de imagen con `AnimatePresence mode="wait"`, flechas (`ChevronLeft`/`ChevronRight`) visibles al hacer hover, y puntos indicadores en la parte inferior.
- El carrusel solo se activa (muestra flechas y dots) cuando `imageList.length > 1`; con una sola imagen se comporta igual que antes.
- `imageList` se calcula como `banner.images_url` si trae datos, o cae a `[banner.image_url]` como respaldo (compatibilidad si el backend aún no hubiera sido desplegado con el cambio), o arreglo vacío si no hay ninguna imagen (se muestra el ícono `ImageOff` como antes).

No fue necesario tocar `BannerGrid.tsx` ni `lib/api/banners.ts`: el primero solo orquesta las cards, y el segundo ya reenvía el JSON del backend tal cual, por lo que `images_url` llega sin cambios adicionales.

## Patrón de arquitectura respetado

- Mismo patrón dato (subconsulta con `ROW_NUMBER()` + `images_map`) y mismo patrón UI (carrusel con autoplay/flechas/dots) ya usados en Paquetes; no se inventó un mecanismo nuevo.
- No se modificó el modelo de base de datos ni se agregó una migración, ya que `images_url` es una propiedad calculada en la respuesta, no una columna.

## Impacto

- Los banners con más de una imagen ahora muestran un carrusel automático en su card, idéntico en comportamiento visual al de las cards de Paquetes.
