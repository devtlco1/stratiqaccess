import Image from "next/image";
import { createPublicClient } from "@/lib/supabase/public";
import type { ClientRow } from "@/lib/types";
import { Container } from "@/components/ui/Container";

export async function OurClients({ showWhenEmpty = false }: { showWhenEmpty?: boolean } = {}) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  const clients = (data ?? []) as ClientRow[];

  if (clients.length === 0 && !showWhenEmpty) return null;

  return (
    <section id="clients" className="scroll-mt-24 py-24 lg:py-32 bg-white">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-stratiq-blue">
            Our Clients
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.75rem] text-navy leading-tight">
            Our Clients
          </h2>
          <p className="mt-5 text-base sm:text-lg text-ink/70 leading-relaxed">
            Trusted by companies and organizations operating, visiting, and expanding across Iraq.
          </p>
        </div>

        {clients.length === 0 ? (
          <p className="mt-16 text-center text-sm text-ink/60">
            We&rsquo;re onboarding our first clients — check back soon.
          </p>
        ) : (
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {clients.map((client) => (
              <ClientLogo key={client.id} client={client} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function ClientLogo({ client }: { client: ClientRow }) {
  const content = client.logo_url ? (
    <div className="relative h-14 w-full">
      <Image
        src={client.logo_url}
        alt={client.name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-contain grayscale opacity-70 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
      />
    </div>
  ) : (
    <span className="text-sm font-medium text-ink/60 text-center transition-colors duration-300 group-hover:text-navy">
      {client.name}
    </span>
  );

  const className =
    "group flex items-center justify-center rounded-lg border border-navy/10 bg-paper p-6 h-24 transition-colors duration-300 hover:border-stratiq-blue/30";

  if (client.website_url) {
    return (
      <a href={client.website_url} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
