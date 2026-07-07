import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ServiceRow } from "@/lib/types";
import { Container } from "@/components/ui/Container";

export async function Services() {
  const supabase = await createClient();
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
              Our Services
            </h2>
          </div>
          <p className="text-base sm:text-lg text-ink/70 leading-relaxed">
            Practical advisory services for companies entering and expanding in Iraq — every
            engagement is built around execution, not just recommendations.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group relative block aspect-4/3 overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {service.image_url && (
                <Image
                  src={service.image_url}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
              <div className="absolute inset-0 flex items-end p-5">
                <h3 className="font-display text-lg text-white leading-snug">{service.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
