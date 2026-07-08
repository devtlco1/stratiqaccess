import type { IconName } from "@/components/ui/Icon";

export type MarketDynamicKey =
  | "groundOperations"
  | "logisticsMobility"
  | "localNetwork"
  | "legalAdministrative"
  | "staffing"
  | "events"
  | "securityPermits"
  | "procurement";

export type MarketDynamic = {
  key: MarketDynamicKey;
  icon: IconName;
};

// "What We Cover on the Ground" section — icon + order only; title/description
// text lives in src/messages/{locale}/home.ts under introduction.dynamics.{key}.
export const marketDynamics: MarketDynamic[] = [
  { key: "groundOperations", icon: "compass" },
  { key: "logisticsMobility", icon: "truck" },
  { key: "localNetwork", icon: "handshake" },
  { key: "legalAdministrative", icon: "landmark" },
  { key: "staffing", icon: "users" },
  { key: "events", icon: "calendar" },
  { key: "securityPermits", icon: "shield-check" },
  { key: "procurement", icon: "package" },
];
