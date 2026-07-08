// Structure only — title/description text lives in
// src/messages/{locale}/home.ts under introduction.points.{key}.
export const introPointKeys = [
  "localNetwork",
  "securityAware",
  "operationalExecution",
  "fullService",
] as const;

export type IntroPointKey = (typeof introPointKeys)[number];
