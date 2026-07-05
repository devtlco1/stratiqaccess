import { Container } from "@/components/ui/Container";

const items = [
  { value: "9", label: "Strategic Sectors Monitored" },
  { value: "NDA", label: "Protected Engagement Model" },
  { value: "100%", label: "Formal Representation Mandates" },
  { value: "Iraq", label: "Registered Commercial Structure" },
];

export function TrustStrip() {
  return (
    <div className="border-y border-ivory-100/8 bg-navy-950">
      <Container>
        <div className="grid grid-cols-2 divide-x divide-y divide-ivory-100/8 sm:grid-cols-4 sm:divide-y-0">
          {items.map((item) => (
            <div key={item.label} className="px-6 py-8 text-center sm:text-left">
              <p className="text-3xl font-semibold text-gold-400">{item.value}</p>
              <p className="mt-2 text-sm text-muted-500">{item.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
