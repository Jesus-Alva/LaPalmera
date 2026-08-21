# Pestaña de burbujas: texto "Ver redes sociales" en vez de ícono

## Contexto

En la pestaña colapsable de `docs/2026-08-20/burbujas-redes-sociales-colapsables.md` se usaba un ícono de flecha (`FaChevronRight`) como indicador. Se pidió reemplazarlo por el texto "Ver redes sociales".

## Cambio

### [frontend/components/ui/SocialBubbles.tsx](../../frontend/components/ui/SocialBubbles.tsx)

- Se quitó el ícono `FaChevronRight` (y su import de `react-icons/fa`) del botón de la pestaña.
- Se agregó un `<span>` con el texto "Ver redes sociales", renderizado en **orientación vertical** (`[writing-mode:vertical-rl] rotate-180`, la técnica CSS estándar para texto de lado a lado que se lee de abajo hacia arriba), ya que la pestaña es una tira angosta y el texto no cabría horizontalmente.
- Se ajustó la pestaña de un alto fijo (`h-12 sm:h-14`) a un alto flexible por padding vertical (`py-4 sm:py-5`), para que crezca según el largo del texto en vez de recortarlo.
- El resto del comportamiento (hover para abrir en escritorio, click para alternar en cualquier dispositivo, `aria-expanded`/`aria-label`) no cambió.

## Impacto

- La pestaña ahora comunica explícitamente su propósito con texto ("Ver redes sociales") en vez de un ícono genérico de flecha.
