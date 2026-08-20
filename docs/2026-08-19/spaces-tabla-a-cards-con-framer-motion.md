# Spaces: de tabla a cards con Framer Motion

## Contexto

El listado de espacios (`/spaces`) se mostraba como una tabla genérica (`SpacesTable.tsx` sobre el componente compartido `DataTable`). Se solicitó reemplazarlo por una **card por cada espacio**, con Framer Motion para hacer el diseño más llamativo.

## Decisión de arquitectura

En este proyecto ya existe exactamente este patrón implementado para el módulo de Paquetes:

- [frontend/components/forms/Packages/PackageCard.tsx](../../frontend/components/forms/Packages/PackageCard.tsx) — card individual con `motion.div`, imagen, badge de estado, contenido y acciones.
- [frontend/components/forms/Packages/PackageGrid.tsx](../../frontend/components/forms/Packages/PackageGrid.tsx) — grid responsivo que orquesta las cards y maneja el estado de eliminación.
- [frontend/app/(dashboard)/packages/page.tsx](../../frontend/app/(dashboard)/packages/page.tsx) — encabezado con título, contador y botón "Nuevo".

Se replicó el mismo patrón para Spaces en lugar de inventar uno nuevo, para mantener consistencia entre módulos.

## Cambios

### Nuevo: [frontend/components/forms/SpaceForms/SpaceCard.tsx](../../frontend/components/forms/SpaceForms/SpaceCard.tsx)

Card individual por espacio, adaptada de `PackageCard.tsx` a los campos de `Space` (`title`, `description`, `is_active`, `image_url`):

- Animación de entrada (`initial`/`animate`), salida (`exit`) y elevación al pasar el mouse (`whileHover={{ y: -4 }}`) con `framer-motion`.
- Imagen del espacio (o ícono `ImageOff` como placeholder si no tiene imagen) con badge de estado "Activo"/"Inactivo" superpuesto.
- Título, descripción truncada y acciones de **Editar** (navega a `/spaces/{id}/edit`) y **Eliminar** (con confirmación, llamando a `deleteSpace` y refrescando la ruta), igual que en la tabla anterior.

### Nuevo: [frontend/components/forms/SpaceForms/SpaceGrid.tsx](../../frontend/components/forms/SpaceForms/SpaceGrid.tsx)

Grid responsivo (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) que:

- Recibe `initialSpaces`, mantiene el listado en estado local y quita la card correspondiente cuando se elimina un espacio.
- Usa `AnimatePresence mode="popLayout"` + `layout` para animar la salida de una card eliminada.
- Muestra un estado vacío consistente con el resto de módulos ("No hay espacios creados todavía." + enlace para crear el primero).

### Eliminado: `frontend/components/forms/SpaceForms/SpacesTable.tsx`

Reemplazado por completo por `SpaceGrid.tsx`. Ya no se usa `DataTable` para este listado.

### Modificado: [frontend/app/(dashboard)/spaces/page.tsx](../../frontend/app/(dashboard)/spaces/page.tsx)

- Se agregó el mismo encabezado que usa `packages/page.tsx` (título con emoji, contador de espacios y botón "Nuevo espacio"), ya que antes ese encabezado lo generaba internamente `DataTable`.
- Se reemplazó `SpacesTable` por `SpaceGrid`.

## Patrón de arquitectura respetado

- Misma estructura de componentes que Paquetes: `EntityCard` + `EntityGrid` + encabezado en la página de servidor.
- Mismo lenguaje visual (`rounded-2xl`, `shadow-lg`/`shadow-xl`, badges de estado con `CheckCircle`/`XCircle` de `lucide-react`, botones de acción con los mismos colores `blue-600`/`red-600`).
- No se tocó la capa de datos (`lib/api/spaces.ts`) ni el tipo `Space`; el cambio es puramente de presentación.

## Impacto

- El listado de espacios ahora se ve como una cuadrícula de tarjetas animadas en vez de una tabla, coherente visualmente con el módulo de Paquetes.
- Cualquier otra referencia a `SpacesTable` fue verificada y no quedó ninguna en el proyecto.
