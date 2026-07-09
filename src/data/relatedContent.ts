// Lightweight, hand-curated "related" link sets shown at the bottom of a
// service or insight detail page. Static (not DB-driven) since the set of
// cross-links is small and editorial — titles are duplicated here rather
// than fetched, avoiding extra queries per detail page render.
export type RelatedLink = { href: string; label: string; label_ar: string };

export const SERVICE_RELATED: Record<string, RelatedLink[]> = {
  "iraq-market-entry-services": [
    { href: "/services/local-representation-in-iraq", label: "Local Representation in Iraq", label_ar: "التمثيل المحلي في العراق" },
    { href: "/services/tender-intelligence-iraq", label: "Tender Intelligence Iraq", label_ar: "رصد المناقصات في العراق" },
    { href: "/insights/how-foreign-companies-can-enter-the-iraqi-market", label: "How Foreign Companies Can Enter the Iraqi Market", label_ar: "كيف يمكن للشركات الأجنبية دخول السوق العراقي" },
  ],
  "local-representation-in-iraq": [
    { href: "/services/iraq-market-entry-services", label: "Iraq Market Entry Services", label_ar: "خدمات دخول السوق العراقي" },
    { href: "/services/legal-representation", label: "Legal Representation", label_ar: "التمثيل القانوني" },
    { href: "/insights/why-local-representation-matters-in-iraq", label: "Why Local Representation Matters for Doing Business in Iraq", label_ar: "لماذا يهم التمثيل المحلي في العراق" },
  ],
  "tender-intelligence-iraq": [
    { href: "/services/business-development-support-iraq", label: "Business Development Support Iraq", label_ar: "دعم تطوير الأعمال في العراق" },
    { href: "/services/contract-attestation", label: "Contract Attestation", label_ar: "تصديق العقود" },
    { href: "/insights/tender-intelligence-in-iraq-what-international-companies-should-know", label: "Tender Intelligence in Iraq: What International Companies Should Know", label_ar: "رصد المناقصات في العراق: ما يجب أن تعرفه الشركات الدولية" },
  ],
  "logistics-coordination-in-iraq": [
    { href: "/services/internal-transportation", label: "Internal Transportation", label_ar: "النقل الداخلي" },
    { href: "/services/secure-accommodation", label: "Secure Accommodation", label_ar: "الإقامة الآمنة" },
    { href: "/insights/logistics-coordination-in-iraq-for-foreign-companies", label: "Logistics Coordination in Iraq for Foreign Companies", label_ar: "تنسيق اللوجستيات في العراق للشركات الأجنبية" },
  ],
  "business-development-support-iraq": [
    { href: "/services/tender-intelligence-iraq", label: "Tender Intelligence Iraq", label_ar: "رصد المناقصات في العراق" },
    { href: "/services/iraq-market-entry-services", label: "Iraq Market Entry Services", label_ar: "خدمات دخول السوق العراقي" },
    { href: "/sectors", label: "Sectors We Support", label_ar: "القطاعات التي ندعمها" },
  ],
  "ground-operations-partner-in-iraq": [
    { href: "/services/field-operations-support", label: "Field Operations Support", label_ar: "دعم العمليات الميدانية" },
    { href: "/services/private-security-coordination", label: "Private Security Coordination", label_ar: "تنسيق الأمن الخاص" },
    { href: "/services/logistics-coordination-in-iraq", label: "Logistics Coordination in Iraq", label_ar: "تنسيق اللوجستيات في العراق" },
  ],
  "internal-transportation": [
    { href: "/services/logistics-coordination-in-iraq", label: "Logistics Coordination in Iraq", label_ar: "تنسيق اللوجستيات في العراق" },
  ],
  "secure-accommodation": [
    { href: "/services/logistics-coordination-in-iraq", label: "Logistics Coordination in Iraq", label_ar: "تنسيق اللوجستيات في العراق" },
  ],
  "legal-representation": [
    { href: "/services/local-representation-in-iraq", label: "Local Representation in Iraq", label_ar: "التمثيل المحلي في العراق" },
  ],
  "legal-advisory": [
    { href: "/services/local-representation-in-iraq", label: "Local Representation in Iraq", label_ar: "التمثيل المحلي في العراق" },
  ],
  "contract-attestation": [
    { href: "/services/tender-intelligence-iraq", label: "Tender Intelligence Iraq", label_ar: "رصد المناقصات في العراق" },
  ],
  "field-operations-support": [
    { href: "/services/ground-operations-partner-in-iraq", label: "Ground Operations Partner in Iraq", label_ar: "شريك العمليات الميدانية في العراق" },
  ],
};

export const INSIGHT_RELATED: Record<string, RelatedLink[]> = {
  "how-foreign-companies-can-enter-the-iraqi-market": [
    { href: "/services/iraq-market-entry-services", label: "Iraq Market Entry Services", label_ar: "خدمات دخول السوق العراقي" },
    { href: "/services/local-representation-in-iraq", label: "Local Representation in Iraq", label_ar: "التمثيل المحلي في العراق" },
  ],
  "tender-intelligence-in-iraq-what-international-companies-should-know": [
    { href: "/services/tender-intelligence-iraq", label: "Tender Intelligence Iraq", label_ar: "رصد المناقصات في العراق" },
    { href: "/services/business-development-support-iraq", label: "Business Development Support Iraq", label_ar: "دعم تطوير الأعمال في العراق" },
  ],
  "logistics-coordination-in-iraq-for-foreign-companies": [
    { href: "/services/logistics-coordination-in-iraq", label: "Logistics Coordination in Iraq", label_ar: "تنسيق اللوجستيات في العراق" },
    { href: "/services/ground-operations-partner-in-iraq", label: "Ground Operations Partner in Iraq", label_ar: "شريك العمليات الميدانية في العراق" },
  ],
  "why-local-representation-matters-in-iraq": [
    { href: "/services/local-representation-in-iraq", label: "Local Representation in Iraq", label_ar: "التمثيل المحلي في العراق" },
    { href: "/services/iraq-market-entry-services", label: "Iraq Market Entry Services", label_ar: "خدمات دخول السوق العراقي" },
  ],
};
