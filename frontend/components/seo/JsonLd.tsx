interface Props {
  data: Record<string, unknown>;
}

/**
 * Inyecta datos estructurados (schema.org) en formato JSON-LD dentro de la página.
 * `data` debe incluir `@context` y `@type`; ver https://schema.org para los tipos disponibles.
 */
export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify de un objeto de datos controlado por nosotros (no input de usuario),
      // consistente con el uso estándar de este patrón en Next.js.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
