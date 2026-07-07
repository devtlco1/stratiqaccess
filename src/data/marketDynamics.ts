import type { IconName } from "@/components/ui/Icon";

export type MarketDynamic = {
  icon: IconName;
  title: string;
  description: string;
};

// EDIT ME: "What We Cover on the Ground" section content — the core pillars
// of on-the-ground support STRATIQ Access coordinates for clients in Iraq.
export const marketDynamics: MarketDynamic[] = [
  {
    icon: "compass",
    title: "Ground Operations",
    description:
      "End-to-end coordination for teams operating, visiting, or expanding in Iraq, from arrival to project close-out.",
  },
  {
    icon: "truck",
    title: "Logistics & Mobility",
    description:
      "Secure transport, drivers, and movement planning for delegations, engineers, and project teams across the country.",
  },
  {
    icon: "handshake",
    title: "Local Network",
    description:
      "Trusted introductions to Iraqi stakeholders, partners, suppliers, and authorities who move projects forward.",
  },
  {
    icon: "landmark",
    title: "Legal & Administrative Support",
    description:
      "Contract attestation, documentation coordination, and legal advisory through trusted Iraqi legal partners.",
  },
  {
    icon: "users",
    title: "Staffing & Field Teams",
    description:
      "Freelance and local staffing — interpreters, engineers, coordinators, and technical workers, short or long term.",
  },
  {
    icon: "calendar",
    title: "Events & Delegations",
    description:
      "Full logistics for business events, delegations, and government or private-sector meetings, from venue to translation.",
  },
  {
    icon: "shield-check",
    title: "Security & Permits",
    description:
      "Coordination with licensed private security providers and support with permit and access documentation.",
  },
  {
    icon: "package",
    title: "Procurement & Supplies",
    description:
      "Food supply, office supplies, and site procurement for teams, camps, and project locations across Iraq.",
  },
];
