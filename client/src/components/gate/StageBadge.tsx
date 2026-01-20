import { Badge } from "@/components/ui/badge";

interface StageBadgeProps {
  stage: string | undefined;
}

const stageStyles: Record<string, { className: string; label: string }> = {
  DOC_REVIEW: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Doc Review" },
  RISK_REVIEW: { className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", label: "Risk Review" },
  APPROVED: { className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Approved" },
  REJECTED: { className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Rejected" },
};

export function StageBadge({ stage }: StageBadgeProps) {
  if (!stage) {
    return <Badge variant="outline">--</Badge>;
  }

  const style = stageStyles[stage] || { className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", label: stage };

  return (
    <Badge className={style.className} variant="outline" data-testid={`badge-stage-${stage.toLowerCase()}`}>
      {style.label}
    </Badge>
  );
}
