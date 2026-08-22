# Confirmación de contraseña, mostrar/ocultar y requisitos de formato en el registro

## Contexto

El formulario de registro (`/register`) solo tenía un campo de contraseña, sin confirmación, sin opción de verla en texto plano y con un único texto estático ("Mínimo 8 caracteres") que ni siquiera coincidía con lo que valida el backend. Se pidió agregar el campo de confirmación, un botón para mostrar/ocultar la contraseña en ambos campos, y una lista de requisitos de formato.

### Reglas de formato usadas

Se revisó la validación real del backend (`backend/app/schemas/user.py`, `UserCreate.validate_password`): exige al menos una mayúscula y al menos un número, pero **no** valida una longitud mínima a pesar de que el formulario ya mostraba "Mínimo 8 caracteres". Para no dejar esa inconsistencia y sin tocar el backend (fuera del alcance pedido), la validación del frontend se hizo **más estricta que la del servidor**: exige mínimo 8 caracteres + mayúscula + número. Al ser una restricción adicional del lado cliente, nunca puede chocar con lo que el backend acepta (una contraseña que pasa el frontend siempre pasa el backend).

## Frontend

### [frontend/app/(auth)/register/page.tsx](<../../frontend/app/(auth)/register/page.tsx>)

- **Nuevo estado**: `confirmPassword`, `showPassword`, `showConfirmPassword`.
- **`PASSWORD_REQUIREMENTS`** (constante a nivel de módulo): lista de `{ label, test }` con las 3 reglas (longitud, mayúscula, número). `passwordChecks` las evalúa en cada render contra el valor actual de `password`, `isPasswordValid` es `true` solo si las 3 pasan.
- **`passwordsMatch`**: `true` solo si `confirmPassword` no está vacío y es igual a `password`.
- **Campo Contraseña**: el input ahora vive dentro de un wrapper `relative` con un botón (ícono `Eye`/`EyeOff` de `lucide-react`) que alterna `type="password"`/`type="text"`. Debajo se reemplazó el texto estático por una lista con los 3 requisitos, cada uno con ícono `Check` (verde) o `X` (gris) según se cumpla en tiempo real.
- **Campo Confirmar contraseña** (nuevo): mismo patrón de input + botón mostrar/ocultar, más un mensaje de "Las contraseñas coinciden"/"no coinciden" (verde/rojo) que aparece en cuanto el usuario empieza a escribir.
- **`handleSubmit`**: antes de llamar a la API, valida `isPasswordValid` y `passwordsMatch`; si alguna falla, setea `error` y corta sin activar `loading` ni llamar al backend.
- **Botón "Registrarse"**: se deshabilita también cuando `!isPasswordValid || !passwordsMatch`, además de `loading`, para evitar intentos de envío que el propio formulario ya sabe que van a fallar.
- **Corrección menor de tipos**: `itemVariants` (usado por las animaciones de `framer-motion` en todos los campos del formulario) no tenía el tipo `Variants`, lo que generaba errores de TypeScript preexistentes en cada uso (`type: 'spring'` se inferían como `string` genérico en vez del literal esperado). Se tipó explícitamente como `Variants` — como el archivo ya se estaba modificando extensamente, se corrigió en el mismo cambio en vez de dejarlo multiplicándose en cada campo nuevo.

## Qué NO se hizo

- No se tocó el backend (`UserCreate.validate_password`): se decidió no agregar la validación de longitud mínima ahí para mantener el cambio dentro del formulario de registro, ya que el frontend, al ser más estricto, cubre el caso sin riesgo de inconsistencia.
- No se replicó el mismo patrón (mostrar/ocultar, confirmación) en el formulario de login ni en el modal de "Editar perfil" — el pedido fue específicamente sobre el formulario de registro.

## Verificación

- `tsc --noEmit`: sin errores nuevos (se corrigieron, de hecho, los preexistentes de `itemVariants` en este archivo).
- Se confirmó que `/register` responde `200` y que el HTML incluye el campo "Confirmar contraseña" y los 3 textos de requisitos.
