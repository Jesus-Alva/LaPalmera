# Estatus, preferencia de notificaciones y último acceso en usuarios

## Contexto

Continuando la serie de mejoras al módulo de usuarios (`docs/2026-08-21/modulo-control-usuarios-y-rol-por-defecto.md`, `docs/2026-08-21/campos-telefono-direccion-usuarios.md`), se pidieron tres campos más: preferencias de notificación, estatus (activo/inactivo/suspendido) y última fecha de acceso. Se consultó al usuario la forma de "preferencias de notificación" y se optó por un solo interruptor booleano (recibir notificaciones sí/no), en vez de canales separados (email/SMS/etc.) que hoy no existen en el proyecto.

## Backend

### [backend/app/model/user.py](../../backend/app/model/user.py)
Tres columnas nuevas:
- `status` (`String(20)`, default `'active'`)
- `notifications_enabled` (`Boolean`, default `True`)
- `last_login_at` (`DateTime`, nullable, sin default — se llena en cada login exitoso)

### [backend/app/schemas/user.py](../../backend/app/schemas/user.py)
- Nuevo `UserStatus = Literal["active", "inactive", "suspended"]`.
- `UserCreate` gana `notifications_enabled: bool = True`.
- `UserOut` gana `status`, `notifications_enabled`, `last_login_at`.
- **Se reemplazó `UserRoleUpdate` por `UserAdminUpdate(role: Optional[UserRole], status: Optional[UserStatus])`**: como ahora hay dos campos editables solo por admin (rol y estatus) en vez de uno, se consolidó en un único schema de actualización parcial, siguiendo el mismo patrón `exclude_unset` ya usado en el resto del proyecto (`team_members.py`, `packages.py`, etc.) en vez de acumular un endpoint `PATCH` por cada campo individual.

### [backend/app/api/v1/endpoint/users.py](../../backend/app/api/v1/endpoint/users.py)
El endpoint `PATCH /{user_id}/role` se reemplazó por `PUT /{user_id}` (mismo criterio de autorización: solo `role == "admin"`), que acepta `role` y/o `status` de forma independiente vía `model_dump(exclude_unset=True)` + `setattr`.

### [backend/app/api/v1/endpoint/auth.py](../../backend/app/api/v1/endpoint/auth.py)
- `register()`: pasa `notifications_enabled=user_data.notifications_enabled` y fija `status="active"` explícitamente para todo usuario nuevo.
- `login()`: dos cambios importantes:
  1. **Bloquea el login si `user.status != "active"`** (devuelve `403` con un mensaje claro). Sin esto, el campo "estatus" sería puramente decorativo — suspender a alguien desde el panel no tendría ningún efecto real. Esto no estaba pedido explícitamente pero es lo que le da sentido funcional al campo "suspendido".
  2. Actualiza `user.last_login_at = datetime.utcnow()` justo antes de emitir el token, en cada login exitoso.

### Migración: [backend/migrations/versions/f6a7b8c9d0e1_add_status_notifications_lastlogin_to_users.py](../../backend/migrations/versions/f6a7b8c9d0e1_add_status_notifications_lastlogin_to_users.py)
Agrega las tres columnas. `status` y `notifications_enabled` se agregan con `server_default` (`'active'` y `true` respectivamente) para que los usuarios ya existentes queden con valores sensatos (activos, con notificaciones habilitadas) en vez de `NULL`; `last_login_at` se deja `NULL` porque no hay forma de reconstruir ese dato retroactivamente. Ejecutada contra la BD de desarrollo (`e5f6a7b8c9d0 -> f6a7b8c9d0e1`).

## Frontend

### [frontend/src/types/user.ts](../../frontend/src/types/user.ts)
Nuevo `UserStatus`; `User` gana `status`, `notifications_enabled`, `last_login_at`. Nuevo `UserAdminUpdate { role?, status? }`.

### [frontend/lib/api/users.ts](../../frontend/lib/api/users.ts)
`updateUserRole(id, role)` se reemplazó por `updateUser(id, data: UserAdminUpdate)` (método `PUT`), reflejando el nuevo endpoint consolidado del backend.

### [frontend/components/forms/Users/UsersTable.tsx](../../frontend/components/forms/Users/UsersTable.tsx)
- Columnas nuevas: "Notificaciones" (badge Sí/No, de solo lectura — no se pidió que un admin pueda cambiarlo) y "Último acceso" (fecha formateada en español, o "Nunca" si el usuario no ha iniciado sesión).
- La columna "Rol" ahora combina el badge de color con el `<select>` para cambiarlo en la misma celda (antes eran dos columnas separadas: "Rol" y "Cambiar rol"); se agregó una columna "Estatus" con el mismo patrón (badge + `<select>` de Activo/Inactivo/Suspendido) — esto evitó que la tabla creciera a 9 columnas.
- `handleRoleChange` se generalizó a `handleUpdate(userId, {role?, status?})`, reutilizado por ambos selects, con la misma actualización optimista y reversión en caso de error ya usada antes.

### [frontend/app/(auth)/register/page.tsx](<../../frontend/app/(auth)/register/page.tsx>)
Se agregó un checkbox "Quiero recibir notificaciones" (marcado por defecto), que se envía como `notifications_enabled` al registrar. `status` no se expone en el formulario de registro: todo usuario nuevo inicia en `"active"` automáticamente, sin intervención del usuario.

## Qué NO se tocó

- No se agregó una pantalla de "cuenta suspendida" dedicada en el frontend; hoy el mensaje de error del backend (`403`) se muestra tal cual donde el formulario de login ya renderiza errores genéricos.
- No se implementó ningún envío real de notificaciones (email/push/etc.) — el campo `notifications_enabled` es una preferencia que un futuro sistema de notificaciones podría consultar, pero ese sistema no existe todavía en el proyecto.
- No se agregó forma de que un admin edite `notifications_enabled` de otro usuario (se mantiene como dato de solo lectura en el panel, igual que teléfono/dirección).

## Verificación

Probado por HTTP real contra la BD de desarrollo:
- Registro con `notifications_enabled: false` → se persiste correctamente.
- Login del usuario nuevo → `last_login_at` pasa de `null` a la fecha/hora real.
- `PUT /user/{id}` (como admin) cambia `status` a `"suspended"` correctamente.
- Login de un usuario `suspended` → rechazado con `403` y mensaje claro.
- `/users` en el frontend (admin) responde `200` con las columnas "Notificaciones", "Último acceso" y "Estatus" en el encabezado.
- `/register` responde `200` con el checkbox de notificaciones presente.
- `tsc --noEmit` no reporta errores nuevos (los de `register/page.tsx` son el mismo problema preexistente de tipos de Framer Motion ya documentado antes, ahora con una repetición más por el campo nuevo).
- Usuario de prueba eliminado al finalizar.
