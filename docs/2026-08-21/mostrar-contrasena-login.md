# Mostrar/ocultar contraseña en el login

## Contexto

Se pidió agregar al campo de contraseña del formulario de inicio de sesión la opción de visualizar la contraseña en texto plano.

## Cambios

### [frontend/app/(auth)/login/page.tsx](<../../frontend/app/(auth)/login/page.tsx>)

- Nuevo estado `showPassword` (booleano, `false` por defecto).
- El `<input>` de contraseña alterna su `type` entre `"password"` y `"text"` según ese estado.
- Se agregó un botón (`type="button"`, para no disparar el submit del formulario) posicionado dentro del campo, a la derecha, con los íconos `Eye`/`EyeOff` de `lucide-react` (ya usado en todo el proyecto). Tiene `tabIndex={-1}` para no interrumpir el flujo de tabulación entre email → contraseña → botón de envío, y `aria-label` dinámico ("Mostrar contraseña" / "Ocultar contraseña") para accesibilidad.
- El input y el botón se envolvieron en un contenedor `relative` (con el `mt-1` que antes tenía el input, para evitar el colapso de márgenes entre el label y este contenedor) y se le agregó `pr-11` al input para que el texto no quede debajo del ícono.

No se tocó el formulario de registro (`app/(auth)/register/page.tsx`), que no fue parte de lo solicitado.

## Verificación

`tsc --noEmit` no reporta errores nuevos (los que aparecen ya existían antes en este archivo, mismo problema de tipos de Framer Motion documentado en cambios anteriores). Se confirmó en vivo que `/login` responde `200` con el botón de mostrar/ocultar contraseña presente en el HTML.
