import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/data/siteConfig";
import { createPublicClient } from "@/lib/supabase/public";
import type { SiteSettingsRow } from "@/lib/types";
import { Container } from "@/components/ui/Container";

export async function Footer() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  const settings = data as SiteSettingsRow | null;
  const email = settings?.email || siteConfig.email;
  const t = await getTranslations("footer");

  return (
    <footer className="bg-navy text-white/70">
      <Container className="py-20 flex flex-col sm:flex-row sm:items-center gap-10 sm:gap-20">
        <Image
          src={siteConfig.logo.light}
          alt={siteConfig.name}
          width={176}
          height={38}
          className="h-9 w-auto"
        />

        <div>
          <h3 className="font-display text-lg text-white">{t("emailHeading")}</h3>
          <p className="mt-2 text-sm">{t("emailPrompt")}</p>
          <a
            href={`mailto:${email}`}
            className="group mt-1 inline-block text-sm text-stratiq-blue hover:text-white transition-colors"
          >
            <span className="border-b border-transparent group-hover:border-white/60 transition-colors">
              {email}
            </span>
          </a>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="py-6 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. {t("rightsReserved")}
          </p>
        </Container>
      </div>
    </footer>
  );
}
