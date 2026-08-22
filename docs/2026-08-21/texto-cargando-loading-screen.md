# Texto "Cargando" animado en la pantalla de carga

## Contexto

Continuando `docs/2026-08-20/pantalla-de-carga-sitio-publico.md` (que creó `LoadingScreen.tsx` con el sello de La Palmera y animación de desvanecido/zoom), se pidió agregar un texto de "Cargando" con su propia animación.

## Cambios

### [frontend/components/ui/LoadingScreen.tsx](../../frontend/components/ui/LoadingScreen.tsx)

- El contenedor principal pasó de `flex items-center justify-center` a `flex flex-col items-center justify-center` para apilar el sello y el nuevo texto verticalmente.
- Debajo del sello se agregó el texto "Cargando" (`text-primary`, dorado de la identidad, en mayúsculas con tracking amplio, tipografía `font-noto-serif` consistente con el resto del sitio).
- El texto aparece con un fade-in + desplazamiento (`initial={{opacity:0, y:10}}` → `animate={{opacity:1, y:0}}`) con un `delay` de 0.5s para que aparezca después de que el sello ya esté visible.
- Junto al texto, tres puntos (`•`) animados en bucle infinito con opacidad desfasada (`animate={{opacity:[0.25,1,0.25]}}`, `repeat: Infinity`, delay escalonado de 0.2s entre cada uno) simulan el clásico efecto de "cargando..." con puntos parpadeando en secuencia.

## Patrón de arquitectura respetado

Se reutilizó Framer Motion (ya usado en el resto del componente y del proyecto) para ambas animaciones, sin introducir ninguna librería nueva ni lógica adicional de temporización: el texto y los puntos comparten el mismo ciclo de vida del componente (aparecen con el sello, desaparecen junto con el overlay al cerrarse).

## Verificación

`tsc --noEmit` no reporta errores nuevos. Se confirmó en vivo que la home (`/`) responde `200` e incluye el texto "Cargando" en el HTML.
