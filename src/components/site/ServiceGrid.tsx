import { Compass, Radar, ShieldCheck, Boxes, Handshake, CalendarClock, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";

const icons: Record<string, LucideIcon> = {
  "market-entry-advisory": Compass,
  "tender-intelligence": Radar,
  "local-representation": ShieldCheck,
  "procurement-sourcing-support": Boxes,
  "partnership-jv-development": Handshake,
  "delegation-meeting-support": CalendarClock,
};

export function ServiceGrid({
  items,
}: {
  items: { slug: string; title: string; summary: string }[];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((service, i) => {
        const Icon = icons[service.slug] ?? Compass;
        return (
          <FadeIn key={service.slug} delay={i * 0.06}>
            <Link href={`/services#${service.slug}`} className="block h-full">
              <Card className="h-full">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-md border border-gold-500/25 bg-gold-500/8 text-gold-400 transition-colors duration-300 group-hover:border-gold-500/50 group-hover:bg-gold-500/12">
                    <Icon size={22} strokeWidth={1.6} />
                  </span>
                  <span className="font-display text-2xl text-ivory-100/15">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-ivory-100">{service.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-500">{service.summary}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Learn more <span aria-hidden>&rarr;</span>
                </span>
              </Card>
            </Link>
          </FadeIn>
        );
      })}
    </div>
  );
}
