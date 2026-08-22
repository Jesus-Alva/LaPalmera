# Carrusel automático e infinito en "Nuestros espacios"

## Contexto

En la ruta pública, página de dashboard (`/dashboard`), sección "Nuestros espacios", se pidió convertir la cuadrícula estática de tarjetas en un carrusel con recorrido automático e infinito, mostrando siempre solo 3 tarjetas visibles y revelando el resto conforme avanza el recorrido.

## Cambios

### [frontend/components/features/dashboard/EspaciosComponent.tsx](../../frontend/components/features/dashboard/EspaciosComponent.tsx)

- Se agregó un estado `startIndex` y un `setInterval` (cada 4 segundos) que lo avanza en `+1` con módulo sobre `spaces.length`, logrando el recorrido infinito (al llegar al final vuelve al principio sin saltos ni huecos).
- Las tarjetas visibles se calculan como una ventana deslizante de 3 elementos: `spaces[(startIndex + i) % spaces.length]` para `i = 0, 1, 2`. Como el índice avanza de uno en uno, en cada paso 2 de las 3 tarjetas ya visibles se mantienen (solo cambian de posición) y 1 nueva entra mientras 1 sale — esto se anima con `layout` de Framer Motion (mismo patrón de animación ya usado en el proyecto, ej. `layoutId` en las píldoras de categoría de la galería), envuelto en `AnimatePresence mode="popLayout"`, lo que produce un efecto de "cinta transportadora" (entra desde la derecha, sale por la izquierda) en vez de un simple corte abrupto entre grupos de 3.
- El carrusel solo se activa (`isCarousel`) cuando hay más de 3 espacios activos; con 3 o menos, se muestran todos de forma estática sin intervalo ni indicadores, igual que el comportamiento original.
- Se agregaron indicadores (puntos) debajo del carrusel, uno por espacio, resaltando el que corresponde al `startIndex` actual — igual que los indicadores ya usados en los demás carruseles del proyecto (banner, paquetes).
- Se quitó `transform hover:scale-105` de la tarjeta (dejando solo `hover:shadow-xl`): esa utilidad de Tailwind y las animaciones de posición (`x`) de Framer Motion compiten por la misma propiedad CSS `transform`, y el estilo inline que aplica Framer Motion tiene mayor prioridad, por lo que el hover de escala dejaba de funcionar en cuanto el carrusel empezaba a animar.

## Qué NO se hizo

- No se agregaron controles manuales (flechas de siguiente/anterior) ni pausa al pasar el mouse: se pidió explícitamente que el recorrido sea automático, y no se solicitó interacción manual.
- No se tocó el resto de la página de dashboard (`app/dashboard/page.tsx`) ni otras secciones (Celebraciones, Paquetes, etc.), que ya tienen sus propios carruseles independientes de banner/imágenes.

## Verificación

- `tsc --noEmit` no reporta errores nuevos.
- Verificado contra la base de datos de desarrollo: hay 4 espacios activos (`Jardín de entrada`, `Pista princ`, `Jardín superior`, `Estacionamiento`), suficientes para activar el modo carrusel.
- Verificado en vivo contra `/dashboard`: la respuesta es `200` y el HTML renderizado en el servidor contiene exactamente 3 tarjetas de espacio (la cuarta se revela con el recorrido automático en el cliente).
