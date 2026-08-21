# Home público: conexión de los componentes de `app/dashboard` a la BD real

## Contexto

La página de inicio pública del sitio (`/`, que reexporta literalmente `frontend/app/dashboard/page.tsx`) renderizaba 6 componentes (`BannerComponent`, `EspaciosComponent`, `CelebrationsComponent`, `ServiceComponent`, `PartyPackageComponent`, `LocationComponent`) con contenido **100% estático**: imágenes fijas de `ROUTES_IMAGES` y textos de traducción (`i18n`) hardcodeados. Ninguno llamaba a `lib/api/*`. Se pidió conectarlos a las APIs/BD real, empezando por esta página.

## Hallazgo bloqueante y decisión

Se investigó primero (agente de exploración) y se confirmó que **ningún** `GET` existente en el backend (banners, spaces, celebrations, packages, locations, team-members, faqs, gallery) es accesible sin sesión: todos dependen de `Depends(get_current_user)`, que siempre exige un usuario válido (header o cookie) y responde `401` en su ausencia. Un visitante anónimo del sitio público no tiene esa sesión.

Se decidió junto con el usuario:
1. **Crear endpoints públicos nuevos** (`/api/v1/public/*`), sin tocar la seguridad de los endpoints administrativos existentes.
2. **Refactorizar** `EspaciosComponent`, `CelebrationsComponent` y `PartyPackageComponent` para iterar listas dinámicas en vez de sus slots fijos actuales.

`ServiceComponent` se dejó sin cambios: no existe una entidad de negocio equivalente en el backend (no hay tabla "servicios"), por lo que crear una está fuera del alcance de esta tarea.

## Backend

### Nuevo: [backend/app/api/v1/endpoint/public.py](../../backend/app/api/v1/endpoint/public.py)

Router de solo lectura, **sin** `Depends(get_current_user)`, con 5 endpoints:

- `GET /public/banners` — todos los banners con su imagen destacada y el arreglo completo de imágenes (mismo patrón de subconsulta `ROW_NUMBER()` que `banners.py`).
- `GET /public/spaces` — solo espacios con `is_active=True`, con su imagen destacada (mismo patrón que `spaces.py`).
- `GET /public/celebrations` — solo celebraciones con `is_active=True`, ordenadas por `sort_order` (campo que ya existía pero no se usaba para ordenar en ningún listado).
- `GET /public/packages` — solo paquetes con `is_active=True`, con imágenes y `features`, ordenados por `sort_order` (mismo patrón que `packages.py`, incluye `celebration_title` vía join). Acepta `celebration_id` opcional para filtrar.
- `GET /public/locations` — solo ubicaciones con `is_active=True`, ordenadas por `sort_order`.

Todos reutilizan los mismos `schemas` `Out` ya existentes (`BannerOut`, `SpaceOut`, `CelebrationOut`, `PackageOut`, `LocationOut`) y los mismos modelos ORM; no se creó ninguna tabla ni columna nueva. Todos aceptan `limit` (por defecto 20, máximo 100) para evitar listados sin cota.

### [backend/app/api/route/api.py](../../backend/app/api/route/api.py)

Se registró `public.router` con prefijo `/public` (`api_router.include_router(public.router, prefix="/public", tags=["Public"])`).

### Verificación

Se probaron los 5 endpoints reales dentro del contenedor `fastapi-la-palmera-dev` sin ningún header de autenticación, confirmando `200 OK` y datos reales (2 banners, 4 espacios, 1 celebración, 1 paquete, 1 ubicación en la BD de desarrollo actual).

## Frontend

### Nuevo: [frontend/lib/api/public.ts](../../frontend/lib/api/public.ts)

Funciones `getPublicBanners`, `getPublicSpaces`, `getPublicCelebrations`, `getPublicPackages(params?)`, `getPublicLocations`, todas sin token, usando `getApiBaseUrl()` (mismo helper ya usado en el resto de `lib/api/*`, que resuelve la URL interna en servidor vs. la pública en cliente) y `cache: 'no-store'` para no servir datos desactualizados del home.

### [frontend/app/dashboard/page.tsx](../../frontend/app/dashboard/page.tsx)

Se convirtió de **Client Component** (`'use client'`, sin datos reales) a **Server Component async**, siguiendo el mismo patrón ya usado en el panel admin (`app/(dashboard)/banners/page.tsx`: Server Component que llama `lib/api` y pasa los datos como props a componentes hijos). Ahora hace `Promise.all` de las 5 llamadas públicas y pasa cada resultado como prop a su componente correspondiente. Los 6 componentes hijos siguen siendo Client Components (`'use client'`) — Next.js permite este anidamiento sin problema.

### Componentes actualizados (todos en `frontend/components/features/dashboard/`)

- **BannerComponent.tsx**: prop cambió de `srcBanner: string` a `banner: Banner | null`. Usa `banner.image_url`, `banner.title` y `banner.description` cuando existen; si no hay banners en BD, cae a la imagen y textos de `i18n`/`ROUTES_IMAGES` como respaldo (para no romper la página si la tabla está vacía).
- **EspaciosComponent.tsx**: prop cambió de `espacios: Espacios` (objeto fijo `lvl1/lvl2/lvl3`) a `spaces: Space[]`. El grid ahora hace `.map()` sobre los espacios activos reales (título, descripción, imagen), en vez de 3 tarjetas quemadas.
- **CelebrationsComponent.tsx**: prop cambió de `src: Celebrations` (2 imágenes) a `celebrations: Celebration[]`. Las 2 imágenes decorativas siguen siendo estáticas (son diseño, no datos de una celebración específica); el bloque de texto ahora itera `celebrations` reales en vez del `.map([1,2,3], ...)` fijo sobre `i18n`.
- **PartyPackageComponent.tsx**: pasó de no recibir props (leía `t("inicio.partyPackage.packageList", {returnObjects:true})`) a recibir `packages: Package[]`. El carrusel (con su lógica de swipe/resize intacta) ahora itera `pkg.features` (genérico `feature_key`/`feature_value`) en vez de los campos fijos `services.hrs/food/carpa/ambiente/parking/mobiliario/staff`.
- **LocationComponent.tsx**: pasó de no recibir props a recibir `location: Location | null`. La dirección se arma con los campos reales (`address_line1`, `address_line2`, `city`, `state`); el botón "Ver en Google Maps" usa `location.google_maps_url` (solo se muestra si existe); se le pasan `lat`/`lng` reales a `MapComponent`.
- **ServiceComponent.tsx**: sin cambios (no hay entidad de backend equivalente).

### [frontend/components/ui/MapComponent.tsx](../../frontend/components/ui/MapComponent.tsx)

Se agregaron props opcionales `lat`/`lng`. Si se reciben, se arma un embed de Google Maps sin API key (`https://maps.google.com/maps?q={lat},{lng}&z={zoom}&output=embed`); si no, conserva el embed fijo que ya tenía por defecto. Esto no afecta su otro uso existente en `/contact` (`InformationComponent.tsx`), que no pasa estas props y sigue mostrando el embed original.

## Patrón de arquitectura respetado

- Los nuevos endpoints reutilizan exactamente la misma lógica de consulta (subconsultas `ROW_NUMBER()` para imágenes, mismos `schemas` `Out`) que ya existía en `banners.py`, `spaces.py`, `packages.py`; solo se les quitó `Depends(get_current_user)` y se agregó el filtro `is_active=True` donde aplica.
- El Server Component `app/dashboard/page.tsx` sigue el mismo patrón "Server Component + `lib/api` + props hacia Client Components" ya usado en todo el panel admin (`app/(dashboard)/*/page.tsx`).
- No se tocó la seguridad de ningún endpoint administrativo existente; los públicos son rutas nuevas y separadas (`/public/*`).

## Impacto

- El home público (`/`) ahora muestra banner, espacios, celebraciones, paquetes y ubicación reales desde la base de datos, verificado end-to-end (HTML servido contiene "La Palmera", "Jardín de entrada", "Bodas de Ensueño", "Paquete Con Taquiza" y "Coacalco" — todos datos reales de BD, sin errores).
- Queda pendiente, para una futura iteración, aplicar el mismo tratamiento a otras páginas públicas (`/package`, `/gallery`, `/aboutus`, `/contact`), que hoy tampoco consumen `lib/api/*`.
