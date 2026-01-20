import { type GateRole, getDefaultStageForRole } from "./stages";

const ROLE_KEY = "gateRole";
const USER_ID_KEY = "gateUserId";

export type { GateRole };

export function getGateRole(): GateRole {
  const stored = localStorage.getItem(ROLE_KEY);
  if (stored === "OPS" || stored === "RISK") {
    return stored;
  }
  return "OPS";
}

export function setGateRole(role: GateRole): void {
  localStorage.setItem(ROLE_KEY, role);
}

export function getGateUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export function getDefaultStage(role: GateRole): string {
  return getDefaultStageForRole(role);
}
