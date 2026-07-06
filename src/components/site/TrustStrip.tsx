import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

type TrustItem = { value: string; label: string };

export function TrustStrip() {
  const t = useTranslations("home.trustStrip");
  const items = t.raw("items") as TrustItem[];

  return (
    <div className="border-y border-ivory-100/8 bg-navy-950">
      <Container>
        <div className="grid grid-cols-2 divide-x divide-y divide-ivory-100/8 sm:grid-cols-4 sm:divide-y-0 rtl:divide-x-reverse">
          {items.map((item) => (
            <div key={item.label} className="px-6 py-8 text-center sm:text-start">
              <p className="text-gradient-gold text-3xl font-semibold">{item.value}</p>
              <p className="mt-2 text-sm text-muted-500">{item.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
