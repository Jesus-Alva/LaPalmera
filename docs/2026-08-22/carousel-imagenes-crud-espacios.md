# Carrusel de imágenes múltiples en el CRUD de Espacios

## Contexto

En el CRUD de Espacios (`/spaces`) se pidió agregar soporte de múltiples imágenes con carrusel: en el listado, mostrar un carrusel cuando un espacio tiene varias imágenes; en el formulario de actualizar, mostrar todas las imágenes actuales, permitir eliminarlas o agregar nuevas, y que si no se modifican queden exactamente igual. Se implementó replicando el mismo patrón arquitectónico ya usado para Paquetes y Banners (modelo `ImagesCatalog`/`Image` compartido + router genérico `/images` + gestión de imágenes separada del guardado de los datos del espacio), en vez de crear un mecanismo nuevo.

## Hallazgo previo: código duplicado y con bug

Antes de implementar, se encontró que el manejo de imágenes de Espacios ya tenía **tres implementaciones parciales y en conflicto**:
1. `backend/app/api/v1/endpoint/spaces_images.py`: router registrado con el mismo prefix `/spaces` que `spaces.py`, con rutas duplicadas (`POST /spaces/{id}/images`) de firma distinta — nunca se ejecutaba realmente porque `spaces.py` se registraba primero en `api.py`.
2. `backend/app/api/v1/endpoint/spaces.py` (líneas 169–282, ahora eliminadas): endpoints propios de una sola imagen por request, con un bug evidente (`package_id=1, banner_id=1, # Temporal`) que habría contaminado el catálogo de un espacio si esos IDs hubieran existido.
3. Frontend: `SpaceImageGallery.tsx` e `ImageUpload.tsx` (en `SpaceForms/`), ninguno de los dos importado por `SpaceForm.tsx` — código muerto que consumía el endpoint roto de una sola imagen.

Ninguna de las tres estaba realmente en uso: `SpaceForm.tsx` subía imágenes nuevas usando ya el router genérico `/images` (`getOrCreateCatalog` + `uploadImage`), pero no cargaba ni permitía eliminar las existentes. Se eliminaron las tres implementaciones muertas/rotas para dejar una sola vía, igual que en Paquetes y Banners.

## Backend

### [backend/app/schemas/space.py](../../backend/app/schemas/space.py)
Se agregó `images_url: Optional[List[str]] = []` a `SpaceOut`, igual que `PackageOut`/`BannerOut`.

### [backend/app/api/v1/endpoint/spaces.py](../../backend/app/api/v1/endpoint/spaces.py)
Reescrito siguiendo exactamente el patrón de `packages.py`:
- `list_spaces`: ahora arma un `images_map` (todas las imágenes por espacio) además del `first_image_map` existente, vía la misma subconsulta con `ROW_NUMBER`, y puebla `images_url` en la respuesta.
- `get_space`/`update_space`: construyen `SpaceOut` explícito con `image_url` (imagen destacada) calculado desde el catálogo — igual que `get_package`/`update_package`. `images_url` no se recalcula ahí (queda en `[]`, el valor por defecto): el formulario de edición obtiene las imágenes existentes por separado vía el catálogo (`getCatalogBySpace`), exactamente como ya hace `PackageForm.tsx` con `getCatalogByPackageId` — es el mismo comportamiento (aunque con la misma limitación) que ya existía para Paquetes.
- Se eliminaron los endpoints `GET/POST/DELETE /{space_id}/images` (la implementación rota con el bug de IDs temporales) — la gestión de imágenes de un espacio ahora depende 100% del router genérico `/images` (`/images/catalogs/space/{space_id}`, `/images/upload`, `/images/{image_id}`), que ya soportaba `space_id` desde su diseño original y ya usan Paquetes/Banners para sus propias entidades.
- **Importante para "si no se modifica, que se quede igual"**: `update_space` solo toca los campos que vienen en el `PATCH`/`PUT` (`exclude_unset`); nunca toca imágenes. Las imágenes se eliminan/agregan mediante llamadas independientes al router `/images`, disparadas únicamente por acciones explícitas del usuario en el formulario (marcar para eliminar / seleccionar nuevos archivos). Si el usuario no toca la sección de imágenes, no se dispara ninguna llamada relacionada con imágenes y estas permanecen exactamente igual.

### [backend/app/api/v1/endpoint/spaces_images.py](../../backend/app/api/v1/endpoint/spaces_images.py)
Eliminado por completo (router duplicado/roto, nunca se ejecutaba).

### [backend/app/api/route/api.py](../../backend/app/api/route/api.py)
Se quitó el import y el registro de `spaces_images`.

## Frontend

### [frontend/src/types/space.ts](../../frontend/src/types/space.ts)
`Space` gana `images_url?: string[]`.

### [frontend/lib/api/spaces.ts](../../frontend/lib/api/spaces.ts)
Se eliminaron `uploadSpaceImage`, `deleteSpaceImage`, `getSpaceImages` (llamaban a los endpoints rotos que ya no existen).

### [frontend/components/forms/SpaceForms/SpaceImageGallery.tsx](../../frontend/components/forms/SpaceForms/SpaceImageGallery.tsx) e [ImageUpload.tsx](../../frontend/components/forms/SpaceForms/ImageUpload.tsx)
Eliminados: eran código muerto (no importados por `SpaceForm.tsx`) que dependía del endpoint roto.

### [frontend/components/forms/SpaceForms/SpaceForm.tsx](../../frontend/components/forms/SpaceForms/SpaceForm.tsx)
Reescrito siguiendo el mismo patrón de gestión de imágenes de `PackageForm.tsx`:
- Al editar, un `useEffect` llama a `getCatalogBySpace(id)` (de `lib/api/images.ts`, ya existente) y muestra todas las imágenes actuales en una cuadrícula, cada una con un botón de eliminar (aparece al pasar el mouse).
- Eliminar una imagen existente la marca en `imagesToDelete` y la retira visualmente de inmediato; el borrado real (`deleteImage`) ocurre al enviar el formulario.
- Se pueden seleccionar nuevas imágenes (input múltiple o arrastrar y soltar), que se previsualizan y se pueden quitar antes de guardar.
- Al enviar: (1) actualiza los datos del espacio, (2) elimina las imágenes marcadas —si las hay—, (3) sube las imágenes nuevas —si las hay— vía `getOrCreateCatalog` + `uploadImage`. Si no se marcó ninguna imagen para eliminar ni se seleccionó ninguna nueva, ninguno de esos dos pasos se ejecuta y las imágenes existentes quedan intactas.

### [frontend/components/forms/SpaceForms/SpaceCard.tsx](../../frontend/components/forms/SpaceForms/SpaceCard.tsx)
La tarjeta de cada espacio en el listado del CRUD (`/spaces`) ahora muestra un carrusel cuando tiene más de una imagen: autoplay cada 3 segundos, flechas anterior/siguiente que aparecen al pasar el mouse, y puntos indicadores clicleables (con pausa temporal de 5s del autoplay al interactuar) — el mismo patrón ya usado en `PackageCard.tsx` para el listado de Paquetes, replicado tal cual para mantener la consistencia visual entre ambos módulos del panel de administración.

## Qué NO se hizo

- No se tocó la sección pública "Nuestros espacios" (`EspaciosComponent.tsx`, agregada en un cambio anterior) para mostrar el carrusel de imágenes de cada espacio ahí — esta tarea se limitó explícitamente al CRUD (panel de administración). Esa sección pública sigue mostrando solo `image_url` (la primera imagen) por espacio.
- No se agregó capacidad de reordenar imágenes (drag to reorder) ni de marcar una imagen específica como "destacada" — el orden sigue siendo por ID de subida (la más antigua es la destacada), igual que en Paquetes/Banners.
- No se agregó `images_url` a `list_public_spaces` (`backend/app/api/v1/endpoint/public.py`), que sigue devolviendo solo `image_url`, por la misma razón (fuera del alcance de "CRUD de espacios").

## Verificación

Probado por HTTP real contra la base de datos de desarrollo (con la cuenta admin real):
- Crear un espacio de prueba → `images_url: []`.
- Subir 2 imágenes vía el catálogo del espacio → `images_url` las devuelve ambas, `image_url` apunta a la primera.
- Eliminar una imagen → `images_url` refleja solo la restante.
- Actualizar el espacio cambiando únicamente `is_active` (sin tocar imágenes) → la imagen restante sigue intacta, confirmando "si no se modifica, que se quede igual".
- Espacio y sus imágenes de prueba eliminados al finalizar.
- Verificado en vivo: `/spaces` (listado) y `/spaces/3/edit` (un espacio real con 4 imágenes) responden `200`.
- `tsc --noEmit` no reporta errores nuevos (los existentes son los mismos problemas preexistentes ya documentados en cambios anteriores: `Variants` de Framer Motion, `token` prop, `pathname` posible `null`, módulo faltante en `DataTable.tsx`).
- `python -c "from app.api.route.api import api_router"` dentro del contenedor confirma que el backend importa sin errores tras eliminar `spaces_images.py`.
