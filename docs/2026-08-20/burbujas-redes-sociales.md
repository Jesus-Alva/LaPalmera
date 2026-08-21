# Burbujas flotantes de redes sociales en el sitio público

## Contexto

Se solicitó agregar burbujas flotantes del lado izquierdo con enlaces a las redes sociales, visibles en **todas las páginas públicas** del sitio.

## Investigación previa

El proyecto ya tenía enlaces a redes sociales en [FooterComponent.tsx](../../frontend/components/layouts/FooterComponent.tsx) (Facebook, Instagram, WhatsApp, TikTok), leídos desde `frontend/lib/i18n/es.json` (`footer.social.*`). Se detectó que el ícono de TikTok del Footer usaba la clave `footer.social.tiktok`, que no existe en el JSON (la clave real es `tikTok`, con "T" mayúscula), por lo que ese enlace estaba roto (`t()` devolvía el string de la clave en vez de una URL). También el enlace de WhatsApp del Footer usaba el valor literal `"WhatsApp"` como `href`, en vez de un link real de `wa.me` (a diferencia del componente `WhatsAppButton.tsx`, que sí arma un link `https://wa.me/{phone}?text=...` correcto y ya se usa en otras partes del sitio).

Para no duplicar (ni volver a romper) estos enlaces al agregar las burbujas, se creó una fuente única de verdad para las redes sociales.

## Cambios

### Nuevo: [frontend/lib/constants/social.ts](../../frontend/lib/constants/social.ts)

Arreglo `SOCIAL_LINKS` con Facebook, Instagram, WhatsApp (armado como link real `wa.me` con el mismo teléfono por defecto que `WhatsAppButton.tsx`) y TikTok, cada uno con su ícono (`react-icons/fa`) y color de marca para el hover. Es la fuente única que consumen tanto el Footer como las nuevas burbujas.

### Nuevo: [frontend/components/ui/SocialBubbles.tsx](../../frontend/components/ui/SocialBubbles.tsx)

Componente cliente que renderiza una columna de burbujas circulares fijas (`fixed left-2 sm:left-4 top-1/2 -translate-y-1/2`), una por cada red en `SOCIAL_LINKS`:

- Aparecen con una animación de entrada escalonada (`framer-motion`, `staggerChildren`) deslizándose desde la izquierda.
- Cada burbuja tiene `whileHover`/`whileTap` (escala) y, al pasar el mouse, un relleno circular con el color de marca de la red social más un pequeño tooltip con el nombre, deslizándose hacia la derecha de la burbuja — el "efecto amigable" pedido.
- `target="_blank"` + `rel="noopener noreferrer"` en todos los enlaces, igual que el resto de enlaces externos del sitio.

### [frontend/app/layout.tsx](../../frontend/app/layout.tsx)

Se agregó `<SocialBubbles />` envuelto en `<AuthCheck>`, exactamente igual que ya se hace con `<NavbarComponent>` y `<FooterComponent>`. `AuthCheck` ya implementa la lógica de "solo mostrar en rutas públicas" (oculta el contenido si la ruta actual está en su lista `protectedPaths` del panel admin), por lo que las burbujas heredan automáticamente ese mismo comportamiento sin lógica adicional: aparecen en todas las páginas públicas y se ocultan en el panel administrativo.

### [frontend/components/layouts/FooterComponent.tsx](../../frontend/components/layouts/FooterComponent.tsx)

Se corrigió la clave de traducción del enlace de TikTok (`footer.social.tiktok` → `footer.social.tikTok`), que apuntaba a una clave inexistente y por lo tanto no llevaba a ningún lado.

## Patrón de arquitectura respetado

- Mismo mecanismo ya usado para "mostrar solo en páginas públicas" (`AuthCheck` envolviendo el componente en `app/layout.tsx`), igual que `NavbarComponent` y `FooterComponent`.
- Mismas animaciones con `framer-motion` (`stagger`, `whileHover`, `whileTap`) ya usadas en `Sidebar`, `NavbarComponent` y las cards del panel admin.
- Se reutilizó el mismo formato de link de WhatsApp (`wa.me/{phone}?text=...`) que ya usa `WhatsAppButton.tsx`, en vez de inventar un formato distinto.

## Impacto

- Las burbujas de redes sociales ahora aparecen en el lado izquierdo de toda página pública (verificado en la home: los 4 enlaces se renderizan junto a los del Footer, sin errores).
- De paso, se corrigió el enlace de TikTok del Footer, que estaba roto.
