# Carga múltiple de imágenes en la Galería

## Contexto

El modal de subida de imágenes (`gallery_image`) solo permitía seleccionar y registrar **una imagen a la vez**. Se solicitó permitir registrar varias imágenes en una sola operación.

## Decisión de arquitectura

El backend (`backend/app/api/v1/endpoint/gallery_images.py`) expone un endpoint de subida **de un solo archivo por request** (`file: UploadFile = File(...)`). En vez de modificar el contrato del endpoint para aceptar `List[UploadFile]`, se replicó el patrón que **ya existe en este mismo proyecto** para el módulo de Espacios:

- [frontend/components/forms/SpaceForms/ImageUpload.tsx](../../frontend/components/forms/SpaceForms/ImageUpload.tsx) selecciona múltiples archivos (`<input type="file" multiple>`) y sube cada uno por separado llamando al endpoint singular en paralelo con `Promise.all`, actualizando el estado local por cada imagen subida.

Se siguió el mismo patrón para la Galería, evitando tocar el backend y manteniendo consistencia con el resto del código.

## Cambios

### [frontend/components/forms/Gallery/ImageUploadModal.tsx](../../frontend/components/forms/Gallery/ImageUploadModal.tsx)

- El estado pasó de `file: File | null` / `preview: string | null` a `pendingFiles: { file: File; preview: string }[]`, permitiendo acumular varias imágenes seleccionadas antes de subir.
- El input de archivo ahora tiene el atributo `multiple` y permite seguir agregando imágenes en llamadas sucesivas (se concatenan al arreglo existente en lugar de reemplazarlo).
- La previsualización cambió de una sola caja a una **cuadrícula de miniaturas** (`grid grid-cols-3 sm:grid-cols-4`), cada una con botón para quitarla individualmente antes de enviar, más una casilla "Añadir" para seguir sumando imágenes.
- `handleSubmit` ahora sube todas las imágenes pendientes en paralelo usando `Promise.allSettled`, reutilizando la función existente `uploadImage` de `lib/api/gallery.ts` (sin cambios en esa función ni en el backend) una vez por cada archivo, con el mismo `category_id` y `alt_text` seleccionados en el formulario.
- Se agregó un contador de progreso (`Subiendo X/Y`) en el botón de envío.
- Manejo de resultados parciales: si algunas imágenes fallan y otras no, se notifica el éxito parcial (`onSuccess()`), se muestra un mensaje con el conteo de fallos y **se conservan en el formulario solo las imágenes que fallaron** para poder reintentarlas, liberando las URLs de previsualización (`URL.revokeObjectURL`) de las que sí se subieron correctamente.
- Se liberan las URLs de objeto (`URL.revokeObjectURL`) al quitar una imagen de la previsualización o al cerrar/reiniciar el modal, para evitar fugas de memoria del navegador.

## Patrón de arquitectura respetado

- No se modificó el backend ni el contrato del endpoint `/gallery/images` (sigue aceptando un archivo por request), manteniendo el mismo patrón multi-request-en-paralelo ya usado en `ImageUpload.tsx` para Espacios.
- Se mantiene el lenguaje visual ya usado en el módulo (cuadrícula de miniaturas estilo `page.tsx`, bordes punteados para zonas de carga, colores `blue-600`).

## Impacto

- Los usuarios pueden seleccionar y subir varias imágenes a la vez a una misma categoría, con previsualización, opción de quitar imágenes antes de confirmar, y reintento de las que fallen.
