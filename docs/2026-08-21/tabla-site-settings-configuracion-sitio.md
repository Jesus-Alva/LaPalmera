# Tabla `site_settings` y panel de configuración del sitio

## Contexto

Se pidió crear una tabla `site_settings` (clave/valor JSONB) para registrar configuración global del sitio: identidad de marca, SEO, contacto, horarios, redes sociales, footer, banner de inicio, scripts/analytics y texto del formulario de reserva. Se implementó siguiendo el mismo patrón arquitectónico ya usado en el proyecto (modelo SQLAlchemy + esquema Pydantic + endpoint admin con checks de rol inline + endpoint público de solo lectura + migración Alembic + tipos/cliente API en frontend + módulo en el dashboard), en vez de solo crear la tabla sin forma de administrarla.

## Backend

### [backend/app/model/site_setting.py](../../backend/app/model/site_setting.py) (nuevo)
```python
class SiteSetting(Base):
    __tablename__ = 'site_settings'
    setting_key = Column(String(80), primary_key=True)
    setting_value = Column(JSONB, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```
Se eligió `setting_key` como PK en vez de un `id` autoincremental porque el registro es conceptualmente un valor único por sección (no una lista de entidades), igual que describía la tabla solicitada.

### [backend/app/model/__init__.py](../../backend/app/model/__init__.py)
Se registró `SiteSetting` para que Alembic (`env.py` importa `app.model`) lo detecte.

### [backend/app/schemas/site_setting.py](../../backend/app/schemas/site_setting.py) (nuevo)
`SiteSettingOut` (setting_key, setting_value, updated_at) y `SiteSettingUpdate` (setting_value). `setting_value` se tipa como `dict | list` porque unas secciones son objetos (`branding`, `seo`, etc.) y otras listas (`contact_info`, `schedule`). Se incluye un `SettingKey` (Literal) solo como referencia de las 9 claves conocidas; el endpoint no restringe la clave a esa lista para no bloquear la flexibilidad del diseño JSONB.

### [backend/app/api/v1/endpoint/site_settings.py](../../backend/app/api/v1/endpoint/site_settings.py) (nuevo)
Mismo patrón de autorización manual usado en el resto del proyecto (`faqs.py`, `packages.py`, etc.):
- `GET /` y `GET /{setting_key}`: cualquier usuario autenticado (no es información sensible: ya se expone igual, sin autenticación, en `/public/settings`).
- `PUT /{setting_key}`: solo `admin`/`editor`. Es un *upsert*: si la clave no existe la crea, si existe la actualiza — no se separaron `POST`/`PUT` porque conceptualmente cada sección siempre existe (fue sembrada por la migración) y el flujo real es siempre "editar".

### [backend/app/api/v1/endpoint/public.py](../../backend/app/api/v1/endpoint/public.py)
Dos endpoints nuevos sin autenticación, para que el sitio público los consuma:
- `GET /public/settings` → `{ setting_key: setting_value }` de todas las secciones, para no hacer 9 llamadas.
- `GET /public/settings/{setting_key}` → el valor de una sola sección.

### [backend/app/api/route/api.py](../../backend/app/api/route/api.py)
Se registró `site_settings.router` en `/site-settings`.

### Migración: [backend/migrations/versions/a7b8c9d0e1f2_create_site_settings.py](../../backend/migrations/versions/a7b8c9d0e1f2_create_site_settings.py)
Crea la tabla y siembra las 9 filas (`branding`, `seo`, `contact_info`, `schedule`, `social_networks`, `footer`, `home_banner`, `scripts`, `reservation`) con los valores de ejemplo proporcionados, para que el panel de administración y el sitio público tengan datos desde el primer arranque en vez de estar vacíos. Ejecutada contra la base de datos de desarrollo (`f6a7b8c9d0e1 -> a7b8c9d0e1f2`).

## Frontend

### [frontend/src/types/siteSettings.ts](../../frontend/src/types/siteSettings.ts) (nuevo)
Interfaces TypeScript para la forma de cada sección (`Branding`, `Seo`, `ContactInfoItem`, `ScheduleItem`, `SocialNetworks`, `Footer`, `HomeBanner`, `Scripts`, `Reservation`) y un mapa `SettingValueMap` que las asocia a su `SettingKey`, usado para tipar de forma genérica `SiteSetting<K>`.

### [frontend/lib/api/siteSettings.ts](../../frontend/lib/api/siteSettings.ts) (nuevo)
`getSiteSettings(token?)` (GET admin) y `updateSiteSetting(key, value)` (PUT admin), siguiendo el mismo patrón de `frontend/lib/api/users.ts` (`credentials: 'include'`, token opcional para Server Components).

### [frontend/lib/api/public.ts](../../frontend/lib/api/public.ts)
Se agregaron `getPublicSettings()` y `getPublicSetting(key)`, mismo patrón que el resto de funciones del archivo (`cache: 'no-store'`, sin credenciales).

### [frontend/app/(dashboard)/settings/page.tsx](<../../frontend/app/(dashboard)/settings/page.tsx>) (nuevo)
Server Component que obtiene los settings con el token del servidor y los pasa a `SettingsForm`.

### [frontend/components/forms/Settings/SettingsForm.tsx](../../frontend/components/forms/Settings/SettingsForm.tsx) (nuevo)
Client Component con pestañas (una por sección). Cada pestaña tiene su propio formulario y su propio botón "Guardar cambios", que llama a `updateSiteSetting` solo para esa clave (no hay un guardado global). Las secciones tipo objeto (`branding`, `seo`, `social_networks`, `footer`, `home_banner`, `scripts`, `reservation`) usan campos de texto simples; `branding` usa además `<input type="color">` para los colores. Las secciones tipo lista (`contact_info`, `schedule`) tienen un editor de filas con agregar/eliminar.

### [frontend/components/layouts/SideMenu/Sidebar.tsx](../../frontend/components/layouts/SideMenu/Sidebar.tsx)
Se agregó el enlace "Configuración" (ícono `Settings`), visible solo para `role === 'admin'` — mismo criterio que "Usuarios": ambos módulos exponen configuración sensible a nivel de todo el sitio (en este caso, IDs de analytics y código personalizado inyectado en `<head>`), a diferencia de módulos de contenido (banners, paquetes, etc.) que sí ven `editor`.

### [frontend/components/ui/AuthCheck.tsx](../../frontend/components/ui/AuthCheck.tsx) y [frontend/middleware.ts](../../frontend/middleware.ts)
Se agregó `/settings` a `protectedPaths` y al `matcher`, mismo patrón usado para cada módulo nuevo del dashboard.

## Qué NO se hizo

- **No se conectaron los componentes públicos existentes** (`FooterComponent`, el banner de inicio, las meta etiquetas SEO del `<head>`, la página de contacto) a estos nuevos settings. Hoy siguen usando su contenido hardcodeado/estático. Conectar cada uno es un cambio independiente por componente (cada uno tiene su propio diseño y algunos ya reciben datos de otras tablas, como `Banner`), y no fue parte de lo solicitado explícitamente ("agrega una nueva tabla... para poder registrar estos campos"). El endpoint público `/public/settings` ya está listo para que esa conexión se haga cuando se pida.
- No se restringió `setting_key` a las 9 claves conocidas a nivel de base de datos ni de validación estricta del backend — el diseño JSONB es intencionalmente flexible.
- No se agregó una vista previa en vivo del logo/colores dentro del formulario de administración.

## Verificación

Probado por HTTP real contra la base de datos y el frontend de desarrollo:
- `GET /public/settings` (sin autenticación) responde `200` con las 9 claves sembradas.
- Login como admin + `GET /site-settings/` (con Bearer token) responde `200` con 9 registros.
- `PUT /site-settings/branding` (admin) actualiza el valor correctamente; se revirtió al valor original tras la prueba.
- `GET /settings` en el frontend responde `200` y renderiza las 9 pestañas ("Identidad", "Meta datos", "Horarios", etc.).
- `tsc --noEmit` no reporta errores nuevos (los existentes son los mismos problemas preexistentes de tipos de Framer Motion, `token` prop y `pathname` nulo ya documentados en cambios anteriores de esta serie).
