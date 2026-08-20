# Fix: el Navbar público se ocultaba en la página de Galería

## Contexto

Al entrar a la página pública de Galería (`/gallery`), el Navbar (`NavbarComponent.tsx`) no se mostraba, como si fuera una ruta protegida del panel administrativo.

## Causa raíz

[frontend/components/ui/AuthCheck.tsx](../../frontend/components/ui/AuthCheck.tsx) decide si mostrar el Navbar público según una lista `protectedPaths`, comprobando `pathname.startsWith(path)`. La lista incluía `'/gallery'` con la intención de ocultar el Navbar en la página del panel administrativo de imágenes.

Sin embargo:

- La ruta del panel administrativo es en realidad **`/gallery_image`** (ver [frontend/app/(dashboard)/gallery_image/page.tsx](../../frontend/app/(dashboard)/gallery_image/page.tsx)), no `/gallery`.
- La ruta pública de Galería (enlazada desde el propio Navbar) es exactamente **`/gallery`** (`ROUTES_PAGE.galeria` en [frontend/app/constants/routes.ts](../../frontend/app/constants/routes.ts)).

Como `'/gallery'` es *prefijo* de ambas rutas, `pathname.startsWith('/gallery')` daba `true` tanto para la página pública `/gallery` como para la del panel `/gallery_image`, ocultando el Navbar en ambas quando solo debía ocultarse en la segunda.

## Solución

Se corrigió la entrada de la lista `protectedPaths` en `AuthCheck.tsx`, cambiando `'/gallery'` por `'/gallery_image'` (la ruta real del panel administrativo). Con esto:

- `/gallery` (pública) → ya no coincide con ningún prefijo protegido → el Navbar se muestra correctamente.
- `/gallery_image` (panel administrativo) → sigue coincidiendo → el Navbar se sigue ocultando ahí, como se pretendía originalmente.

No se modificó la lógica de `AuthCheck` ni el resto de rutas protegidas, que sí coinciden correctamente con sus páginas del panel (`/spaces`, `/celebrations`, `/locations`, `/team-members`, `/banners`, `/faqs`, `/packages`, `/dashboard`).

## Impacto

- El Navbar público vuelve a mostrarse correctamente en la página de Galería (`/gallery`) y en cualquier otra ruta pública que pudiera empezar con el prefijo `/gallery` en el futuro.
- El panel administrativo de imágenes (`/gallery_image`) sigue sin mostrar el Navbar público, tal como el resto de páginas del dashboard.
