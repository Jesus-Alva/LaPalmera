# Dropdown de usuario en el sidebar (Configuración + Cerrar sesión)

## Contexto

Se pidió convertir el campo donde se muestra el correo del usuario en el sidebar (parte inferior, arriba del antiguo botón de logout) en un botón desplegable, y mover ahí las opciones de "Configuración" y "Cerrar sesión".

## Cambios

### [frontend/components/layouts/SideMenu/SidebarUser.tsx](../../frontend/components/layouts/SideMenu/SidebarUser.tsx)

Reescrito por completo:
- El bloque que antes solo mostraba el ícono + nombre/correo + rol ahora es un `<button>` que alterna un estado `isOpen`. Se agregó un ícono `ChevronUp` (rota 180° según el estado) para indicar que es desplegable.
- Se agregó un `useRef` + `useEffect` con un listener de `mousedown` en `document` para cerrar el menú al hacer clic fuera (patrón estándar de dropdown, no existía uno previo en el proyecto para replicar, así que se usó el enfoque más común de React).
- El menú desplegable (`AnimatePresence` + `motion.div`, mismo estilo de animación que el resto del proyecto) se abre hacia arriba (`bottom-full mb-2`) porque el componente vive al final del sidebar; con el sidebar colapsado, se abre hacia la derecha (`left-full ml-2`) para no quedar oculto tras el borde de la pantalla.
- Contiene dos opciones:
  - **Configuración** (ícono `Settings`, enlaza a `/settings`): solo visible si `user.role === 'admin'`, igual que el enlace "Configuración" ya existente en el menú principal del sidebar — es el mismo módulo sensible (analytics, código inyectado en `<head>`), así que se mantuvo el mismo criterio de acceso en ambos lugares en vez de introducir un criterio distinto.
  - **Cerrar sesión** (ícono `LogOut`, rojo): mismo `handleLogout` que ya existía (POST a `/api/auth/logout` + redirección a `/login`).

### [frontend/components/layouts/SideMenu/Sidebar.tsx](../../frontend/components/layouts/SideMenu/Sidebar.tsx)

Se eliminó el botón de "Cerrar sesión" que vivía suelto debajo de `<SidebarUser>` (quedaba duplicado ahora que la opción vive dentro del dropdown), junto con el `handleLogout` y el `useRouter`/`LogOut` que ya no se usaban en este archivo tras quitarlo.

## Qué NO se tocó

No se creó una página de "perfil de usuario" ni una opción de "Mi cuenta": la única opción de configuración que existe en el proyecto es el módulo `/settings` (configuración del sitio) agregado previamente, así que es a lo que apunta la opción "Configuración" del dropdown.

## Verificación

- `tsc --noEmit` no reporta errores nuevos (los que aparecen son los mismos problemas preexistentes ya documentados: `Variants` de Framer Motion en `register/page.tsx`, `token` prop en `banners/new/page.tsx`, `pathname` posible `null` en `SidebarItem.tsx`/`AuthCheck.tsx`, módulo faltante en `DataTable.tsx`).
- Verificado en vivo contra `/spaces` (con cookie de sesión real): la página responde `200`, el correo del usuario y el botón desplegable (ícono `ChevronUp`) se renderizan correctamente. El contenido del menú no aparece en el HTML inicial porque está colapsado por defecto (comportamiento esperado de `AnimatePresence`).
