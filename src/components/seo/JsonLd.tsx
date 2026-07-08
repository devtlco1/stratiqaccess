// Renders a single JSON-LD structured data block. `data` should already be a
// complete schema.org object (including its own "@context"/"@type").
export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
