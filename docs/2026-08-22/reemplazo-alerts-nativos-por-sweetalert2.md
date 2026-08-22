# Reemplazo de `alert`/`confirm` nativos por SweetAlert2

## Contexto

El panel de administración (CRUDs de banners, paquetes, espacios, miembros del equipo y galería) usaba los diálogos nativos del navegador `window.confirm(...)` y `alert(...)` para confirmar eliminaciones y mostrar errores. Se pidió reemplazarlos por SweetAlert2, instalado como dependencia nueva del frontend.

## Dependencia

```
npm install sweetalert2
```

Agregada a [frontend/package.json](../../frontend/package.json).

## Helper centralizado: [frontend/lib/alerts.ts](../../frontend/lib/alerts.ts) (nuevo)

Siguiendo el patrón ya establecido de helpers pequeños en `lib/*.ts` (como `lib/whatsapp.ts` o `lib/seo.ts`), se creó un único punto de entrada en vez de llamar a `Swal.fire` directamente en cada componente:

- `confirmAction({ title?, text, confirmButtonText? }): Promise<boolean>` — reemplaza `window.confirm`/`confirm`. Muestra un modal de advertencia con botones "Cancelar" / confirmar (rojo para la acción, gris para cancelar) y devuelve `true` solo si el usuario confirma.
- `showErrorAlert(text: string, title?: string): void` — reemplaza `alert(...)` para mensajes de error.

Como `Swal.fire` es asíncrono (a diferencia de `window.confirm`, que bloquea el hilo), cada función que antes usaba `if (!confirm(...)) return;` de forma síncrona pasó a `if (!(await confirmAction({ text: ... }))) return;`, y las funciones que no eran `async` se marcaron como tales.

## Archivos actualizados

| Archivo | Cambio |
|---|---|
| [components/ui/DataTable.tsx](../../frontend/components/ui/DataTable.tsx) | `handleDelete` (genérico, usado por todas las tablas CRUD que no tienen tarjeta propia) |
| [components/forms/Banners/BannerForm.tsx](../../frontend/components/forms/Banners/BannerForm.tsx) | Confirmación y error al eliminar una imagen del banner |
| [components/forms/Banners/BannerCard.tsx](../../frontend/components/forms/Banners/BannerCard.tsx) | Confirmación y error al eliminar un banner |
| [components/forms/Packages/PackageCard.tsx](../../frontend/components/forms/Packages/PackageCard.tsx) | Confirmación y error al eliminar un paquete |
| [components/forms/Packages/PackageForm.tsx](../../frontend/components/forms/Packages/PackageForm.tsx) | Confirmación al eliminar una imagen del paquete y al cancelar el formulario |
| [components/forms/TeamMembers/TeamMemberCard.tsx](../../frontend/components/forms/TeamMembers/TeamMemberCard.tsx) | Confirmación y error al eliminar un miembro del equipo |
| [components/forms/SpaceForms/SpaceCard.tsx](../../frontend/components/forms/SpaceForms/SpaceCard.tsx) | Confirmación y error al eliminar un espacio |
| [components/forms/SpaceForms/SpaceForm.tsx](../../frontend/components/forms/SpaceForms/SpaceForm.tsx) | Confirmación al eliminar una imagen del espacio |
| [app/(dashboard)/gallery_image/page.tsx](<../../frontend/app/(dashboard)/gallery_image/page.tsx>) | Confirmación y error al eliminar categoría/imagen y al actualizar categoría |

En total se reemplazaron 12 `confirm(...)`/`window.confirm(...)` y 8 `alert(...)`.

## Qué NO se hizo

- No se tocaron los mensajes de error que ya se mostraban con un componente propio en la UI (por ejemplo, el banner rojo inline de `DataTable.tsx` o los `setError(...)` de los formularios) — esos no son diálogos nativos del navegador, así que quedaban fuera del pedido.
- No se agregaron confirmaciones ni alertas nuevas donde no existían antes; es un reemplazo 1 a 1 del mecanismo, no una revisión de qué acciones deberían confirmarse.

## Incidente durante la verificación (no relacionado con el código)

Justo después de `npm install sweetalert2`, los contenedores Docker del proyecto (`frontend-la-palmera-dev`, `fastapi-la-palmera-dev`, `postgres-palmera-dev`, `pgadmin-palmera-dev`) aparecieron caídos con `Exited (255)` simultáneamente — un reinicio del motor de Docker/WSL2, no un fallo de la aplicación (los cuatro contenedores cayeron a la vez, incluida la base de datos, que no tiene relación con este cambio). Se reiniciaron los cuatro contenedores con `docker start`; el estado de la base de datos y de las migraciones de Alembic (`c9d0e1f2a3b4`, la corregida en el cambio anterior) se mantuvo intacto.

## Verificación

- `tsc --noEmit`: sin errores nuevos en ningún archivo modificado.
- Se confirmó con `grep` que no queda ningún `alert(`/`confirm(`/`window.confirm(` en el código de `frontend/`.
- Tras el reinicio de contenedores, se confirmó que `/` y `/package` responden `200` y que el backend (`GET /public/settings/social_networks`) sigue respondiendo correctamente.
