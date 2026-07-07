import type { IconName } from "@/components/ui/Icon";

export type MarketDynamic = {
  icon: IconName;
  title: string;
  description: string;
};

// EDIT ME: "Exploring Iraq's Market Dynamics" section content
export const marketDynamics: MarketDynamic[] = [
  {
    icon: "bolt",
    title: "Energy & Power Infrastructure",
    description:
      "Grid modernization and generation capacity expansion are opening space for international operators and equipment suppliers.",
  },
  {
    icon: "cpu",
    title: "Digital Transformation",
    description:
      "Government and enterprise digitization programs are creating sustained demand for technology partners.",
  },
  {
    icon: "hard-hat",
    title: "Construction & Reconstruction",
    description:
      "National rebuilding programs continue to drive activity across housing, public buildings, and urban development.",
  },
  {
    icon: "heart-pulse",
    title: "Healthcare Development",
    description:
      "Investment in hospitals, clinics, and medical supply chains is accelerating across Baghdad and the provinces.",
  },
  {
    icon: "shield",
    title: "Security & Defense Support",
    description:
      "Ongoing modernization of security capability creates opportunities for qualified support and equipment providers.",
  },
  {
    icon: "truck",
    title: "Logistics & Trade",
    description:
      "Iraq's position as a regional trade corridor is driving growth in freight, warehousing, and distribution infrastructure.",
  },
  {
    icon: "file-search",
    title: "Public Sector Tenders",
    description:
      "A steady pipeline of ministry and provincial tenders offers structured entry points for qualified international bidders.",
  },
  {
    icon: "trending-up",
    title: "Investment Opportunities",
    description:
      "Reform momentum and reconstruction financing are widening the field for long-term strategic investment.",
  },
];
