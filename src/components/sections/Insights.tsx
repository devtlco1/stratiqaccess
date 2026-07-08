import Image from "next/image";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import type { InsightRow } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

export async function Insights() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("insights")
    .select("*")
    .order("published_date", { ascending: false });
  const insights = (data ?? []) as InsightRow[];

  return (
    <section id="insights" className="scroll-mt-24 py-24 lg:py-32 bg-white">
      <Container>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] text-navy leading-tight">
          Our Views on the Iraq Market
        </h2>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {insights.map((insight) => (
            <Link
              key={insight.slug}
              href={`/insights/${insight.slug}`}
              className="group flex flex-col transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-md transition-shadow duration-300 group-hover:shadow-xl">
                {insight.image_url && (
                  <Image
                    src={insight.image_url}
                    alt={insight.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <h3 className="mt-5 font-display text-base text-navy leading-snug group-hover:text-stratiq-blue transition-colors">
                {insight.title}
              </h3>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stratiq-blue">
                <span className="border-b border-stratiq-blue/60 pb-0.5 group-hover:border-stratiq-blue">
                  Read More
                </span>
                <Icon
                  name="arrow-right"
                  className="size-3.5 rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
