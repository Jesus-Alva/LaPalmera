# Fix: Error de formulario anidado en CategorySelector (Galería de imágenes)

## Contexto

Al abrir el modal de subida de imágenes en `gallery_image` y presionar el botón para crear una nueva categoría, la aplicación arrojaba el siguiente error:

```
components/forms/Gallery/CategorySelector.tsx (95:9) @ CategorySelector
```

## Causa raíz

`CategorySelector` renderizaba su propio elemento `<form>` para la creación rápida de categorías. Sin embargo, este componente se usa dentro de `ImageUploadModal.tsx`, el cual ya envuelve todo su contenido en un `<form onSubmit={handleSubmit}>` (línea 100).

HTML no permite anidar elementos `<form>` dentro de otro `<form>`. Esto provoca un error de hidratación/DOM inválido en React, señalado en la línea donde se declaraba el `<form>` interno.

## Solución

Archivo modificado: [frontend/components/forms/Gallery/CategorySelector.tsx](../../frontend/components/forms/Gallery/CategorySelector.tsx)

- Se reemplazó el `<form onSubmit={handleCreateCategory}>` interno por un `<div>` contenedor equivalente, eliminando el anidamiento inválido.
- `handleCreateCategory` ahora acepta un evento opcional (`e?: React.FormEvent`) para poder invocarse tanto desde un submit de formulario como desde un `onClick` directo.
- El input de texto de la nueva categoría maneja la tecla `Enter` mediante `onKeyDown`, llamando a `handleCreateCategory()` y previniendo el comportamiento por defecto.
- El botón "Crear" cambió de `type="submit"` a `type="button"` con `onClick={() => handleCreateCategory()}`, manteniendo el mismo comportamiento (deshabilitado mientras `creating` es `true` o el nombre está vacío).
- El botón "Cancelar" no requirió cambios, ya era `type="button"`.

## Patrón de arquitectura respetado

- Se mantiene el mismo patrón de componentes controlados con `useState` y manejo de errores ya usado en el resto del módulo de Galería (`ImageUploadModal.tsx`, `GalleryImageManager.tsx`).
- No se introdujeron nuevas dependencias ni abstracciones adicionales; el cambio es mínimo y localizado al problema de anidamiento de formularios.

## Impacto

- Se resuelve el error al intentar crear una nueva categoría desde el modal de subida de imágenes.
- No afecta la lógica de negocio ni las llamadas a `createCategory` en `lib/api/gallery.ts`.
