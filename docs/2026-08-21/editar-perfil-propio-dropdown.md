# Opción "Editar perfil" en el dropdown del usuario

## Contexto

Sobre el dropdown de usuario agregado en el sidebar (`docs/2026-08-21/dropdown-usuario-sidebar.md`), se pidió agregar una opción "Editar perfil" para que cualquier usuario autenticado pueda actualizar su propio nombre de usuario, teléfono, dirección y preferencia de notificaciones — sin necesidad de pasar por el módulo de administración de Usuarios (que además es admin-only y sirve para que un admin cambie el rol/estatus de otros, no el propio perfil).

## Backend

### [backend/app/schemas/user.py](../../backend/app/schemas/user.py)
Nuevo `UserProfileUpdate(display_name, phone, address, notifications_enabled)`, todos opcionales. Se separó de `UserAdminUpdate` (que solo tiene `role`/`status`) porque son dos superficies de autorización distintas: un usuario cualquiera puede cambiar su propio nombre/teléfono/dirección/notificaciones, pero nunca su propio rol o estatus (eso seguiría gestionado únicamente por un admin vía `PUT /user/{user_id}`).

### [backend/app/api/v1/endpoint/users.py](../../backend/app/api/v1/endpoint/users.py)
Nuevo `PUT /user/me`: cualquier usuario autenticado (sin importar su rol) puede actualizar su propio registro con `UserProfileUpdate`, usando el mismo patrón `exclude_unset` + `setattr` que el resto del proyecto. No requiere pasar el `user_id` en la URL — usa `current_user` directamente, evitando que un usuario pueda intentar editar el perfil de otro.

## Frontend

### [frontend/src/types/user.ts](../../frontend/src/types/user.ts)
Nuevo tipo `UserProfileUpdate`.

### [frontend/lib/api/users.ts](../../frontend/lib/api/users.ts)
`getMyProfile()` (GET `/user/me`) y `updateMyProfile(data)` (PUT `/user/me`), ambos con `credentials: 'include'`.

### [frontend/components/forms/Users/EditProfileModal.tsx](../../frontend/components/forms/Users/EditProfileModal.tsx) (nuevo)
Modal con el mismo patrón visual y de animación que `ImageUploadModal.tsx` (overlay + tarjeta centrada, cierre al hacer clic fuera). Formulario con: nombre de usuario, teléfono, dirección y un checkbox de notificaciones (mismo criterio de "un solo interruptor" ya usado en el registro). Al guardar, llama a `updateMyProfile` y notifica el usuario actualizado al padre vía `onSuccess`.

### [frontend/components/layouts/SideMenu/SidebarUser.tsx](../../frontend/components/layouts/SideMenu/SidebarUser.tsx)
- Se agregó la opción "Editar perfil" (ícono `Pencil`) como primera entrada del dropdown, antes de "Configuración" y "Cerrar sesión".
- Al hacer clic, primero se cierra el dropdown y se llama a `getMyProfile()` para traer los datos reales del usuario (teléfono, dirección, notificaciones) — esto es necesario porque el `user` que recibe `Sidebar`/`SidebarUser` viene decodificado directamente del JWT (`app/(dashboard)/layout.tsx`), que solo contiene `sub` (correo) y `role`; no incluye teléfono, dirección ni notificaciones. Sin esta llamada, el modal se abriría con esos campos vacíos aunque el usuario ya los tuviera guardados.
- Tras un guardado exitoso, se guarda el `display_name` devuelto en un estado local (`displayNameOverride`) que se usa para refrescar el nombre mostrado en el botón del dropdown al instante, sin esperar a un nuevo login (el JWT tampoco se actualiza con el nuevo nombre, ya que no lo incluye).

## Qué NO se hizo

- No se actualizó el JWT ni `app/(dashboard)/layout.tsx` para incluir `display_name`: el nombre mostrado en el sidebar seguía sin reflejar el valor guardado en la base de datos incluso antes de este cambio (el layout siempre usaba el correo como fallback). Arreglar eso de raíz implicaría decidir si el JWT debe llevar más claims o si el layout debe pasar a hacer un fetch en vivo — se dejó fuera por ser un cambio más amplio no pedido explícitamente; el `displayNameOverride` local resuelve el caso inmediato (ver el cambio reflejado tras editar, en la misma sesión de navegación).
- No se permitió editar correo ni contraseña desde este modal — no fue parte de lo solicitado.

## Verificación

- `tsc --noEmit` no reporta errores nuevos (se corrigió uno introducido por este cambio: el tipo de `display_name` en `EditProfileModal` no aceptaba `null`, ajustado a `string | null | undefined` para coincidir con `User.display_name`). El resto de errores son los mismos preexistentes ya documentados.
- Probado por HTTP real: `PUT /user/me` (con Bearer token del admin real) actualiza `display_name`, `phone`, `address` y `notifications_enabled` correctamente; se revirtió al valor original tras la prueba.
