# Catálogo de características de paquetes

## Contexto

Antes, al registrar/editar un paquete, el paso "Características" permitía escribir libremente una "Clave" (ej. "Capacidad") y un "Valor" (ej. "100 personas") en dos campos de texto por fila, sin ninguna validación de consistencia — dos administradores podían escribir "Capacidad", "capacidad" y "Capacidad de invitados" para lo mismo. Se pidió que las características (las "claves") estén predefinidas en un catálogo: al agregar una característica a un paquete, se elige de ese catálogo, y si la que se necesita no existe todavía, se puede registrar una nueva sin salir del formulario.

## Backend

### Nuevo modelo y tabla: [backend/app/model/package_feature_catalog.py](../../backend/app/model/package_feature_catalog.py)

`PackageFeatureCatalog(id, name unique)` — el catálogo de nombres de características (ej. "Horas", "Comida", "Mobiliario"). Relación uno-a-muchos hacia `PackageFeature`.

### [backend/app/model/package_feature.py](../../backend/app/model/package_feature.py)

`PackageFeature` dejó de tener la columna libre `feature_key` y ahora tiene `catalog_id` (FK a `package_feature_catalog.id`, `NOT NULL`) + `feature_value` (se mantiene igual, es el valor específico de ese paquete). Se agregó una propiedad Python `feature_key` (`@property`) que devuelve `self.catalog.name` — esto permite que todo el código que ya leía `feature.feature_key` (schemas, endpoints, y el frontend) siga funcionando exactamente igual, sin tocar la serialización en ningún endpoint.

### Schemas
- [backend/app/schemas/package_feature_catalog.py](../../backend/app/schemas/package_feature_catalog.py) (nuevo): `PackageFeatureCatalogCreate`/`PackageFeatureCatalogOut`.
- [backend/app/schemas/package_feature.py](../../backend/app/schemas/package_feature.py): `PackageFeatureCreate` ahora pide `catalog_id` + `feature_value` (en vez de `feature_key` + `feature_value`). `PackageFeatureOut` sigue exponiendo `feature_key` (ahora resuelto vía la propiedad del modelo) además del nuevo `catalog_id`.

### Nuevo endpoint: [backend/app/api/v1/endpoint/package_feature_catalog.py](../../backend/app/api/v1/endpoint/package_feature_catalog.py)

- `GET /package-feature-catalog` — lista el catálogo completo, ordenado alfabéticamente (requiere sesión, igual que el resto del admin).
- `POST /package-feature-catalog` — crea una característica nueva en el catálogo. Es *idempotente*: si ya existe una con el mismo nombre (comparación case-insensitive), devuelve la existente en vez de duplicarla — así dos administradores escribiendo "mobiliario" y "Mobiliario" terminan usando la misma entrada.

Registrado en [backend/app/api/route/api.py](../../backend/app/api/route/api.py) con prefijo `/package-feature-catalog`.

### [backend/app/api/v1/endpoint/packages.py](../../backend/app/api/v1/endpoint/packages.py)

`create_package`/`update_package` ahora crean cada `PackageFeature` con `catalog_id=feature_data.catalog_id` en vez de `feature_key=feature_data.feature_key`. El resto de la lógica (reemplazo completo de features al actualizar, etc.) no cambió.

### Migración: [backend/migrations/versions/d4e5f6a7b8c9_add_package_feature_catalog.py](../../backend/migrations/versions/d4e5f6a7b8c9_add_package_feature_catalog.py)

Migración con backfill de datos (no solo cambio de esquema), en este orden:
1. Crea la tabla `package_feature_catalog`.
2. Siembra el catálogo con los valores **distintos** de `feature_key` que ya existían en `package_features` (`INSERT ... SELECT DISTINCT`).
3. Agrega `catalog_id` a `package_features` como nullable.
4. Rellena `catalog_id` de cada fila existente haciendo match por nombre contra el catálogo recién sembrado.
5. Pone `catalog_id` en `NOT NULL`, agrega la FK, y finalmente elimina la columna vieja `feature_key`.

Se verificó manualmente contra la BD de desarrollo: las 8 características ya registradas (Horas, Comida, Bebidas, Carpa, Mobiliario, Staff, Ambiente, Estacionamiento) se migraron sin pérdida de datos, cada una apuntando a su entrada correspondiente del nuevo catálogo.

## Frontend

### Nuevo tipo: [frontend/src/types/packageFeatureCatalog.ts](../../frontend/src/types/packageFeatureCatalog.ts)

`PackageFeatureCatalog { id, name }` / `PackageFeatureCatalogCreate { name }`.

### [frontend/src/types/package.ts](../../frontend/src/types/package.ts)

`PackageFeature` gana `catalog_id: number`; `PackageFeatureCreate` cambia de `{ feature_key, feature_value }` a `{ catalog_id, feature_value }`.

### Nuevo cliente API: [frontend/lib/api/packageFeatureCatalog.ts](../../frontend/lib/api/packageFeatureCatalog.ts)

`getPackageFeatureCatalog()` / `createPackageFeatureCatalogItem(data)`, mismo patrón (`credentials: 'include'`) que el resto de las funciones admin en `lib/api/images.ts`.

### Nuevo componente: [frontend/components/forms/Packages/FeatureCatalogSelector.tsx](../../frontend/components/forms/Packages/FeatureCatalogSelector.tsx)

Replica el patrón visual/de interacción ya usado en [CategorySelector.tsx](../../frontend/components/forms/Gallery/CategorySelector.tsx) (creado en una iteración anterior para las categorías de galería): una pastilla segmentada "Elegir" / "Nueva". En modo "Elegir" es un `<select>` con las opciones del catálogo recibido por prop; en modo "Nueva" es un input + botón "Crear" que llama a `createPackageFeatureCatalogItem`, agrega el resultado al catálogo compartido (prop `onCatalogCreated`) y selecciona automáticamente la característica recién creada.

A diferencia de `CategorySelector` (que carga su propio catálogo internamente, porque se usa una sola vez por formulario), aquí el catálogo se carga **una sola vez en `PackageForm`** y se pasa por props a cada fila — ya que puede haber varias filas de características por paquete y todas deben ver inmediatamente cualquier característica nueva creada desde cualquiera de ellas.

### [frontend/components/forms/Packages/PackageForm.tsx](../../frontend/components/forms/Packages/PackageForm.tsx)

- Carga el catálogo completo al montar el formulario (`getPackageFeatureCatalog()`).
- El paso 2 ("Características") reemplazó el input de texto libre "Clave" por `<FeatureCatalogSelector>`; el campo "Valor" se mantiene como texto libre (es específico de cada paquete, ej. "100 personas" para la característica "Capacidad").
- La validación del paso 2 ahora exige `catalog_id` (una característica seleccionada) en vez de un texto no vacío.
- El payload enviado a `createPackage`/`updatePackage` envía `catalog_id` en vez de `feature_key`.

## Qué NO se tocó

Los componentes públicos que muestran características de paquetes (`PackagesComponent.tsx` en `/package`, el mensaje de WhatsApp generado) siguen leyendo `feature.feature_key`/`feature.feature_value` exactamente igual que antes — no requirieron ningún cambio, gracias a la propiedad `feature_key` agregada en el modelo del backend que preserva la forma de la respuesta de la API.

## Verificación

- Migración ejecutada correctamente; los 8 registros existentes se migraron sin pérdida de datos (verificado comparando `feature_key` antes/después).
- `GET /public/packages` sigue devolviendo `feature_key` correctamente para cada característica (ahora resuelto vía el catálogo).
- Probado directamente contra la lógica del backend (sin pasar por HTTP, por no contar con credenciales de prueba): listado del catálogo, creación con deduplicación case-insensitive, y creación/consulta de un paquete completo con una característica enlazada al catálogo — todo correcto.
- `tsc --noEmit` no reporta errores nuevos en ninguno de los archivos de frontend tocados.
