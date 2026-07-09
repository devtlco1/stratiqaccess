// Structure only — title/body and question/answer text live in
// src/messages/{locale}/services.ts under sections.{key} and faq.{key}.
export const serviceIndexSectionKeys = [
  "marketEntry",
  "tenderIntelligence",
  "groundOperations",
] as const;

export const serviceIndexFaqKeys = [
  "whatWeDo",
  "tenderGuarantee",
  "shortVisits",
  "sectors",
  "legalScope",
  "gettingStarted",
] as const;
