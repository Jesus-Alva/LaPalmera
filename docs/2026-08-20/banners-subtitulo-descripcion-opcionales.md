# Banners: subtítulo y descripción dejan de ser obligatorios

## Contexto

En el formulario de registro/edición de banners (`/banners/new`, `/banners/:id/edit`), los campos **Subtítulo** y **Descripción** eran obligatorios tanto en el frontend como en el backend. Se solicitó que dejen de serlo, permitiendo crear un banner solo con título (e imagen).

## Cambios

### Backend

#### [backend/app/model/banner.py](../../backend/app/model/banner.py)

- Columnas `subtitle` y `description` cambiaron de `nullable=False` a `nullable=True`.

#### [backend/app/schemas/banner.py](../../backend/app/schemas/banner.py)

- `BannerBase.subtitle` y `BannerBase.description` cambiaron de `str = Field(..., min_length=1, ...)` a `Optional[str] = Field(None, ...)`. Como `BannerCreate` y `BannerOut` heredan de `BannerBase`, ambos ahora aceptan/devuelven estos campos como opcionales sin necesidad de tocar el endpoint (`backend/app/api/v1/endpoint/banners.py`).

#### Migración: [backend/migrations/versions/a1b2c3d4e5f6_make_banner_subtitle_description_nullable.py](../../backend/migrations/versions/a1b2c3d4e5f6_make_banner_subtitle_description_nullable.py)

- Nueva migración de Alembic (head: `707ed385fbf0` → `a1b2c3d4e5f6`) que quita el `NOT NULL` de `banner.subtitle` y `banner.description`, siguiendo el mismo patrón ya usado en `e604c3db38d6_make_package_dates_nullable.py` para Paquetes.
- **Se ejecutó** (`alembic upgrade head`) dentro del contenedor `fastapi-la-palmera-dev` contra la base de datos de desarrollo (`postgres-palmera-dev`), y se verificó con `sqlalchemy.inspect` que ambas columnas quedaron como `nullable=True`.
- Se reinició el contenedor del backend para asegurar que tomara los schemas actualizados.

### Frontend

#### [frontend/src/types/banners.ts](../../frontend/src/types/banners.ts)

- `Banner.subtitle` y `Banner.description` pasaron de `string` a `string | null` (reflejando que el backend ahora puede devolver `null`).
- `BannerCreate.subtitle` y `BannerCreate.description` pasaron a ser opcionales (`subtitle?: string`, `description?: string`).

#### [frontend/components/forms/Banners/BannerForm.tsx](../../frontend/components/forms/Banners/BannerForm.tsx)

- Se quitó el atributo `required` y el asterisco (`*`) de las etiquetas de "Subtítulo" y "Descripción".
- Al construir el payload de creación/actualización, ahora se envía `undefined` en vez de cadena vacía cuando el campo no fue llenado (`subtitle.trim() || undefined`), para no persistir strings vacíos innecesariamente.

No fue necesario modificar `BannerCard.tsx` ni `BannerGrid.tsx` (creados en el rediseño previo a cards): ya manejaban de forma segura la ausencia de subtítulo/descripción con renderizado condicional y el texto de respaldo "Sin descripción".

## Patrón de arquitectura respetado

- Se siguió el mismo patrón ya usado en el proyecto para "hacer un campo opcional": modelo (`nullable=True`) + schema (`Optional[str]`) + migración dedicada, tal como se hizo previamente para `date_available_start`/`date_available_end` en Paquetes.
- No se agregó validación adicional ni lógica nueva más allá de quitar la obligatoriedad solicitada.

## Impacto

- Ahora se puede crear o editar un banner indicando solo el título; subtítulo y descripción son opcionales tanto en la validación del backend como en el formulario del frontend.
