# Burbujas flotantes (SocialBubbles) conectadas a site_settings

## Contexto

`SocialBubbles` (las burbujas flotantes de redes sociales del sitio público) tomaba sus enlaces de una lista estática hardcodeada en `lib/constants/social.ts`. El usuario pidió que use la información que ya está en la base de datos (`site_settings.social_networks`), la misma sección "Redes sociales" del panel `/settings` que ya alimenta a `WhatsAppButton` (ver `docs/2026-08-22/numero-whatsapp-dinamico.md`).

### Inconsistencia detectada y resuelta antes de conectar

Antes de unificar, `site_settings.social_networks.whatsapp` tenía `525646133614` (número usado por los botones "Enviar WhatsApp"), mientras que `lib/constants/social.ts` tenía hardcodeado `525520221427` (usado por las burbujas y el footer) — dos números distintos. Conectar las burbujas a `site_settings` iba a unificar ambos puntos en un solo número, así que se confirmó con el usuario cuál es el real antes de continuar: **525520221427**.

### Migración: [backend/migrations/versions/c9d0e1f2a3b4_fix_whatsapp_seed_to_real_business_number.py](../../backend/migrations/versions/c9d0e1f2a3b4_fix_whatsapp_seed_to_real_business_number.py) (nueva)

Corrige el seed de `social_networks.whatsapp` a `https://wa.me/525520221427`. No se editó la migración anterior (`b8c9d0e1f2a3`) — nunca se modifica el historial de Alembic, incluso para corregir un dato ya sembrado. Aplicada a la base de datos de desarrollo (`b8c9d0e1f2a3 -> c9d0e1f2a3b4`).

## Frontend

### [frontend/lib/constants/social.ts](../../frontend/lib/constants/social.ts)
- `SocialLink.key` pasó de `string` a `keyof SocialNetworks` (tipo ya existente en `src/types/siteSettings.ts`), para que el compilador garantice que cada entrada de `SOCIAL_LINKS` corresponde a una clave real de `site_settings.social_networks`.
- `SOCIAL_LINKS` se mantiene como la metadata visual (ícono, color de marca, clase de fondo, etiqueta) — estos datos no viven en la BD, solo el `href`. El `href` de cada entrada ahora es explícitamente un **respaldo**, usado solo si el fetch a `site_settings` falla.
- Nueva función `buildSocialLinks(socialNetworks?: Partial<SocialNetworks>)`: recorre `SOCIAL_LINKS` y reemplaza el `href` de cada red por el valor real de `socialNetworks` cuando existe, conservando el resto de la metadata (ícono, colores). Para WhatsApp, arma la URL final concatenando el mensaje predeterminado (`SOCIAL_WHATSAPP_MESSAGE`, extraído como constante) igual que antes.

### [frontend/components/ui/SocialBubbles.tsx](../../frontend/components/ui/SocialBubbles.tsx)
Ahora recibe un prop opcional `socialNetworks?: Partial<SocialNetworks>` y calcula `const socialLinks = useMemo(() => buildSocialLinks(socialNetworks), [socialNetworks])`, reemplazando el uso directo de `SOCIAL_LINKS`. El componente sigue siendo "tonto": no sabe nada de `site_settings` ni hace fetch, solo recibe los datos ya resueltos — igual patrón que `PackagesComponent`/`WhatsAppButton`.

### [frontend/app/layout.tsx](../../frontend/app/layout.tsx)
`RootLayout` pasó de función síncrona a **Server Component asíncrono** (`export default async function RootLayout(...)`), siguiendo el mismo patrón ya usado en `app/package/page.tsx`: obtiene `getPublicSetting('social_networks').catch(() => undefined)` y lo pasa como prop a `<SocialBubbles socialNetworks={socialNetworks} />`. Se eligió resolver los datos aquí (en vez de un `useEffect` dentro de `SocialBubbles`) porque el padre ya es un Server Component — igual criterio aplicado en `/package` vs. `/contact` en el cambio anterior. Next.js deduplica automáticamente este fetch con el que ya hace `generateMetadata` (vía `buildPageMetadata` → `getPublicSettings`) dentro de la misma request, así que no se duplica la llamada de red en producción.

## Qué NO se hizo

- **No se tocó el Footer** (`FooterComponent.tsx`). Usa sus propias claves de i18n (`t("footer.social.*")`) en vez de `lib/constants/social.ts`, y su enlace de WhatsApp sigue roto (apunta al texto literal "WhatsApp", no a una URL) — bug preexistente ya documentado en `docs/2026-08-22/numero-whatsapp-dinamico.md`, fuera del alcance de este cambio (el usuario pidió específicamente el componente `SocialBubbles`).
- No se agregaron nuevos campos a `site_settings`: la sección `social_networks` (facebook, instagram, tiktok, whatsapp) ya existía y ya era editable desde `/settings`.

## Verificación

- `tsc --noEmit`: sin errores nuevos (los errores preexistentes en `app/(auth)/register/page.tsx`, `app/(dashboard)/banners/new/page.tsx`, `SidebarItem.tsx`, `AuthCheck.tsx` y `app/(auth)/layout.tsx` ya existían antes de este cambio y no están relacionados).
- Se confirmó en el HTML del home (`GET /`) que las 4 burbujas usan los valores de `site_settings.social_networks` (`wa.me/525520221427`, `facebook.com/profile.php?id=61563419831448`, etc.).
- Se probó el flujo dinámico end-to-end: se cambió temporalmente `facebook` en la BD a una URL de prueba, se confirmó que apareció en el HTML del home, y se revirtió al valor real al finalizar.
