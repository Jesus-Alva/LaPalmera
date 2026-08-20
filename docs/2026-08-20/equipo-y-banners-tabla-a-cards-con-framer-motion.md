# Equipo y Banners: de tabla a cards con Framer Motion

## Contexto

Continuando el rediseño iniciado en Spaces (ver `docs/2026-08-19/spaces-tabla-a-cards-con-framer-motion.md`), se solicitó aplicar el mismo tratamiento a los listados de **Equipo** (`/team-members`) y **Banners** (`/banners`): reemplazar la tabla genérica (`DataTable`) por una card por elemento, animada con Framer Motion.

## Decisión de arquitectura

Se replicó exactamente el mismo patrón `EntityCard` + `EntityGrid` + encabezado en la página de servidor, ya establecido para Paquetes y Spaces:

- [frontend/components/forms/Packages/PackageCard.tsx](../../frontend/components/forms/Packages/PackageCard.tsx) / [PackageGrid.tsx](../../frontend/components/forms/Packages/PackageGrid.tsx)
- [frontend/components/forms/SpaceForms/SpaceCard.tsx](../../frontend/components/forms/SpaceForms/SpaceCard.tsx) / [SpaceGrid.tsx](../../frontend/components/forms/SpaceForms/SpaceGrid.tsx)

## Cambios

### Equipo

- Nuevo: [frontend/components/forms/TeamMembers/TeamMemberCard.tsx](../../frontend/components/forms/TeamMembers/TeamMemberCard.tsx) — card de perfil con foto circular (o ícono `User` como placeholder), badge de estado Activo/Inactivo, nombre, rol, orden (`sort_order`) y acciones Editar/Eliminar. A diferencia de Spaces/Banners, el layout es centrado tipo "tarjeta de perfil" en vez de imagen horizontal, acorde a que la foto original ya se mostraba como avatar circular en la tabla.
- Nuevo: [frontend/components/forms/TeamMembers/TeamMemberGrid.tsx](../../frontend/components/forms/TeamMembers/TeamMemberGrid.tsx) — grid responsivo con animación de entrada/salida (`AnimatePresence mode="popLayout"`).
- Eliminado: `frontend/components/forms/TeamMembers/TeamMembersTable.tsx`.
- Modificado: [frontend/app/(dashboard)/team-members/page.tsx](../../frontend/app/(dashboard)/team-members/page.tsx) — se agregó el encabezado (título, contador, botón "Nuevo miembro") que antes generaba `DataTable`, y se reemplazó `TeamMembersTable` por `TeamMemberGrid`.

### Banners

- Nuevo: [frontend/components/forms/Banners/BannerCard.tsx](../../frontend/components/forms/Banners/BannerCard.tsx) — card con imagen (relación de aspecto más ancha, acorde a que un banner es una imagen panorámica), título, subtítulo, descripción y acciones Editar/Eliminar. El tipo `Banner` no tiene campo `is_active`, por lo que no se agregó badge de estado (se respetó el modelo existente sin inventar campos).
- Nuevo: [frontend/components/forms/Banners/BannerGrid.tsx](../../frontend/components/forms/Banners/BannerGrid.tsx) — mismo patrón de grid animado.
- Eliminado: `frontend/components/forms/Banners/BannerTable.tsx`.
- Modificado: [frontend/app/(dashboard)/banners/page.tsx](../../frontend/app/(dashboard)/banners/page.tsx) — mismo tratamiento de encabezado y reemplazo de `BannersTable` por `BannerGrid`.

## Patrón de arquitectura respetado

- Misma estructura `EntityCard` + `EntityGrid` que Packages/Spaces: `motion.div` con `initial/animate/exit/whileHover`, grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, estado vacío con mensaje + enlace de creación.
- Mismo lenguaje visual (`rounded-2xl`, `shadow-lg`/`shadow-xl`, iconografía `lucide-react`, colores `blue-600`/`red-600` para acciones).
- No se tocó la capa de datos (`lib/api/teamMembers.ts`, `lib/api/banners.ts`) ni los tipos `TeamMember`/`Banner`; el cambio es puramente de presentación.

## Impacto

- Los listados de Equipo y Banners ahora se ven como cuadrículas de tarjetas animadas, consistentes visualmente entre sí y con Packages/Spaces.
- Se verificó que no quedaran referencias a los componentes de tabla eliminados en el resto del proyecto.
