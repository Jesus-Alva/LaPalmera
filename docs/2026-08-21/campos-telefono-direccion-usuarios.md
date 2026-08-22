# Campos "Teléfono" y "Dirección" en usuarios

## Contexto

Continuando `docs/2026-08-21/modulo-control-usuarios-y-rol-por-defecto.md`, se pidió agregar más campos a la tabla de usuarios, específicamente teléfono y dirección.

## Backend

### [backend/app/model/user.py](../../backend/app/model/user.py)
Se agregaron las columnas `phone` (`String(20)`, nullable) y `address` (`String(255)`, nullable) al modelo `User`.

### [backend/app/schemas/user.py](../../backend/app/schemas/user.py)
- `UserCreate` gana `phone: str | None = None` y `address: str | None = None` (opcionales, no rompen el registro de nadie que no los envíe).
- `UserOut` gana los mismos dos campos, para que se devuelvan tanto en `/user/me` como en el listado del panel de administración.

### [backend/app/api/v1/endpoint/auth.py](../../backend/app/api/v1/endpoint/auth.py)
`register()` ahora persiste `phone=user_data.phone` y `address=user_data.address` al crear el `User`.

### Migración: [backend/migrations/versions/e5f6a7b8c9d0_add_phone_address_to_users.py](../../backend/migrations/versions/e5f6a7b8c9d0_add_phone_address_to_users.py)
Agrega ambas columnas a la tabla `users`, nullable (los usuarios ya existentes quedan con estos campos en `NULL`). Ejecutada contra la BD de desarrollo (`d4e5f6a7b8c9 -> e5f6a7b8c9d0`).

## Frontend

### [frontend/src/types/user.ts](../../frontend/src/types/user.ts)
`User` gana `phone: string | null` y `address: string | null`.

### [frontend/app/(auth)/register/page.tsx](<../../frontend/app/(auth)/register/page.tsx>)
Se agregaron dos campos opcionales al formulario de registro público, "Teléfono" y "Dirección", entre el nombre y el correo — son los únicos datos que hoy alimentan estas columnas, ya que no existe (ni se pidió) un flujo de edición de perfil. Se envían al backend como `undefined` si quedan vacíos, mismo criterio ya usado para `display_name` en este mismo formulario.

### [frontend/components/forms/Users/UsersTable.tsx](../../frontend/components/forms/Users/UsersTable.tsx)
Se agregaron las columnas "Teléfono" y "Dirección" a la tabla del panel de administración de usuarios (entre "Correo" y "Rol"), mostrando "—" cuando el usuario no los tiene registrados. La columna de dirección trunca el texto con `truncate` y muestra el valor completo en un `title` (tooltip nativo) para direcciones largas.

## Qué NO se tocó

No se agregó ninguna forma de que un admin edite el teléfono/dirección de otro usuario desde el panel (solo se pidió agregar los campos y mostrarlos) — el único punto de entrada de estos datos sigue siendo el formulario de registro público. Tampoco se agregó un flujo de "editar mi perfil" para que un usuario ya registrado los complete después.

## Verificación

- Migración ejecutada correctamente.
- Probado por HTTP real: registro con `phone`/`address` → se guardan y se devuelven correctamente; aparecen en `GET /user/?search=...` como admin.
- `/register` en el frontend responde `200` con los nuevos inputs presentes en el HTML.
- `/users` en el frontend (logueado como admin) responde `200` con las columnas "Teléfono" y "Dirección" en el encabezado de la tabla.
- `tsc --noEmit` no reporta errores nuevos relacionados a estos cambios (los errores de tipos de Framer Motion en `register/page.tsx` ya existían antes, en las mismas líneas de animación reutilizadas para los campos nuevos).
- Usuario de prueba creado durante la verificación fue eliminado al finalizar.
