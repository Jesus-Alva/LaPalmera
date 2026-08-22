# Número de WhatsApp dinámico y centralizado

## Contexto

Los dos botones que envían un mensaje predefinido por WhatsApp ("Solicitar más información sobre este paquete" en `/package`, y "Enviar WhatsApp" en el formulario de `/contact`) usaban el mismo componente `WhatsAppButton`, cuyo número de teléfono estaba hardcodeado como valor por defecto (`"525646133614"`) directamente en el componente. Se preguntó al usuario cómo centralizarlo y eligió conectarlo a `site_settings` (ya existente, sección "Redes sociales" del panel `/settings`) en vez de una simple constante en el código, para que el número sea editable por un administrador sin tocar código ni redesplegar.

## Backend

### Migración: [backend/migrations/versions/b8c9d0e1f2a3_fix_whatsapp_social_network_seed.py](../../backend/migrations/versions/b8c9d0e1f2a3_fix_whatsapp_social_network_seed.py)
El seed original de `social_networks.whatsapp` (de la migración que creó `site_settings`) traía un número de ejemplo ficticio (`https://wa.me/521234567890`). Antes de conectar los botones a ese valor, se corrigió a `https://wa.me/525646133614` — el número real que ya estaba hardcodeado en el código — para que conectar la nueva fuente dinámica no cambiara silenciosamente el número al que llegan los mensajes reales. Ejecutada contra la base de datos de desarrollo (`a7b8c9d0e1f2 -> b8c9d0e1f2a3`).

No se tocó el modelo, esquema ni endpoints de `site_settings`: el campo `social_networks.whatsapp` y el endpoint público `GET /public/settings/social_networks` ya existían (agregados en `docs/2026-08-21/tabla-site-settings-configuracion-sitio.md`).

## Frontend

### [frontend/lib/constants/contact.ts](../../frontend/lib/constants/contact.ts) (nuevo)
`FALLBACK_WHATSAPP_PHONE`: número de respaldo usado solo si `/public/settings` no responde (por ejemplo, si el backend está caído). Reemplaza el valor que antes estaba hardcodeado inline en `WhatsAppButton.tsx`.

### [frontend/lib/whatsapp.ts](../../frontend/lib/whatsapp.ts) (nuevo)
`extractWhatsAppPhone(whatsappUrl)`: `site_settings.social_networks.whatsapp` guarda una URL completa (`https://wa.me/525646133614`), igual que el resto de redes sociales (`facebook`, `instagram`, `tiktok`) — se mantuvo ese formato consistente en vez de crear un campo especial solo para el número. `WhatsAppButton` necesita únicamente el número (para poder armarle su propio mensaje predefinido), así que esta función extrae los dígitos de la URL con una expresión regular.

### [frontend/components/ui/WhatsAppButton.tsx](../../frontend/components/ui/WhatsAppButton.tsx)
El componente en sí sigue siendo "tonto" (no sabe nada de `site_settings`): solo cambia su valor por defecto de `phone` de un literal hardcodeado a `FALLBACK_WHATSAPP_PHONE`. Quien lo usa es responsable de pasarle el número real.

### [frontend/app/package/page.tsx](../../frontend/app/package/page.tsx)
Server Component: se agregó `getPublicSetting('social_networks')` al `Promise.all` ya existente (junto a `getPublicPackages`/`getPublicBanners`), con `.catch(() => undefined)` para no romper la página si ese endpoint fallara. Se extrae el número con `extractWhatsAppPhone` y se pasa como prop `whatsappPhone` a `PackagesComponent`.

### [frontend/components/features/package/PackagesComponent.tsx](../../frontend/components/features/package/PackagesComponent.tsx)
Recibe `whatsappPhone` y lo reenvía al `WhatsAppButton` del panel de detalle de cada paquete (`<WhatsAppButton phone={whatsappPhone} ...>`).

### [frontend/components/features/contact/FormComponent.tsx](../../frontend/components/features/contact/FormComponent.tsx)
Este archivo es un Client Component y su página padre (`app/contact/page.tsx`) también lo es (usa `useTranslation()` para el contenido i18n), por lo que no puede hacer `await` de datos como en `/package`. Se agregó un `useEffect` que llama a `getPublicSetting('social_networks')` al montar el componente y guarda el número extraído en estado; mientras carga (o si falla), `WhatsAppButton` usa su propio `FALLBACK_WHATSAPP_PHONE`.

## Qué NO se hizo

- **No se tocó `frontend/lib/constants/social.ts`** (usado por `SocialBubbles`, las burbujas flotantes del sitio) ni el enlace de WhatsApp del footer (`FooterComponent.tsx`, vía `t("footer.social.whatsapp")`). El usuario pidió específicamente centralizar el número de "los dos botones que envían un mensaje" — esos dos son los `WhatsAppButton` de `/package` y `/contact`. De paso se detectó que:
  - `lib/constants/social.ts` tiene su propio número de WhatsApp hardcodeado (mismo valor, `525646133614`), independiente del de `site_settings`, usado por el footer y las burbujas.
  - El enlace de WhatsApp del footer (`FooterComponent.tsx` línea 86, `href={t("footer.social.whatsapp")}`) está en realidad **roto**: el valor en `lib/i18n/es.json` para esa clave es el texto plano `"WhatsApp"`, no una URL — a diferencia de `facebook`/`instagram`/`tikTok` en ese mismo archivo, que sí son URLs completas. Es un bug preexistente, no introducido por este cambio.

  Ambos quedan fuera de este cambio para no ampliar el alcance; si se quiere, es un siguiente paso natural conectar también el footer y las burbujas a `site_settings.social_networks` para que las 4 redes (no solo WhatsApp) tengan una única fuente de verdad editable desde `/settings`.

## Verificación

- `tsc --noEmit`: cero errores nuevos.
- Se confirmó que la corrección del seed se aplicó (`GET /public/settings/social_networks` devuelve `https://wa.me/525646133614`, el número real).
- Se probó el flujo dinámico end-to-end: se cambió el número vía el endpoint admin (`PUT /site-settings/social_networks`) a un valor de prueba, y se confirmó que el nuevo valor llegaba correctamente hasta el componente `PackagesComponent` en `/package` (verificado en la carga inicial del servidor, ya que el botón de WhatsApp vive dentro del panel de detalle de un paquete, que solo se muestra tras hacer clic — no es visible en el HTML estático inicial, pero el valor de la propiedad sí viaja correctamente al componente cliente). Se revirtió el valor de prueba al número real al finalizar.
- `/contact` y `/package` responden `200` sin errores.
