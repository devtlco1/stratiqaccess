import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import type { SectorRow } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { pickText } from "@/lib/localizedContent";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";

export async function Sectors() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("sectors")
    .select("*")
    .order("sort_order", { ascending: true });
  const sectors = (data ?? []) as SectorRow[];
  const t = await getTranslations("home.sectorsSection");
  const locale = (await getLocale()) as Locale;

  return (
    <section id="sectors" className="scroll-mt-24 py-24 lg:py-32 bg-white">
      <Container>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] text-navy leading-tight max-w-3xl">
          {t("title")}
        </h2>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
          {sectors.map((sector) => (
            <Link
              key={sector.id}
              href={`/sectors/${sector.slug}`}
              className="group flex items-center gap-4 border-b border-navy/15 pb-4 ps-3 -ms-3 rounded-md hover:border-stratiq-blue hover:bg-paper transition-all duration-300"
            >
              <Icon
                name={sector.icon as IconName}
                className="size-8 shrink-0 text-navy transition-colors duration-300 group-hover:text-stratiq-blue"
              />
              <span className="flex-1 font-display text-lg text-navy">
                {pickText(locale, sector.title, sector.title_ar)}
              </span>
              <Icon
                name="arrow-right"
                className="size-4 shrink-0 rotate-45 rtl:-scale-x-100 text-ink/40 group-hover:text-stratiq-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
