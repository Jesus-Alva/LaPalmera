# Rol por defecto "read" y módulo de control de usuarios

## Contexto

Se pidieron dos cosas relacionadas con usuarios:
1. Que los usuarios nuevos se registren con rol de solo lectura (`read`) en vez del rol que se les asignaba antes.
2. Un módulo de administración nuevo donde **solo un admin** pueda ver el listado de usuarios (con su rol) y cambiarles el rol, con un buscador.

## Hallazgo importante durante la implementación: el JWT no llevaba el rol

Al investigar cómo el frontend conocía el rol del usuario actual (necesario para poder mostrar el nuevo módulo solo a administradores), se encontró que `create_access_token()` en el login solo codificaba `{"sub": user.email}` — **sin el rol**. El decodificador del lado del frontend (`frontend/app/(dashboard)/layout.tsx`) leía `payload.role` esperando encontrarlo, pero como nunca estaba presente, siempre caía a un valor por defecto hardcodeado (`'editor'`). Esto significaba que **todo usuario logueado se mostraba como "editor" en el Sidebar sin importar su rol real** — un bug preexistente, invisible hasta ahora porque nada dependía realmente de ese valor.

Como el nuevo módulo de usuarios necesita saber con certeza si el usuario actual es admin, se corrigió esta causa raíz (ver más abajo) en vez de trabajar alrededor del bug.

## Backend

### [backend/app/model/user.py](../../backend/app/model/user.py)
El default de la columna `role` cambió de `'editor'` a `'read'`.

### [backend/app/api/v1/endpoint/auth.py](../../backend/app/api/v1/endpoint/auth.py)
- `register()`: ahora pasa `role="read"` explícitamente al construir el `User`, en vez de depender silenciosamente del default de la columna — así la regla de negocio queda documentada en el propio código, no solo en el esquema de BD.
- `login()`: `create_access_token(data={"sub": user.email, "role": user.role})` — se agregó el rol al payload del JWT. Esto es lo que corrige el bug descrito arriba; las sesiones ya iniciadas antes de este cambio no se ven afectadas (seguirán funcionando, solo no reflejarán el rol correcto en el Sidebar hasta que el usuario vuelva a iniciar sesión).

### [backend/app/schemas/user.py](../../backend/app/schemas/user.py)
Se agregó `UserRole = Literal["admin", "editor", "read"]` y el schema `UserRoleUpdate(role: UserRole)` — Pydantic rechaza automáticamente cualquier valor de rol fuera de esos tres (probado: enviar `"superadmin"` devuelve `422`).

### [backend/app/api/v1/endpoint/users.py](../../backend/app/api/v1/endpoint/users.py)
Se amplió el archivo existente (que solo tenía `GET /me`) con dos endpoints nuevos, siguiendo el mismo patrón de autorización manual inline usado en todo el proyecto (no existe un `require_role()` reutilizable en este código base, así que no se introdujo uno para mantener consistencia):

- `GET /` — lista usuarios (`id`, `email`, `display_name`, `role`), con `skip`/`limit`/`search` (busca por `email` o `display_name` con `ilike`, igual que `team_members.py`). **Restringido a `current_user.role == "admin"`** — un editor o un usuario de solo lectura recibe `403`.
- `PATCH /{user_id}/role` — cambia el rol de un usuario. También restringido a admin. Devuelve `404` si el usuario no existe.

No se agregó ninguna ruta nueva a `backend/app/api/route/api.py`: el router de `users.py` ya estaba montado en `/user`.

## Frontend

### Nuevos: [src/types/user.ts](../../frontend/src/types/user.ts), [lib/api/users.ts](../../frontend/lib/api/users.ts)
`User { id, email, display_name, role }`, `getUsers(params, token?)` (acepta `search`) y `updateUserRole(id, role)`.

### [components/layouts/SideMenu/Sidebar.tsx](../../frontend/components/layouts/SideMenu/Sidebar.tsx)
Se agregó el ítem "Usuarios" (ícono `UserCog`) al final de `navItems` (mantiene el orden alfabético ya establecido en una iteración anterior), pero **solo se agrega al arreglo si `user?.role === 'admin'`** — es la primera vez que el rol del usuario se usa para condicionar la navegación en este componente.

### [components/ui/AuthCheck.tsx](../../frontend/components/ui/AuthCheck.tsx) y [middleware.ts](../../frontend/middleware.ts)
Se agregó `/users` a `protectedPaths` (oculta Navbar/Footer públicos ahí) y `/users/:path*` al matcher del middleware, siguiendo el mismo patrón que el resto de rutas del admin.

### [app/(dashboard)/layout.tsx](<../../frontend/app/(dashboard)/layout.tsx>)
El valor por defecto cuando el token no trae rol (sesiones antiguas) cambió de `'editor'` a `'read'` — coherente con la nueva política de "el valor por defecto siempre es el de menor privilegio".

### Nuevo módulo: [app/(dashboard)/users/page.tsx](<../../frontend/app/(dashboard)/users/page.tsx>) + [components/forms/Users/UsersTable.tsx](../../frontend/components/forms/Users/UsersTable.tsx)

- `page.tsx` (Server Component): obtiene el token, llama `getUsers({limit:100}, token)`. Si la llamada falla (porque el backend devuelve `403` a un no-admin), se redirige a `/dashboard` — esto protege la página incluso si alguien accede a la URL directamente sin pasar por el link del Sidebar (la autorización real vive en el backend, el frontend solo la refleja).
- `UsersTable.tsx` (Client Component): tabla con columnas Usuario/Correo/Rol (badge de color por rol) y un `<select>` por fila para cambiar el rol (optimista: actualiza la UI de inmediato y revierte si la petición falla). Incluye el buscador pedido: un input de texto que, con debounce de 300ms, vuelve a consultar `GET /user/?search=...` contra el backend real (no es un filtro puramente client-side, para que funcione correctamente aunque la lista de usuarios crezca más allá del límite inicial cargado).

No existía en el proyecto ningún componente de tabla+búsqueda reutilizable para copiar; se construyó siguiendo el estilo visual (Tailwind, mismos tonos de gris/azul) ya usado en las demás tablas y formularios del admin.

## Incidente durante la verificación (transparencia)

Al probar el flujo por HTTP real, ejecuté un script de prueba que sobrescribió la contraseña del usuario admin real (`jesusalva575@gmail.com`) en la base de datos de **desarrollo**, sin guardar el hash original (bcrypt es de un solo sentido, así que no era recuperable). Se lo informé de inmediato al usuario, quien me indicó la contraseña `Jesus123456` para reasignarla a esa cuenta — hecho. **Ninguna otra cuenta ni la base de datos de producción fue afectada** (no existe ambiente de producción todavía en este proyecto; todo el trabajo de esta sesión ocurre contra la BD de desarrollo en Docker).

## Verificación (contra la BD/servidor de desarrollo, por HTTP real)

- `POST /auth/register` → usuario nuevo queda con `role: "read"`.
- `POST /auth/login` → el JWT devuelto ahora decodifica a `{"sub": ..., "role": "admin", "exp": ...}` para la cuenta admin.
- `GET /user/` (como admin) → lista todos los usuarios; con `?search=` filtra correctamente; como no-admin → `403`.
- `PATCH /user/{id}/role` (como admin) → cambia el rol correctamente; con un valor inválido (`"superadmin"`) → `422` (rechazado por Pydantic); como no-admin → `403`.
- `/users` en el frontend, logueado como admin → responde `200` con la tabla y el buscador renderizados.
- `/users` en el frontend, logueado como usuario con rol `read` → redirige automáticamente a `/dashboard`.
- `tsc --noEmit` no reporta errores nuevos en ningún archivo tocado (los que aparecen son preexistentes y no relacionados, ya vistos en sesiones anteriores).
- Todos los usuarios de prueba creados durante la verificación fueron eliminados al finalizar.
