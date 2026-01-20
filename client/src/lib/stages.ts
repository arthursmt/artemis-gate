// Core decision stages used in Gate operations - these are the ONLY valid backend stages
export type GateStage = "DOC_REVIEW" | "RISK_REVIEW" | "APPROVED" | "REJECTED";
export type GateRole = "OPS" | "RISK";

// Valid backend stages - use ONLY these when calling API
export const VALID_STAGES: GateStage[] = ["DOC_REVIEW", "RISK_REVIEW", "APPROVED", "REJECTED"];
export const GATE_STAGES = VALID_STAGES; // Alias for backward compat
export const GATE_ROLES: GateRole[] = ["OPS", "RISK"];

export const STAGE_LABELS: Record<GateStage, string> = {
  DOC_REVIEW: "Doc Review",
  RISK_REVIEW: "Risk Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function getDefaultStageForRole(role: GateRole): GateStage {
  return role === "OPS" ? "DOC_REVIEW" : "RISK_REVIEW";
}

export function canRoleDecideAtStage(role: GateRole, stage: GateStage | undefined): boolean {
  if (!stage) return false;
  if (role === "OPS" && stage === "DOC_REVIEW") return true;
  if (role === "RISK" && stage === "RISK_REVIEW") return true;
  return false;
}

export function getStageLabel(stage: string | undefined): string {
  if (!stage) return "--";
  return STAGE_LABELS[stage as GateStage] || stage.replace(/_/g, " ");
}
