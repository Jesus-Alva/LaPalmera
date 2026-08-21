# Quitar el zoom de la imagen en el panel de Detalles del Servicio

## Contexto

La imagen de portada del panel "Detalles del Servicio" (que se muestra al seleccionar un paquete en `/package`) tenía un efecto de zoom al hover (`group-hover:scale-105 transition-transform duration-700`), heredado del rediseño anterior. Se pidió eliminarlo.

## Cambios

### [frontend/components/features/package/PackagesComponent.tsx](../../frontend/components/features/package/PackagesComponent.tsx)

Se quitó el `<div>` intermedio con `group-hover:scale-105 transition-transform duration-700` (y la clase `group` de su contenedor, que ya no tiene ningún consumidor) que envolvía al `PackageImageCarousel` en el panel de detalle. `PackageImageCarousel` ahora se renderiza directamente dentro del contenedor `relative w-full pt-[35%] md:pt-[30%] overflow-hidden`, sin ningún efecto de escala al pasar el mouse. El degradado oscuro superpuesto y el texto (título/descripción) no cambiaron.

Este cambio es específico del panel de detalle; el efecto `hover:scale-105` de las tarjetas de vista previa del carrusel de paquetes (arriba, antes de seleccionar uno) no se tocó, ya que no fue parte de lo solicitado.

## Verificación

`tsc --noEmit` no reporta errores nuevos. `/package` sigue respondiendo `200` sin errores.
