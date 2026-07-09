import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import type { ServiceRow } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { pickText } from "@/lib/localizedContent";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Pagination, PAGE_SIZE } from "@/components/ui/Pagination";

export async function Services({
  linkToIndex = false,
  featuredOnly = false,
  page = 1,
}: { linkToIndex?: boolean; featuredOnly?: boolean; page?: number } = {}) {
  const supabase = createPublicClient();
  let query = supabase.from("services").select("*", { count: "exact" }).order("sort_order", { ascending: true });
  if (featuredOnly) {
    query = query.eq("is_featured", true).limit(6);
  } else {
    query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  }
  const { data, count } = await query;
  const services = (data ?? []) as ServiceRow[];
  const totalPages = featuredOnly ? 1 : Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const t = await getTranslations("home.servicesSection");
  const tCommon = await getTranslations("common");
  const tIndex = await getTranslations("services.index");
  const locale = (await getLocale()) as Locale;

  return (
    <section id="services" className="scroll-mt-24 py-24 lg:py-32 bg-paper">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-end">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-stratiq-blue">
              {t("eyebrow")}
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.75rem] text-navy leading-tight">
              {t("title")}
            </h2>
          </div>
          <p className="text-base sm:text-lg text-ink/70 leading-relaxed">{t("intro")}</p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group flex flex-col rounded-xl bg-white p-7 shadow-sm ring-1 ring-navy/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-stratiq-blue/30"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-lg bg-navy/5 text-navy transition-colors duration-300 group-hover:bg-stratiq-blue/10 group-hover:text-stratiq-blue">
                <Icon name={service.icon as IconName} className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-lg text-navy leading-snug">
                {pickText(locale, service.title, service.title_ar)}
              </h3>
              <p className="mt-2 text-sm text-ink/65 leading-relaxed flex-1">
                {pickText(locale, service.description, service.description_ar)}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stratiq-blue">
                {tCommon("learnMore")}
                <Icon
                  name="arrow-right"
                  className="size-3.5 rotate-45 rtl:-scale-x-100 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>
          ))}
        </div>

        {linkToIndex && (
          <div className="mt-12 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-stratiq-blue hover:text-navy transition-colors"
            >
              {tIndex("viewAll")}
              <Icon name="arrow-right" className="size-3.5 rotate-45 rtl:-scale-x-100" />
            </Link>
          </div>
        )}

        {!featuredOnly && <Pagination currentPage={page} totalPages={totalPages} basePath="/services" />}
      </Container>
    </section>
  );
}
