import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";

const numerals = ["01", "02", "03", "04", "05", "06"];

export function ServiceGrid({
  items,
}: {
  items: { slug: string; title: string; summary: string }[];
}) {
  return (
    <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((service, i) => (
        <FadeIn key={service.slug} delay={i * 0.05}>
          <Link href={`/services#${service.slug}`} className="block h-full">
            <Card className="h-full !border-0 bg-navy-950 hover:bg-navy-900">
              <span className="font-display text-sm text-gold-500">
                {numerals[i] ?? String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-xl text-silver-100">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-silver-300">
                {service.summary}
              </p>
              <span className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-gold-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Learn more →
              </span>
            </Card>
          </Link>
        </FadeIn>
      ))}
    </div>
  );
}
