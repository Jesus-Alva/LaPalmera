# Fix: error de hidratación y "state update on unmounted component" en LoadingScreen

## Contexto

Tras agregar `LoadingScreen.tsx` al layout raíz (`docs/2026-08-20/pantalla-de-carga-sitio-publico.md`), el usuario reportó dos errores en consola al cargar el sitio:

1. `Can't perform a React state update on a component that hasn't mounted yet... Move this work to useEffect instead.`
2. `Hydration failed because the server rendered HTML didn't match the client.`

## Causa

`LoadingScreen` se renderizaba igual en el servidor que en el cliente, con su árbol completo de `AnimatePresence`/`motion.div` de Framer Motion activo desde el primer render. Framer Motion resuelve los estilos iniciales (`initial`, `style`, atributos como `hidden`) de forma distinta en el render de servidor (donde no hay DOM real ni mediciones de layout) que en el cliente ya hidratado, lo que generaba un árbol server/cliente distinto — exactamente el escenario de "Invalid HTML tag nesting" / mismatch de contenido dinámico que describe el mensaje de error de Next.js. Al ser parte del layout raíz, este componente se monta en **todas** las páginas, haciendo el problema visible de inmediato.

## Solución

### [frontend/components/ui/LoadingScreen.tsx](../../frontend/components/ui/LoadingScreen.tsx)

Se agregó una bandera `hasMounted` que es `false` durante el render de servidor y durante el primer render del cliente (antes de hidratar), y pasa a `true` recién después de que React termina de hidratar. Mientras `hasMounted` es `false`, el componente retorna `null` — por lo que el server y el primer render del cliente coinciden exactamente (ambos no renderizan nada), eliminando el mismatch. El árbol de Framer Motion (`AnimatePresence`, el sello, el texto "Cargando") solo se monta después, en un render 100% client-side.

Se implementó con `useSyncExternalStore` (de `react`) en vez del patrón clásico `useState(false) + useEffect(() => setHasMounted(true), [])`:

```ts
const emptySubscribe = () => () => {};
const hasMounted = useSyncExternalStore(
  emptySubscribe,   // sin suscripción real, el valor no cambia por sí solo
  () => true,        // snapshot en el cliente (tras hidratar)
  () => false        // snapshot en el servidor / durante la hidratación
);
```

Se prefirió esta forma porque el linter del proyecto marca como error llamar a `setState` directamente dentro de un `useEffect` sin condición externa (regla "avoid calling setState() directly within an effect", pensada para evitar renders en cascada innecesarios). `useSyncExternalStore` es el mecanismo que React expone específicamente para este caso — leer un valor que difiere entre servidor y cliente sin ese problema — y es el mismo truco que usan librerías como `next-themes` para exponer banderas "ya hidratado" sin advertencias.

## Patrón de arquitectura respetado

No se tocó el resto de la lógica (temporizador de `DISPLAY_DURATION`, bloqueo de scroll, animaciones del sello y del texto "Cargando"): el fix es exclusivamente sobre cuándo se permite que el árbol de Framer Motion exista en el DOM.

## Verificación

`tsc --noEmit` no reporta errores nuevos. Se confirmó en vivo que el HTML de la respuesta del servidor para `/` ya **no** incluye el sello de `LoadingScreen` (antes sí aparecía, causando el mismatch); ahora se monta exclusivamente en el cliente tras la hidratación, que es cuando corresponde mostrar la animación de entrada al sitio.
