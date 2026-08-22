# Eliminación de la relación Package ↔ Celebration

## Contexto

Se pidió eliminar por completo la relación entre la tabla `packages` y la tabla `celebrations`. Antes de esta relación, un paquete (`Package`) estaba obligado (`celebration_id NOT NULL`) a pertenecer a una celebración, y el admin exigía seleccionar una al crear/editar un paquete. Se confirmó con el usuario el alcance: eliminación completa (columna + FK + toda la UI relacionada), asumiendo que los paquetes existentes pierden permanentemente su asociación a una celebración.

## Backend

### [backend/app/model/package.py](../../backend/app/model/package.py)
Se eliminó la columna `celebration_id` (con su `ForeignKey('celebrations.id')`) y el `relationship('Celebration', back_populates='packages')`. También se quitó el import `ForeignKey`, ya sin uso.

### [backend/app/model/celebration.py](../../backend/app/model/celebration.py)
Se eliminó el `relationship('Package', back_populates='celebration')` (back-reference) y el import `relationship`, ya sin uso. El resto del modelo `Celebration` (CRUD propio, `/celebrations`) sigue intacto.

### [backend/app/schemas/package.py](../../backend/app/schemas/package.py)
Se quitaron `celebration_id: int` de `PackageBase` (heredado por `PackageCreate`), `celebration_id: Optional[int]` de `PackageUpdate`, y `celebration_title: Optional[str]` de `PackageOut`.

### [backend/app/api/v1/endpoint/packages.py](../../backend/app/api/v1/endpoint/packages.py)
Reescrito para no depender de `Celebration`: se quitó el import, el parámetro `celebration_id` de `list_packages`, el JOIN obligatorio con `Celebration` (tanto en el listado como en creación/edición/consulta individual), la validación "la celebración debe existir" en `create_package`, y los campos `celebration_id`/`celebration_title` en la construcción de todas las respuestas `PackageOut`.

### [backend/app/api/v1/endpoint/public.py](../../backend/app/api/v1/endpoint/public.py)
`list_public_packages` ya no recibe `celebration_id`, ya no hace JOIN con `Celebration` y ya no arma `celebration_title`. El endpoint `/public/celebrations` (que lista celebraciones por sí solas, sin relación a paquetes) no se tocó.

### Migración: [backend/migrations/versions/c3d4e5f6a7b8_drop_celebration_id_from_packages.py](../../backend/migrations/versions/c3d4e5f6a7b8_drop_celebration_id_from_packages.py)
Se detectó que la BD de desarrollo tenía **dos** constraints de FK distintas apuntando a la misma columna (`packages_celebration_id_fkey` de la migración original, y `fk_packages_celebration` de una migración defensiva posterior que no detectó correctamente la primera). La nueva migración elimina ambas con `DROP CONSTRAINT IF EXISTS` (para no fallar en un ambiente donde solo exista una de las dos) y luego elimina la columna `celebration_id` de `packages`. Se ejecutó contra la BD de desarrollo (`b2c3d4e5f6a7 -> c3d4e5f6a7b8`). No se editaron las migraciones históricas — se agregó una nueva, siguiendo el mismo criterio ya usado en migraciones anteriores de esta sesión.

## Frontend

### [frontend/src/types/package.ts](../../frontend/src/types/package.ts)
Se quitaron `celebration_id`/`celebration_title` de `Package`, y `celebration_id` de `PackageCreate`/`PackageUpdate`.

### [frontend/lib/api/packages.ts](../../frontend/lib/api/packages.ts) y [frontend/lib/api/public.ts](../../frontend/lib/api/public.ts)
`getPackages` y `getPublicPackages` ya no aceptan/envían el parámetro `celebration_id`.

### [frontend/components/forms/Packages/PackageForm.tsx](../../frontend/components/forms/Packages/PackageForm.tsx)
Se quitó por completo: la prop `celebrations: Celebration[]` (y su import), el campo `celebrationId` de `FormData`, el `<select>` "Celebración *" del paso 1, y las dos validaciones que exigían seleccionar una celebración antes de avanzar/guardar. Ahora el formulario de paquetes ya no depende en absoluto de la entidad `Celebration`.

### [frontend/components/forms/Packages/PackageTable.tsx](../../frontend/components/forms/Packages/PackageTable.tsx)
Se eliminó la columna "Celebración" de la tabla admin de paquetes.

### [frontend/app/(dashboard)/packages/new/page.tsx](<../../frontend/app/(dashboard)/packages/new/page.tsx>) y [frontend/app/(dashboard)/packages/[id]/edit/page.tsx](<../../frontend/app/(dashboard)/packages/[id]/edit/page.tsx>)
Ya no llaman a `getCelebrations()` ni pasan la prop `celebrations` a `PackageForm`.

## Qué NO se tocó

La entidad `Celebration` en sí (modelo, schema, endpoints CRUD `/celebrations` y `/public/celebrations`, formulario y tabla admin de celebraciones, `CelebrationsComponent.tsx` de la home) sigue funcionando exactamente igual — solo se rompió el vínculo hacia `Package`. Ningún componente público agrupaba paquetes por celebración (confirmado antes de implementar: `PackagesComponent.tsx`, `PartyPackageComponent.tsx` y las páginas `/package` y `/dashboard` ya llamaban a `getPublicPackages()` sin filtrar por celebración), por lo que no hubo que rediseñar ninguna vista pública.

## Verificación

- Migración ejecutada correctamente contra la BD de desarrollo.
- El schema `PackageOut` expuesto en `/openapi.json` ya no incluye `celebration_id` ni `celebration_title`.
- `GET /public/packages` responde `200` con los campos esperados, sin datos de celebración.
- `tsc --noEmit` no reporta errores nuevos (los que aparecen son preexistentes y no relacionados: `register/page.tsx`, `banners/new/page.tsx`, `SidebarItem.tsx`, `AuthCheck.tsx`, `DataTable.tsx`).
- `/package` y `/` (home) responden `200` en vivo sin errores.
