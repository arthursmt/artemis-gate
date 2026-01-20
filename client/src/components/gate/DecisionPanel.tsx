import { useState } from "react";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getGateRole, getGateUserId } from "@/lib/gateStore";
import { OPS_REJECTION_REASONS, RISK_REJECTION_REASONS } from "@/types/gate";
import type { DecisionPayload } from "@/types/gate";

interface DecisionPanelProps {
  proposalId: string;
  currentStage: string | undefined;
  onSubmit: (payload: DecisionPayload) => Promise<void>;
  isSubmitting: boolean;
}

export function DecisionPanel({ proposalId, currentStage, onSubmit, isSubmitting }: DecisionPanelProps) {
  const role = getGateRole();
  const userId = getGateUserId();

  const canDecide =
    (role === "OPS" && currentStage === "DOC_REVIEW") ||
    (role === "RISK" && currentStage === "RISK_REVIEW");

  const [decision, setDecision] = useState<"APPROVE" | "REJECT" | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const reasons = role === "OPS" ? OPS_REJECTION_REASONS : RISK_REJECTION_REASONS;

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const isValid =
    decision !== null &&
    (decision === "APPROVE" || (decision === "REJECT" && comment.trim().length > 0));

  const handleSubmit = async () => {
    if (!decision || !currentStage) return;

    await onSubmit({
      stage: currentStage,
      decision,
      reasons: selectedReasons,
      comment: comment.trim(),
      userId,
    });

    setShowConfirmModal(false);
  };

  const openConfirmModal = () => {
    if (isValid) {
      setShowConfirmModal(true);
    }
  };

  if (!canDecide) {
    return (
      <Card className="border-amber-200 dark:border-amber-800">
        <CardContent className="py-6">
          <Alert className="border-0 bg-transparent p-0">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              {role === "OPS" && currentStage !== "DOC_REVIEW" && (
                <>OPS can only make decisions when the proposal is in DOC_REVIEW stage.</>
              )}
              {role === "RISK" && currentStage !== "RISK_REVIEW" && (
                <>RISK can only make decisions when the proposal is in RISK_REVIEW stage.</>
              )}
              {!currentStage && <>Unable to determine proposal stage.</>}
              <br />
              <span className="text-sm">Current stage: {currentStage || "--"}</span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Make Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={decision === "APPROVE" ? "default" : "outline"}
              onClick={() => setDecision("APPROVE")}
              disabled={isSubmitting}
              data-testid="button-approve"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant={decision === "REJECT" ? "destructive" : "outline"}
              onClick={() => setDecision("REJECT")}
              disabled={isSubmitting}
              data-testid="button-reject"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>

          {decision === "REJECT" && (
            <div className="space-y-3">
              <Label>Rejection Reasons (optional)</Label>
              <div className="grid grid-cols-1 gap-2">
                {reasons.map((reason) => (
                  <div key={reason} className="flex items-center space-x-2">
                    <Checkbox
                      id={reason}
                      checked={selectedReasons.includes(reason)}
                      onCheckedChange={() => toggleReason(reason)}
                      disabled={isSubmitting}
                      data-testid={`checkbox-reason-${reason.slice(0, 20)}`}
                    />
                    <label htmlFor={reason} className="text-sm cursor-pointer">
                      {reason}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">
              Comment {decision === "REJECT" && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={decision === "REJECT" ? "Required: explain rejection reason..." : "Optional comment..."}
              disabled={isSubmitting}
              rows={3}
              data-testid="textarea-comment"
            />
          </div>

          <Button
            className="w-full"
            onClick={openConfirmModal}
            disabled={!isValid || isSubmitting}
            data-testid="button-confirm-decision"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Confirm Decision"
            )}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Decision</DialogTitle>
            <DialogDescription>
              Are you sure you want to <strong>{decision?.toLowerCase()}</strong> this proposal?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Proposal ID:</span> {proposalId}
            </p>
            <p>
              <span className="text-muted-foreground">Decision:</span>{" "}
              <span className={decision === "APPROVE" ? "text-green-600" : "text-red-600"}>
                {decision}
              </span>
            </p>
            {selectedReasons.length > 0 && (
              <p>
                <span className="text-muted-foreground">Reasons:</span> {selectedReasons.join(", ")}
              </p>
            )}
            {comment && (
              <p>
                <span className="text-muted-foreground">Comment:</span> {comment}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting} data-testid="button-cancel-decision">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant={decision === "APPROVE" ? "default" : "destructive"}
              data-testid="button-final-confirm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Confirm ${decision}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
