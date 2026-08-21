# Burbujas de redes sociales: pestaña colapsable

## Contexto

Se pidió que el componente de burbujas de redes sociales permanezca oculto por defecto en el lado izquierdo, dejando visible solo una pequeña pestaña, y que el panel completo aparezca al pasar el mouse (desktop) o al hacer click (móvil).

Nota: al editar el archivo se encontró que el fondo de la cápsula ya había sido cambiado en disco de `bg-white/60` a `bg-black/30` (cambio externo, se conservó tal cual por ser el estado vigente).

## Cambio

### [frontend/components/ui/SocialBubbles.tsx](../../frontend/components/ui/SocialBubbles.tsx)

Se restructuró el componente en dos piezas dentro de un mismo contenedor (`fixed inset-y-0 left-0 flex items-center`, con `onMouseEnter`/`onMouseLeave` para el hover de escritorio):

1. **Pestaña** (`<button>`, siempre visible): una tira angosta (`w-5 sm:w-6`, alto fijo) pegada al borde izquierdo de la pantalla, con un ícono de flecha (`FaChevronRight`) que rota 180° cuando el panel está abierto. Tiene `onClick` que alterna `isOpen` — es lo que permite abrir/cerrar con un tap en móvil (donde no existe hover real), y también funciona con click en escritorio.
2. **Panel de burbujas**: envuelto en un contenedor con `overflow-hidden` cuyo `width` anima entre `w-0` (colapsado, contenido completamente recortado y oculto) y `w-14`/`w-16` (expandido), vía transición CSS (`transition-[width] duration-300`). Dentro, el `motion.div` que ya contenía las burbujas ahora anima su aparición (`opacity` + stagger de `framer-motion`) sincronizada con el mismo estado `isOpen`, en vez de animar solo una vez al montar.

Se usó **colapso de ancho** (no `translateX`) deliberadamente: con `translateX` la pestaña habría quedado desplazada según el ancho del panel (los `transform` no afectan el flujo de layout de sus hermanos), rompiendo el requisito de que la pestaña quede siempre fija en el borde izquierdo. Animar `width` a `0` con `overflow-hidden` logra el efecto de "oculto con solo una pestaña visible" sin ese problema.

El contenido interno de cada burbuja (resplandor de marca, flotación continua, tooltip) no se modificó.

## Comportamiento resultante

- **Estado inicial / mouse fuera**: solo la pestaña es visible en el borde izquierdo de cualquier página pública.
- **Hover (desktop)**: al entrar el mouse a la pestaña (o al panel ya abierto), `isOpen` pasa a `true` y el panel se expande; al sacar el mouse de todo el contenedor, se colapsa de nuevo.
- **Click/tap (cualquier dispositivo, incluido móvil)**: alterna manualmente el panel, independientemente del hover.

## Patrón de arquitectura respetado

- Se mantiene `framer-motion` para la animación de aparición de las burbujas, igual que el resto del sitio.
- No se tocó `frontend/lib/constants/social.ts` ni la lógica de datos; el cambio es exclusivamente de interacción/presentación del contenedor.

## Impacto

- El componente ya no ocupa espacio visual permanente en el borde izquierdo de las páginas públicas: solo se ve una pestaña discreta hasta que el usuario interactúa con ella.
