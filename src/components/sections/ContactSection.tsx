import { siteConfig } from "@/data/siteConfig";
import { createPublicClient } from "@/lib/supabase/public";
import type { SiteSettingsRow } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { ContactForm } from "./ContactForm";

export async function ContactSection() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  const settings = data as SiteSettingsRow | null;

  const email = settings?.email || siteConfig.email;
  const location = settings?.location || siteConfig.location;

  return (
    <section id="contact" className="scroll-mt-24 py-24 lg:py-32 bg-white">
      <Container>
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-stratiq-blue">
          Get In Touch
        </span>
        <h2 className="mt-4 max-w-3xl font-display text-3xl sm:text-4xl lg:text-[2.75rem] text-navy leading-tight">
          Planning operations in Iraq?
        </h2>
        <p className="mt-4 max-w-2xl text-base sm:text-lg text-ink/70 leading-relaxed">
          Tell us what you need on the ground — from accommodation and transport to staffing,
          permits, legal coordination, and full field execution.
        </p>

        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          <ContactDetail icon="mail" value={email} href={`mailto:${email}`} />
          <ContactDetail icon="globe" value={siteConfig.url.replace("https://", "")} href={siteConfig.url} />
          <ContactDetail icon="map-pin" value={location} />
        </div>

        <div className="mt-12 rounded-lg bg-paper p-8 sm:p-10">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}

function ContactDetail({
  icon,
  value,
  href,
}: {
  icon: "mail" | "globe" | "map-pin";
  value: string;
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-2 text-sm font-medium text-ink/70">
      <Icon name={icon} className="size-4 text-stratiq-blue" />
      {value}
    </span>
  );

  if (href) {
    return (
      <a href={href} className="hover:text-stratiq-blue transition-colors">
        {content}
      </a>
    );
  }

  return content;
}
