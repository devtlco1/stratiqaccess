import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative border-b border-white/5 bg-navy-950">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <Container className="relative py-24 lg:py-32">
        <Badge>{eyebrow}</Badge>
        <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight text-silver-100 sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-silver-300">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
