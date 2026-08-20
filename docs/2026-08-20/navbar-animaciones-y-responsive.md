# Navbar pública: animaciones con Framer Motion, mejoras responsivas y reducción al hacer scroll

## Contexto

Se solicitó agregar animación al Navbar público del sitio (`NavbarComponent.tsx`, distinto del `Sidebar.tsx` del panel administrativo), mejorar su experiencia en diseño responsivo, y que la barra reduzca su tamaño al hacer scroll. El componente usaba únicamente transiciones CSS de Tailwind y un menú móvil controlado por clases condicionales (`visible/invisible`, `opacity-0/100`), sin `framer-motion` ni comportamiento de scroll.

## Decisión de arquitectura

El proyecto ya usa `framer-motion` de forma consistente para navegación con estado activo animado (`SidebarItem.tsx` usa `layoutId="active-indicator"`) y para overlays/drawers móviles (`Sidebar.tsx` usa dos bloques `AnimatePresence`: uno para el backdrop y otro para el panel deslizante). Se aplicó el mismo enfoque a `NavbarComponent.tsx` en vez de introducir un patrón distinto.

## Cambios

### [frontend/components/layouts/NavbarComponent.tsx](../../frontend/components/layouts/NavbarComponent.tsx)

- **Entrada del header**: `motion.header` con animación de deslizamiento + fade (`y: -80 → 0`, `opacity: 0 → 1`) al montar.
- **Reducción al hacer scroll**: nuevo estado `isScrolled`, actualizado mediante un listener de `scroll` (`passive: true`) que se activa al superar 20px de desplazamiento. El header alterna entre `h-16 md:h-20` (normal) y `h-14 md:h-16` (scrolleado), junto con `shadow-md` → `shadow-lg`, animado con `transition-all duration-300` (transición CSS, ya que Tailwind resuelve mejor el cambio de alturas responsivas por breakpoint que una animación inline de Framer Motion). El logo hereda el alto del header (`h-full`) por lo que se encoge junto con la barra sin lógica adicional.
- **Indicador de sección activa (desktop)**: el `<span>` estático que marcaba el link activo se reemplazó por `motion.span` con `layoutId="navbar-underline"`, igual que el indicador de actividad del Sidebar — el subrayado ahora **se desliza animado** entre links en vez de aparecer/desaparecer abruptamente.
- **Links del menú desktop**: `whileHover={{ y: -2 }}` con transición spring para un efecto de "levantamiento" sutil.
- **Logo y botón hamburguesa**: envueltos en `motion.div`/`motion.button` con `whileHover`/`whileTap` para dar feedback táctil.
- **Menú móvil**: se reemplazó el control por clases (`visible/invisible`, `opacity-0/100`, `-translate-y-4`) por dos bloques `AnimatePresence` (backdrop + panel), con entrada/salida por fade + desplazamiento vertical, y los enlaces del panel aparecen con **stagger** (`staggerChildren: 0.06`). El offset superior del panel (`top-16 md:top-20` / `top-14 md:top-16`) también reacciona a `isScrolled` para no dejar un hueco cuando la barra ya está reducida.
- Se ajustó el `gap` del contenedor principal (`gap-2 sm:gap-4` en vez de `gap-4` fijo) para que el logo, los enlaces y el selector de idioma respiren mejor en pantallas muy angostas antes del breakpoint `md`.
- No se tocó la lógica de negocio: los `useEffect` de bloqueo de scroll, cierre en resize y manejo de hash para anclas se mantienen intactos, así como `useTranslation`/`useLang` y las rutas de `ROUTES_PAGE`.

## Patrón de arquitectura respetado

- Mismo mecanismo de "indicador activo animado" (`layoutId`) que `SidebarItem.tsx`.
- Mismo mecanismo de "drawer/overlay móvil animado" (`AnimatePresence` en dos bloques: backdrop + panel) que `Sidebar.tsx`.
- Para el encogimiento por scroll se usó una transición CSS (`transition-all` + clases condicionales) en vez de animar `height` inline con Framer Motion, porque el inline `style` de Framer tiene mayor especificidad que las media queries de Tailwind y rompería el comportamiento `h-16` (móvil) / `h-20` (desktop) ya existente.
- No se agregaron dependencias nuevas: `framer-motion` ya es dependencia del proyecto y se usa en múltiples componentes (`Sidebar`, `PackageCard`, `BannerCard`, etc.).

## Impacto

- El Navbar público ahora tiene entrada animada, un indicador de sección activa que se desliza, un menú móvil con transiciones suaves y aparición escalonada de enlaces, y se reduce de tamaño de forma animada al hacer scroll — sin romper el comportamiento responsivo existente entre móvil y escritorio.
