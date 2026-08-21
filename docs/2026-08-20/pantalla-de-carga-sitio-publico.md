# Pantalla de carga (splash) del sitio público

## Contexto

Se pidió una pantalla de carga que se muestre al ingresar al sitio, usando el sello/emblema `La_palmera_sello-removebg-preview.png`, con una animación de desvanecido + zoom.

## Cambios

### [frontend/components/ui/LoadingScreen.tsx](../../frontend/components/ui/LoadingScreen.tsx) (nuevo)

Componente `'use client'` que se monta una vez y:

- Muestra un overlay fijo a pantalla completa (`fixed inset-0 z-[100]`, por encima de la Navbar y cualquier otro elemento que use `z-50`) con fondo `bg-secondary` (verde oscuro de la identidad, `#0F441A`), sobre el que se centra el sello `La_palmera_sello-removebg-preview.png` (`/images/identidad/`).
- **Animación de entrada**: el sello aparece con desvanecido + zoom-out (`initial={{ opacity: 0, scale: 1.4 }}` → `animate={{ opacity: 1, scale: 1 }}`, 1.1s, `ease: "easeOut"`), simulando que se acerca y se enfoca.
- Permanece visible ~1.9s (`DISPLAY_DURATION`) y luego se retira con la animación inversa: el overlay completo se desvanece (`AnimatePresence`, 0.7s) mientras el sello se aleja ligeramente con zoom-in + fade (`exit={{ opacity: 0, scale: 1.25 }}`).
- Bloquea el scroll del body mientras está visible (`document.body.style.overflow = "hidden"`), restaurándolo al desaparecer — mismo patrón ya usado para el lightbox de la Galería.

### [frontend/app/layout.tsx](../../frontend/app/layout.tsx)

`<LoadingScreen />` se agregó envuelto en `<AuthCheck>`, igual que la Navbar, las burbujas de redes sociales y el Footer — por lo que la pantalla de carga **solo aparece en las rutas públicas** (home, paquetes, galería, nosotros, contacto, login) y no en el panel de administración.

## Patrón de arquitectura respetado

- Se reutilizó `AuthCheck` (ya usado para condicionar Navbar/SocialBubbles/Footer a rutas públicas) en vez de crear un mecanismo nuevo de detección de ruta.
- La animación usa Framer Motion (`motion`/`AnimatePresence`), la misma librería usada en todo el proyecto para efectos de entrada/salida (banners, galería, menú móvil de la Navbar).
- El bloqueo de scroll mientras el overlay está activo replica el mismo patrón ya usado en el lightbox de `GalleryImageComponent.tsx`.

## Verificación

`tsc --noEmit` no reporta errores nuevos. Se confirmó en vivo que la home (`/`) responde `200` e incluye la imagen del sello en el HTML, y que en rutas de administración protegidas (ej. `/banners`, que redirige a `/login` sin sesión) la pantalla de carga se comporta igual que la Navbar: visible en `/login` (ruta pública) y ausente dentro del panel admin autenticado.
