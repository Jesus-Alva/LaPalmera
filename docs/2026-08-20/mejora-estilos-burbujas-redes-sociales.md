# Mejora de estilos: burbujas de redes sociales

## Contexto

Se pidió mejorar el estilo visual de las burbujas flotantes de redes sociales agregadas en `docs/2026-08-20/burbujas-redes-sociales.md`. El diseño original era un círculo blanco plano con un relleno de color sólido al hover y un tooltip básico en gris.

## Cambios

### [frontend/lib/constants/social.ts](../../frontend/lib/constants/social.ts)

Se agregó el campo `bgClass` a cada `SocialLink`, con la clase de Tailwind exacta para el relleno de marca al hacer hover:

- Facebook / WhatsApp / TikTok: color sólido de marca (`bg-[#1877F2]`, `bg-[#25D366]`, `bg-[#010101]`).
- Instagram: el mismo degradado de marca que ya usa el ícono de Instagram en el Footer (`bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]`), en vez de un color plano — así ambos (Footer y burbujas) se ven consistentes.

`hoverColor` (hex) se conserva y ahora se usa específicamente para el resplandor (glow) de marca.

### [frontend/components/ui/SocialBubbles.tsx](../../frontend/components/ui/SocialBubbles.tsx)

- **Contenedor tipo "vidrio esmerilado"**: las burbujas ahora viven dentro de una cápsula (`bg-white/60 backdrop-blur-md shadow-xl ring-1 ring-black/5`) en vez de flotar sueltas, dándoles una apariencia más cuidada y agrupada.
- **Flotación continua**: cada burbuja tiene una animación infinita y sutil de "boyando" (`y: [0, -3, 0]`), con duración y retraso ligeramente distintos por índice para que se sientan orgánicas en vez de sincronizadas, reforzando la idea de "burbujas".
- **Resplandor de marca al hover**: un halo difuminado (`blur-md`) del color de la red social aparece detrás de la burbuja al pasar el mouse, además del relleno de marca (sólido o degradado según `bgClass`) que ahora entra con una transición de escala + opacidad en vez de un simple fade.
- **Tooltip rediseñado**: pasó de un tooltip gris genérico a uno con más presencia (`rounded-lg`, sombra, tipografía más marcada) y una pequeña flecha apuntando hacia la burbuja, con transición de opacidad + desplazamiento + escala.
- **Entrada más expresiva**: la animación de aparición ahora también anima `scale` (de 0.6 a 1), además de la posición y opacidad ya existentes.

## Patrón de arquitectura respetado

- Se mantiene `framer-motion` para todas las animaciones, ya usado en el resto del sitio.
- El degradado de Instagram replica exactamente el que ya definía `FooterComponent.tsx`, evitando introducir una paleta de marca distinta a la ya establecida.
- No se modificó la lógica de datos (`SOCIAL_LINKS` sigue siendo la única fuente de verdad); el cambio es puramente visual.

## Impacto

- Las burbujas de redes sociales ahora tienen una apariencia más pulida y "viva" (flotación continua, resplandor de marca, tooltip con flecha), manteniendo la misma ubicación y comportamiento (visibles solo en páginas públicas).
