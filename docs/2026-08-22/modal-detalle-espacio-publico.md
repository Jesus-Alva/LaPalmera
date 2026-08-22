# Modal de detalle al hacer clic en un espacio (ruta pública)

## Contexto

En la sección pública "Nuestros espacios" (`/dashboard`), se pidió que al hacer clic en una tarjeta de espacio se despliegue un modal mostrando la información del espacio y todas sus imágenes registradas. Hasta ahora esa sección (agregada en `docs/2026-08-21/carousel-nuestros-espacios.md`) solo mostraba la primera imagen de cada espacio y no era interactiva.

## Backend

### [backend/app/api/v1/endpoint/public.py](../../backend/app/api/v1/endpoint/public.py)
`list_public_spaces` ahora calcula, además de `image_url` (primera imagen, ya existente), un `images_map` con **todas** las imágenes de cada espacio — misma subconsulta con `ROW_NUMBER` ya usada, solo que ahora se agrupan todas las filas en vez de quedarnos solo con `rn == 1`. Se puebla `images_url` en la respuesta, replicando exactamente el mismo patrón que ya tienen `list_public_packages` y `list_public_banners`.

Este campo ya existía en `SpaceOut` (agregado en `docs/2026-08-22/carousel-imagenes-crud-espacios.md` para el CRUD admin); solo faltaba que el endpoint **público** también lo calculara — antes solo se calculaba en el admin (`GET /spaces/`).

## Frontend

### [frontend/components/features/dashboard/SpaceDetailModal.tsx](../../frontend/components/features/dashboard/SpaceDetailModal.tsx) (nuevo)
Modal con el mismo patrón visual ya usado en el proyecto (overlay + tarjeta centrada + cierre al hacer clic fuera, ej. `ImageUploadModal.tsx`, `EditProfileModal.tsx`). Muestra:
- Las imágenes del espacio (`images_url`, con `image_url` como respaldo si `images_url` viniera vacío) usando **`PackageImageCarousel`** — el mismo componente reutilizable ya usado en la página pública de paquetes, con flechas y puntos siempre visibles y autoplay. Se reutilizó tal cual en vez de crear un carrusel nuevo, ya que es genérico (recibe `images: string[]`) y ya vive en `components/features/package/`.
- El título y la descripción completa del espacio debajo de las imágenes.
- Un botón de cerrar (X) superpuesto sobre la imagen.

### [frontend/components/features/dashboard/EspaciosComponent.tsx](../../frontend/components/features/dashboard/EspaciosComponent.tsx)
- Se agregó el estado `selectedSpace` y se renderiza `<SpaceDetailModal space={selectedSpace} onClose={...} />` al final de la sección.
- Cada tarjeta de espacio ahora es clicable (`onClick`, `cursor-pointer`, `role="button"`, `tabIndex={0}` y manejo de `Enter`/`Espacio` para accesibilidad con teclado) y al hacer clic abre el modal con ese espacio.

## Qué NO se hizo

- No se detuvo el recorrido automático del carrusel de tarjetas mientras el modal está abierto: al cerrarlo, el carrusel puede haber avanzado. No se pidió explícitamente pausar el autoplay al abrir el modal, así que se dejó fuera para no ampliar el alcance del cambio; es una mejora sencilla a futuro si se solicita.
- No se agregó navegación entre espacios dentro del propio modal (ej. flechas para pasar al siguiente espacio sin cerrarlo) — solo se pidió mostrar la información e imágenes del espacio seleccionado.

## Verificación

- Verificado por HTTP real: `GET /public/spaces` ahora devuelve `images_url` con todas las imágenes de cada espacio (confirmado con los 4 espacios activos de la base de datos de desarrollo, uno con 4 imágenes).
- `tsc --noEmit` no reporta errores nuevos en `EspaciosComponent.tsx` ni en `SpaceDetailModal.tsx`.
- Verificado en vivo contra `/dashboard`: la página responde `200` y las 3 tarjetas de espacio renderizadas incluyen la clase `cursor-pointer`, confirmando que quedaron clicables.
