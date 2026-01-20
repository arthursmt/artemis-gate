import { History, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProposalDecision } from "@/types/gate";
import { formatDate, formatValue } from "@/lib/selectors";

interface AuditTrailProps {
  decisions: ProposalDecision[] | undefined;
}

export function AuditTrail({ decisions }: AuditTrailProps) {
  if (!decisions || decisions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Decision History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No decisions recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Decision History ({decisions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {decisions.map((decision, idx) => (
            <div
              key={idx}
              className="relative pl-6 pb-4 border-l-2 border-muted last:border-l-0 last:pb-0"
              data-testid={`decision-${idx}`}
            >
              <div className="absolute -left-2 top-0">
                {decision.decision === "APPROVE" ? (
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                    <XCircle className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={
                      decision.decision === "APPROVE"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }
                  >
                    {formatValue(decision.decision)}
                  </Badge>
                  <Badge variant="secondary">{formatValue(decision.stage)}</Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  By: <span className="font-mono">{formatValue(decision.userId)?.slice(0, 8)}...</span>
                  {" at "}
                  {formatDate(decision.decidedAt)}
                </p>

                {decision.reasons && decision.reasons.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Reasons: </span>
                    {decision.reasons.join(", ")}
                  </div>
                )}

                {decision.comment && (
                  <p className="text-sm bg-muted p-2 rounded-md">
                    {decision.comment}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
