# Mejoras de SEO: metadata dinámico, H1, canonical, Open Graph, JSON-LD, sitemap y robots

## Contexto

A partir de un reporte de SEO (herramienta "Inspect All") sobre `http://localhost:3000/package` (43/100), se investigó el código real antes de implementar. Hallazgo clave: la tabla `site_settings` (agregada en `docs/2026-08-21/tabla-site-settings-configuracion-sitio.md`) ya tenía una sección `seo` (`meta_title`, `meta_description`, `og_image`, `keywords`) expuesta sin autenticación en `GET /public/settings/seo`, pero **nunca se conectó al `<head>` real del sitio** — todo el sitio heredaba un único `title`/`description` estático de 3-4 palabras desde `app/layout.tsx`. Esa era la causa raíz de la mayoría de los puntos perdidos en el reporte.

Se descartaron explícitamente del alcance los puntos que no aplican en un entorno local sin desplegar:
- **HTTPS/Security (0/5)**: no se puede resolver en `localhost`; se resuelve solo al desplegar con TLS.
- El reporte marcaba Sitemap/Robots.txt como ✓, pero no existían en el código (probablemente la herramienta interpretó un 404 de Next.js como válido) — sí se implementaron, ver abajo.

## Backend

Ningún cambio: la infraestructura (`site_settings.seo`, endpoint público `GET /public/settings`) ya existía y ya era suficiente.

## Frontend

### [frontend/lib/seo.ts](../../frontend/lib/seo.ts) (nuevo)
Helper central `buildPageMetadata(options)`: arma un objeto `Metadata` de Next.js (title, description, keywords, `alternates.canonical`, `openGraph`, `twitter`, `robots`) combinando lo específico de cada página (`title`, `description`, `path`, `image`) con la configuración global de `site_settings` (`seo.*` y `branding.site_name`), consultada vía `getPublicSettings()` (ya existente). Si el endpoint no responde, cae a valores por defecto para no romper el renderizado — mismo criterio defensivo ya usado en otras partes del proyecto. Exporta también `SITE_URL`, leído de la nueva variable de entorno `NEXT_PUBLIC_SITE_URL`.

### [frontend/components/seo/JsonLd.tsx](../../frontend/components/seo/JsonLd.tsx) (nuevo)
Componente reutilizable que inyecta un `<script type="application/ld+json">` a partir de un objeto de datos (schema.org).

### Variable de entorno `NEXT_PUBLIC_SITE_URL`
Agregada en [.env.dev](../../.env.dev), [frontend/.env.local](../../frontend/.env.local) y registrada en [frontend/next.config.ts](../../frontend/next.config.ts) (mismo patrón ya usado para `NEXT_PUBLIC_API_URL`). Vale `http://localhost:3000` en desarrollo; **debe actualizarse al dominio real al desplegar a producción** — de eso depende que canonical, Open Graph y el sitemap generen URLs correctas.

### [frontend/app/layout.tsx](../../frontend/app/layout.tsx)
El `export const metadata` estático se reemplazó por `export async function generateMetadata()`, que llama a `buildPageMetadata()` (sin overrides) y agrega `metadataBase: new URL(SITE_URL)`. Esto se vuelve el respaldo por defecto para cualquier página pública que no defina su propio `generateMetadata`.

### [frontend/app/page.tsx](../../frontend/app/page.tsx) (home, ruta `/`)
- `generateMetadata()` propio con título y descripción específicos del home (en vez de heredar el genérico del layout).
- JSON-LD `LocalBusiness`: arma `address`/`telephone` a partir de `site_settings.contact_info` (buscando el item cuyo `title` contenga "direcci"/"tel") y `sameAs` a partir de `site_settings.social_networks` — reutilizando datos que el admin ya puede editar en `/settings`, sin hardcodear nada nuevo.

### [frontend/app/package/page.tsx](../../frontend/app/package/page.tsx)
- `generateMetadata()` propio: título "Paquetes para Eventos | La Palmera", descripción específica, `path: '/package'` (canonical).
- JSON-LD `ItemList` de `Service`, uno por cada paquete activo (nombre, descripción corta, imagen).

### Encabezados `<h1>` faltantes
El reporte marcaba 0/10 en H1 porque **ningún componente del sitio público usa `<h1>`** (todo el contenido usaba `<h2>`/`<h3>`). Se corrigieron los dos títulos principales que hacen de encabezado real de página:
- [frontend/components/features/package/BannerComponent.tsx](../../frontend/components/features/package/BannerComponent.tsx): título del banner de `/package`, de `<h2>` a `<h1>`.
- [frontend/components/features/dashboard/BannerComponent.tsx](../../frontend/components/features/dashboard/BannerComponent.tsx): título del banner del home (`/` y `/dashboard`), de `<h2>` a `<h1>`.

Se verificó que ninguno de los dos componentes se reutiliza en otra página antes de cambiar la etiqueta, para no introducir un segundo `<h1>` accidental en ninguna ruta.

### [frontend/app/sitemap.ts](../../frontend/app/sitemap.ts) (nuevo)
Usa el generador nativo de Next.js (`MetadataRoute.Sitemap`) para servir `/sitemap.xml` con las rutas públicas (`/`, `/package`, `/gallery`, `/aboutus`, `/contact`).

### [frontend/app/robots.ts](../../frontend/app/robots.ts) (nuevo)
Usa el generador nativo (`MetadataRoute.Robots`) para servir `/robots.txt`. Bloquea el rastreo de todas las rutas del panel de administración (misma lista que `protectedPaths` en `AuthCheck.tsx`) y de **`/dashboard`**.

**Nota sobre `/dashboard`**: se descubrió que `app/page.tsx` (`/`) simplemente renderiza el componente de `app/dashboard/page.tsx`, por lo que **ambas rutas sirven contenido idéntico** — un caso clásico de contenido duplicado, justo lo que el punto "Canonical URL" del reporte busca evitar. En vez de reestructurar esas rutas (cambio más invasivo, no pedido), se bloqueó `/dashboard` en `robots.txt` para que los buscadores solo indexen `/`.

## Qué NO se hizo

- No se agregó `generateMetadata` a `/gallery`, `/aboutus`, `/contact`, `/login` ni `/register`. El helper `buildPageMetadata()` ya está listo para usarse ahí con el mismo patrón de 3 líneas usado en `/package`; queda como siguiente paso natural si se pide.
- No se resolvió el contenido duplicado entre `/` y `/dashboard` a nivel de código (ej. unificar en una sola ruta o redirigir); se mitigó solo vía `robots.txt`, que es la solución mínima y no invasiva.
- **El `og:image` configurado en `site_settings.seo` (`/images/og.jpg`) es un valor de ejemplo (seed) y el archivo no existe** en `frontend/public/images/`. Es una decisión de contenido (elegir/subir la imagen real de marca para compartir en redes), no de código — se puede corregir directamente desde el panel `/settings` → pestaña "Meta datos", subiendo la imagen a `frontend/public/images/og.jpg` o cambiando la ruta a una imagen ya existente.
- No se tocó `frontend/app/dashboard/page.tsx` en sí (sigue sin su propio `generateMetadata`; al estar bloqueado en `robots.txt` no es prioritario).

## Verificación

Verificado en vivo contra el contenedor de desarrollo (tras reiniciarlo para tomar la nueva variable de entorno):
- `GET /package`: `<title>`, meta description, `<h1>`, `rel="canonical"`, `og:title`/`og:description`/`og:image`/`og:type`, `twitter:card`/`twitter:title`/`twitter:description`, `name="keywords"`, `name="robots" content="index, follow"` y el bloque `application/ld+json` con el `ItemList` de paquetes — todos presentes y con los valores esperados.
- `GET /`: título y `<h1>` específicos del home, canonical a `http://localhost:3000`, y JSON-LD `LocalBusiness` con `address`/`sameAs` poblados desde `site_settings`.
- `GET /sitemap.xml`: `200`, XML válido con las 5 rutas públicas.
- `GET /robots.txt`: `200`, bloquea las rutas de administración y `/dashboard`, referencia el sitemap.
- `tsc --noEmit`: cero errores nuevos (los restantes son los mismos preexistentes ya documentados en cambios anteriores).
