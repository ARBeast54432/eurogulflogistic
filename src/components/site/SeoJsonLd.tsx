/**
 * Injects structured data (JSON-LD) for the business.
 * Rendered inline so it is present in the SSR HTML for crawlers.
 */
export function SeoJsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
