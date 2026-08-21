# Fix: error de hidratación causado por extensión del navegador (Grammarly)

## Contexto

Al entrar a la página de inicio (`/`), la consola mostraba un error de hidratación de React/Next.js:

```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
...
- data-new-gr-c-s-check-loaded="14.1144.0"
- data-gr-ext-installed=""
```

## Causa raíz

Los atributos `data-new-gr-c-s-check-loaded` y `data-gr-ext-installed` **no los genera el código de la aplicación**: los inyecta la extensión de navegador **Grammarly** directamente sobre la etiqueta `<body>` en cuanto la página carga, antes de que React termine de hidratar el árbol. Como el HTML generado por el servidor (sin esos atributos) no coincide con el DOM que el navegador ya modificó (con esos atributos), React reporta un mismatch de hidratación.

Este es un caso documentado y muy común en la documentación oficial de Next.js (enlazada en el propio mensaje de error): ocurre con extensiones como Grammarly, Dark Reader, gestores de contraseñas, etc., que mutan `<html>`/`<body>` antes de la hidratación. No indica un bug real en la lógica de la aplicación.

## Solución

### [frontend/app/layout.tsx](../../frontend/app/layout.tsx)

Se agregó `suppressHydrationWarning` a las etiquetas `<html>` y `<body>` del layout raíz:

```tsx
<html lang="es" suppressHydrationWarning>
  <body className={...} suppressHydrationWarning>
```

`suppressHydrationWarning` solo silencia el aviso de discrepancia de atributos/texto en el elemento donde se coloca (no es recursivo hacia sus hijos), por lo que sigue detectando cualquier mismatch real de hidratación más abajo en el árbol de componentes. Es el fix recomendado oficialmente por Next.js/React para este escenario específico (atributos inyectados por extensiones del navegador en `<html>`/`<body>`).

## Impacto

- El error de hidratación relacionado con Grammarly (u otras extensiones que inyecten atributos similares en `<body>`) deja de aparecer en consola.
- No se modificó ninguna lógica de negocio ni de renderizado; el cambio es exclusivamente para evitar el falso positivo de hidratación.
