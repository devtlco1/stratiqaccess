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
    <section className="relative overflow-hidden border-b border-ivory-100/8 bg-navy-950">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -top-40 start-1/4 h-[420px] w-[420px] rounded-full bg-blue-600/[0.1] blur-[130px]" />
      <Container className="relative py-24 lg:py-28">
        <Badge>{eyebrow}</Badge>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.15] tracking-[-0.02em] text-ivory-100 sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-500">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
