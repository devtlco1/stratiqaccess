import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import type { ServiceRow } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";

export async function Services() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  const services = (data ?? []) as ServiceRow[];

  return (
    <section id="services" className="scroll-mt-24 py-24 lg:py-32 bg-paper">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-end">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-stratiq-blue">
              What We Do
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.75rem] text-navy leading-tight">
              Ground Support Services
            </h2>
          </div>
          <p className="text-base sm:text-lg text-ink/70 leading-relaxed">
            Practical, on-the-ground execution for companies operating in Iraq — from logistics and
            staffing to legal coordination and permits, delivered through our local team and trusted
            partner network, subject to applicable Iraqi laws and authority requirements.
          </p>
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
              <h3 className="mt-5 font-display text-lg text-navy leading-snug">{service.title}</h3>
              <p className="mt-2 text-sm text-ink/65 leading-relaxed flex-1">{service.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stratiq-blue">
                Learn More
                <Icon
                  name="arrow-right"
                  className="size-3.5 rotate-45 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
