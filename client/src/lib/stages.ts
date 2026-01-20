// Core decision stages used in Gate operations
export type GateStage = "DOC_REVIEW" | "RISK_REVIEW" | "APPROVED" | "REJECTED";
export type GateRole = "OPS" | "RISK";

// Extended stages that may appear in proposals from ARISE
export type ExtendedStage = GateStage | "UNDER_EVAL" | "COMPLETED" | "ON_GOING" | "RISK_EVAL";

export const GATE_STAGES: GateStage[] = ["DOC_REVIEW", "RISK_REVIEW", "APPROVED", "REJECTED"];
export const GATE_ROLES: GateRole[] = ["OPS", "RISK"];

// Stages shown on Home page overview
export const HOME_STAGES: ExtendedStage[] = ["DOC_REVIEW", "UNDER_EVAL", "RISK_REVIEW", "APPROVED"];

export const STAGE_LABELS: Record<string, string> = {
  DOC_REVIEW: "Doc Review",
  RISK_REVIEW: "Risk Review",
  RISK_EVAL: "Risk Review",
  APPROVED: "Approved",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  UNDER_EVAL: "Under Evaluation",
  ON_GOING: "On Going",
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
  return STAGE_LABELS[stage] || stage.replace(/_/g, " ");
}
