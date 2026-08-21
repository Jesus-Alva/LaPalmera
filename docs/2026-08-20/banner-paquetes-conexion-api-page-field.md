# Banner de Paquetes conectado a la API real (campo `page` en Banner)

## Contexto

En una iteración anterior el banner de la página pública de Paquetes (`components/features/package/BannerComponent.tsx`) se dejó como imagen local estática (`ROUTES_IMAGES.paquetes.src_banner`), documentado como pendiente porque el modelo `Banner` no tenía forma de distinguir a qué página pertenece cada banner (solo existía un banner "genérico" reutilizado en la home).

Se pidió conectar este banner a la API real, igual que se hizo con el banner de la home (`dashboard/page.tsx`). Como esto requería poder diferenciar banners por página, se preguntó al usuario cómo resolver la ambigüedad del modelo genérico; se eligió agregar un campo `page` al modelo `Banner` en vez de reutilizar el mismo banner de home o depender del orden de registro.

## Backend

### [backend/app/model/banner.py](../../backend/app/model/banner.py)

Se agregó la columna `page = Column(String(50), nullable=True)`. Es `nullable` para no romper los banners ya existentes (quedan con `page=NULL`, tratados como el banner "general" que sigue usando la home).

### [backend/migrations/versions/b2c3d4e5f6a7_add_page_to_banner.py](../../backend/migrations/versions/b2c3d4e5f6a7_add_page_to_banner.py) (nueva)

Migración que agrega la columna `page` (String(50), nullable) a la tabla `banner`. Ejecutada con `docker exec fastapi-la-palmera-dev python -m alembic upgrade head` (mismo procedimiento ya usado en `a1b2c3d4e5f6`, porque el host no resuelve el hostname `postgres` del Docker Compose).

### [backend/app/schemas/banner.py](../../backend/app/schemas/banner.py)

`page: Optional[str] = Field(None, max_length=50)` agregado a `BannerBase` (por lo que se hereda en `BannerCreate`/`BannerOut`) y explícitamente a `BannerUpdate`.

### [backend/app/api/v1/endpoint/banners.py](../../backend/app/api/v1/endpoint/banners.py)

`list_banners` y `get_banner` (que arman `BannerOut` manualmente, campo por campo) ahora incluyen `page=banner.page`. `create_banner`/`update_banner` no necesitaron cambios: usan `model_dump()`/`model_dump(exclude_unset=True)`, que ya recogen el nuevo campo del schema automáticamente.

### [backend/app/api/v1/endpoint/public.py](../../backend/app/api/v1/endpoint/public.py)

`GET /public/banners` ahora acepta un query param opcional `page`. Si se envía, filtra `Banner.page == page`; si no se envía (como sigue haciendo la home), el comportamiento es idéntico al de antes — devuelve todos los banners sin filtrar, para no romper nada de lo ya construido.

## Frontend

### [frontend/src/types/banners.ts](../../frontend/src/types/banners.ts)

`Banner.page: string | null` agregado; `BannerCreate`/`BannerUpdate` ganan `page?: string | null`.

### [frontend/lib/api/public.ts](../../frontend/lib/api/public.ts)

`getPublicBanners(params?: { page?: string })` — agrega el query param `page` a la URL cuando se provee.

### [frontend/components/forms/Banners/BannerForm.tsx](../../frontend/components/forms/Banners/BannerForm.tsx)

Se agregó un `<select>` "Página" con las opciones `General (Home / reutilizable)`, `Paquetes`, `Galería`, `Nosotros`, `Contacto` (valores en minúsculas, alineados a las claves ya usadas en `ROUTES_PAGE`). Al guardar, se envía `page: page || null` (explícitamente `null`, no `undefined`, para que al editar un banner y volver a "General" el backend reciba el campo y pueda limpiarlo — `BannerUpdate` en el backend usa `exclude_unset`, que solo actualiza campos presentes en el body).

### [frontend/components/forms/Banners/BannerCard.tsx](../../frontend/components/forms/Banners/BannerCard.tsx)

Se agregó un badge junto al título de la card mostrando `banner.page || 'General'`, para que en el listado del admin sea visible a qué página está asignado cada banner.

### [frontend/app/package/page.tsx](../../frontend/app/package/page.tsx)

Ahora hace `Promise.all` de `getPublicPackages` y `getPublicBanners({ page: "paquetes" })`, y pasa `banners[0] ?? null` como prop `banner` a `BannerComponent`, junto con `fallbackSrc={ROUTES_IMAGES.paquetes.src_banner}` (la imagen local que se usaba antes).

### [frontend/components/features/package/BannerComponent.tsx](../../frontend/components/features/package/BannerComponent.tsx)

Reescrito para recibir `banner: Banner | null` y `fallbackSrc`, con la misma mecánica de carrusel (Framer Motion, autoplay cada 5s, dots) ya usada en el banner de la home:

- Si el banner tiene `images_url` con más de un elemento, se activa el carrusel con esas imágenes.
- Si el banner no tiene imágenes registradas (o no existe ningún banner con `page="paquetes"` todavía), cae a `fallbackSrc` — así la página nunca queda sin imagen mientras el admin no registre un banner para "Paquetes".
- El título y la descripción del banner (`banner?.title`/`banner?.description`) reemplazan al texto i18n (`t("package.banner.title")`/`t("package.banner.slogan")`) solo cuando hay un banner registrado para esta página; si no, se mantiene el copy de marketing existente — mismo criterio ya usado en el banner de la home.

## Patrón de arquitectura respetado

Mismo patrón que el resto de la conexión a BD en esta sesión: la fuente de la verdad es la API pública (`/public/banners`), consumida desde un Server Component (`page.tsx`) vía `lib/api/public.ts`, con el dato real pasado como prop a un Client Component que conserva su interactividad (carrusel, animaciones). La extensión del modelo `Banner` con `page` sigue el mismo estilo ya usado para otros campos opcionales del proyecto (columna `nullable`, migración aislada, campo opcional en los schemas Pydantic).

## Cómo usarlo

Para que el banner de Paquetes muestre contenido propio (y su carrusel si se cargan varias imágenes), un admin debe:
1. Crear o editar un banner en `/banners`.
2. Elegir "Paquetes" en el nuevo selector "Página".
3. Cargar una o más imágenes.

Mientras no se haga esto, la página de Paquetes sigue mostrando la imagen local de respaldo, sin ningún error.

## Verificación

- `tsc --noEmit` no reporta errores nuevos en ninguno de los archivos tocados.
- Migración ejecutada correctamente contra la BD de desarrollo (`a1b2c3d4e5f6 -> b2c3d4e5f6a7`).
- `GET /public/banners` (sin filtro) sigue devolviendo todos los banners igual que antes, ahora incluyendo `page`.
- `GET /public/banners?page=paquetes` devuelve `[]` en este momento (ningún banner fue asignado aún a "Paquetes" en la BD de desarrollo), y `/package` responde `200` mostrando correctamente la imagen de respaldo local, confirmando que el fallback funciona sin errores.
