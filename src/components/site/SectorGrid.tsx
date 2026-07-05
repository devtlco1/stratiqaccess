import { FadeIn } from "@/components/ui/FadeIn";

export function SectorGrid({
  items,
}: {
  items: { slug: string; title: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((sector, i) => (
        <FadeIn key={sector.slug} delay={i * 0.04}>
          <div className="flex h-full items-center justify-between border border-white/10 bg-navy-900/50 px-6 py-5 transition-colors duration-300 hover:border-gold-500/40">
            <span className="text-sm text-silver-200">{sector.title}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500/70" />
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
