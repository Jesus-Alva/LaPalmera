# Paquetes, Galería y Nosotros: conexión de los componentes públicos a la BD real

## Contexto

Continuando el trabajo de `docs/2026-08-20/home-publico-conexion-a-bd.md` (que conectó la home a la BD real y creó el patrón `/public/*` sin autenticación), se pidió aplicar el mismo tratamiento a 3 páginas públicas más: **Paquetes** (`/package`), **Galería** (`/gallery`) y **Nosotros** (`/aboutus`).

## Backend: nuevos endpoints públicos

### [backend/app/api/v1/endpoint/public.py](../../backend/app/api/v1/endpoint/public.py)

Se agregaron 3 endpoints nuevos, mismo criterio que los ya existentes (sin `Depends(get_current_user)`, filtrando `is_active=True` donde el modelo lo soporta, ordenados por `sort_order` donde aplica):

- `GET /public/team-members` — miembros del equipo activos, ordenados por `sort_order, id`. Reutiliza `TeamMemberOut` ya existente.
- `GET /public/gallery/categories` — todas las categorías de galería con su `image_count` (las categorías no tienen `is_active`, así que se listan todas). Reutiliza `GalleryCategoryOut` de `app/schemas/gallery.py` (el schema realmente usado por el endpoint admin `gallery.py`; se confirmó que `app/schemas/gallery_category.py`/`gallery_image.py` son un set de schemas paralelo no usado por ningún router activo, para no confundirlos).
- `GET /public/gallery/images` — todas las imágenes de galería (opcionalmente filtradas por `category_id`, aunque el frontend actual pide todo de una vez).

También se subió el tope máximo de `limit` en `GET /public/packages` de `le=100` a `le=200`, ya que la página de Paquetes muestra el catálogo completo (sin paginación) en un carrusel, a diferencia de la home que solo pedía una muestra.

### [frontend/lib/api/public.ts](../../frontend/lib/api/public.ts)

Se agregaron `getPublicTeamMembers()`, `getPublicGalleryCategories()`, `getPublicGalleryImages()`, y `getPublicPackages()` ahora acepta también `limit` (además de `celebration_id`).

## Paquetes (`/package`)

- [frontend/app/package/page.tsx](../../frontend/app/package/page.tsx): convertido a Server Component async; llama `getPublicPackages({ limit: 200 })` y pasa `packages` a `PackagesComponent`. `BannerComponent` (imagen/título del hero) y `QuestionsComponent` (FAQs) se dejaron **sin cambios**: el primero porque el modelo `Banner` no distingue banners por página (solo hay un banner "principal" reutilizado en la home); el segundo porque no fue parte de lo solicitado y no existe endpoint público de FAQs todavía — ambos siguen siendo contenido de marketing/i18n, igual que se decidió con `ServiceComponent` en la home.
- [frontend/components/features/package/PackagesComponent.tsx](../../frontend/components/features/package/PackagesComponent.tsx): reescrito para recibir `packages: Package[]` (tipo ya existente en `src/types/package.ts`) en vez de leer `t("inicio.partyPackage.packageList")`. El shape anterior de "servicios" (`hrs/food/drinks/carpa/mobiliario/staff/ambiente/parking`, campos fijos) no existe en el modelo real; se reemplazó por iteración genérica sobre `pkg.features` (`feature_key`/`feature_value`) tanto en la vista previa de la tarjeta del carrusel como en la tabla de "Detalles del Servicio" y en el mensaje de WhatsApp generado dinámicamente. La imagen de cada paquete ahora sale de `pkg.image_url` (con fallback a la imagen local por defecto si el paquete no tiene imagen cargada). Toda la mecánica de carrusel/autoplay/swipe táctil se dejó intacta, solo cambió la fuente de datos.

## Galería (`/gallery`)

- [frontend/app/gallery/page.tsx](../../frontend/app/gallery/page.tsx): convertido a Server Component async; hace `Promise.all` de `getPublicGalleryCategories()` y `getPublicGalleryImages()` y pasa ambos arrays a `GalleryImageComponent`. `TitleGalleryComponent` (encabezado de marketing) se dejó sin cambios, no requiere datos de negocio.
- [frontend/components/features/gallery/GalleryImageComponent.tsx](../../frontend/components/features/gallery/GalleryImageComponent.tsx): reescrito para recibir `categories: GalleryCategory[]` e `images: GalleryImage[]` (tipos ya existentes en `src/types/gallery.ts`) en vez de `t("gallery.images")`. Las imágenes se agrupan por `category_id` en memoria (`useMemo`) para mantener el mismo filtrado 100% client-side y el mismo lightbox con animación, navegación por teclado y contador que ya existían — solo cambió de filtrar por un string libre (`category.category`) a filtrar por `category.id` (más robusto), y las URLs de imagen ahora se arman con el helper `getImageUrl` (prefijo del backend) en vez de rutas locales estáticas.

## Nosotros (`/aboutus`)

- [frontend/app/aboutus/page.tsx](../../frontend/app/aboutus/page.tsx): convertido a Server Component async; llama `getPublicTeamMembers()` y lo pasa a `TeamComponent`.
- [frontend/components/features/aboutus/OriginComponent.tsx](../../frontend/components/features/aboutus/OriginComponent.tsx): la sección de "Historia/Origen" no tiene una entidad de negocio equivalente en el backend (no existe un modelo `Origin`/`History`), así que se mantiene como contenido estático de `i18n`. Como la página que lo contiene ahora es un Server Component (no puede usar el hook `useTranslation`, que depende de Contexto de React), se movió la lectura de `t("aboutus.origin", {returnObjects:true})` **hacia adentro del propio componente** (que ya era `'use client'`), eliminando su prop `data` — mismo patrón ya usado en `EspaciosComponent`/`CelebrationsComponent` de la home (el componente hijo posee su propio copy de marketing vía i18n, mientras el padre solo le pasa datos reales de BD cuando aplica).
- [frontend/components/features/aboutus/TeamComponent.tsx](../../frontend/components/features/aboutus/TeamComponent.tsx): reescrito para recibir `teamMembers: TeamMember[]` (tipo ya existente en `src/types/teamMember.ts`) en vez de `data: team` desde i18n. Se corrigieron los nombres de campo que no calzaban con el modelo real (`rol` → `role`, `photo.src/alt` anidado → `photo_path`/`photo_alt` planos), se agregó un ícono de respaldo (`User` de `lucide-react`) cuando un miembro no tiene foto cargada, y el layout pasó de 3 columnas fijas (`w-1/3`, asumía exactamente 3 integrantes) a un `flex flex-wrap` responsivo que se ajusta a cualquier cantidad real de miembros activos. El título/subtítulo de la sección se mantiene en `i18n` (dentro del propio componente), igual que en `OriginComponent`.

## Patrón de arquitectura respetado

- Mismo patrón que la home: página Server Component (`async function Page()`) + `lib/api/public.ts` (sin token) + props reales hacia componentes Client (`'use client'`) que conservan su interactividad.
- Donde no existe entidad de BD (Origin/historia) o no fue parte del alcance pedido (Banners por página, FAQs de Paquetes), el contenido se dejó en `i18n`, pero se reubicó la lectura del hook `useTranslation` hacia el componente hijo para que la página padre pudiera convertirse en Server Component sin romper nada — mismo criterio ya aplicado en la home.
- Los nuevos endpoints públicos de `team-members` y `gallery` replican exactamente la lógica de consulta de los endpoints admin equivalentes (mismos schemas `Out`, mismo criterio de orden), solo removiendo la dependencia de autenticación y agregando el filtro `is_active` donde corresponde.

## Verificación

Se confirmó en vivo (contenedor `frontend-la-palmera-dev`, sin sesión) que las 3 páginas responden `200` sin errores y contienen datos reales de la BD de desarrollo: `/package` muestra "Paquete Con Taquiza", `/gallery` muestra la categoría "Cumpleaños" con sus imágenes, y `/aboutus` muestra al miembro de equipo real "Hugo Vega — Event Planning". `tsc --noEmit` no reporta errores nuevos en ninguno de los archivos tocados.

## Pendiente para una futura iteración

- FAQs de la página de Paquetes (`QuestionsComponent.tsx`) siguen en i18n; existe un modelo `Faq` en el backend pero no hay endpoint público todavía.
- El banner de Paquetes y de Nosotros siguen siendo imagen/texto fijos, ya que el modelo `Banner` no soporta asociarse a una página específica.
- La sección "Historia/Origen" de Nosotros no tiene entidad de backend; requeriría un modelo nuevo si se quisiera gestionar desde el panel admin.
