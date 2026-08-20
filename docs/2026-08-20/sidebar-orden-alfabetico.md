# Sidebar: opciones ordenadas alfabéticamente

## Contexto

Se solicitó ordenar alfabéticamente las opciones de navegación del Sidebar.

## Cambio

### [frontend/components/layouts/SideMenu/Sidebar.tsx](../../frontend/components/layouts/SideMenu/Sidebar.tsx)

Se reordenó el arreglo `navItems` (usado por `SidebarItem` para renderizar el menú) según el label visible en español, de la A a la Z:

1. Banners
2. Celebraciones
3. Equipo
4. Espacios
5. FAQs
6. Galería
7. Paquetes
8. Ubicaciones

No se modificaron los `href`, íconos ni el componente `SidebarItem`; únicamente el orden de los elementos del arreglo.

## Patrón de arquitectura respetado

- Cambio puramente de datos/orden sobre la misma estructura `navItems` ya existente; no se tocó la lógica de renderizado, estilos ni comportamiento responsivo del Sidebar.

## Impacto

- El menú lateral ahora presenta sus secciones en orden alfabético, facilitando encontrar cada módulo.
