import { Badge } from "@/components/ui/badge";
import { type GateStage, STAGE_LABELS } from "@/lib/stages";

interface StageBadgeProps {
  stage: GateStage | string | undefined;
}

const stageStyles: Record<string, { className: string }> = {
  DOC_REVIEW: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  RISK_REVIEW: { className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  APPROVED: { className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  REJECTED: { className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export function StageBadge({ stage }: StageBadgeProps) {
  if (!stage) {
    return <Badge variant="outline">--</Badge>;
  }

  const style = stageStyles[stage] || { className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" };
  const label = STAGE_LABELS[stage as GateStage] || stage;

  return (
    <Badge className={style.className} variant="outline" data-testid={`badge-stage-${stage.toLowerCase()}`}>
      {label}
    </Badge>
  );
}
