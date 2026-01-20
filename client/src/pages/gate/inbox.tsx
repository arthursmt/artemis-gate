import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { FileText, Users, DollarSign, Calendar, Loader2, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GateLayout } from "@/components/gate/GateLayout";
import { StageBadge } from "@/components/gate/StageBadge";
import { isApiConfigured } from "@/config/api";
import { listProposals } from "@/lib/api";
import { getGateRole, getDefaultStage } from "@/lib/gateStore";
import { type GateRole, type GateStage, GATE_STAGES, STAGE_LABELS } from "@/lib/stages";
import { formatDate, formatCurrency, formatValue } from "@/lib/selectors";
import type { ProposalSummary } from "@/types/gate";

export default function InboxPage() {
  const [role, setRole] = useState<GateRole>(getGateRole);
  const [stage, setStage] = useState(() => getDefaultStage(getGateRole()));

  useEffect(() => {
    const currentRole = getGateRole();
    if (currentRole !== role) {
      setRole(currentRole);
      setStage(getDefaultStage(currentRole));
    }
  }, [role]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentRole = getGateRole();
      if (currentRole !== role) {
        setRole(currentRole);
        setStage(getDefaultStage(currentRole));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [role]);

  const { data: proposals, isLoading, isError, error, refetch } = useQuery<ProposalSummary[]>({
    queryKey: ["/api/gate/proposals", stage],
    queryFn: () => listProposals(stage),
    enabled: isApiConfigured(),
    refetchInterval: 30000,
  });

  const sortedProposals = useMemo(() => {
    if (!proposals) return [];
    return [...proposals].sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [proposals]);

  return (
    <GateLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Proposal Inbox</h2>
            <p className="text-muted-foreground mt-1">
              Review and process loan proposals
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="w-40" data-testid="select-stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GATE_STAGES.map((s) => (
                  <SelectItem key={s} value={s} data-testid={`select-item-stage-${s.toLowerCase()}`}>
                    {STAGE_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {!isApiConfigured() && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="py-6">
              <p className="text-amber-800 dark:text-amber-200 text-center">
                API not configured. Please set VITE_API_BASE_URL to load proposals.
              </p>
            </CardContent>
          </Card>
        )}

        {isApiConfigured() && isLoading && (
          <Card>
            <CardContent className="py-12 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {isApiConfigured() && isError && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="py-6">
              <p className="text-red-800 dark:text-red-200 text-center">
                {error instanceof Error ? error.message : "Failed to load proposals"}
              </p>
            </CardContent>
          </Card>
        )}

        {isApiConfigured() && !isLoading && !isError && sortedProposals.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No proposals found for stage: {stage}</p>
            </CardContent>
          </Card>
        )}

        {isApiConfigured() && !isLoading && !isError && sortedProposals.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group ID</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead className="text-center">Members</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-center">Evidence</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProposals.map((proposal) => (
                    <TableRow key={proposal.proposalId} data-testid={`row-proposal-${proposal.proposalId}`}>
                      <TableCell className="font-mono text-sm" data-testid="cell-group-id">
                        {formatValue(proposal.groupId)}
                      </TableCell>
                      <TableCell data-testid="cell-leader">
                        {formatValue(proposal.leaderName)}
                      </TableCell>
                      <TableCell className="text-center" data-testid="cell-members">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{formatValue(proposal.membersCount)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium" data-testid="cell-amount">
                        {formatCurrency(proposal.totalAmount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground" data-testid="cell-submitted">
                        {formatDate(proposal.submittedAt)}
                      </TableCell>
                      <TableCell className="text-center" data-testid="cell-evidence">
                        <span className="text-sm">
                          {proposal.evidenceCompletedCount ?? "--"}/{proposal.evidenceRequiredCount ?? "--"}
                        </span>
                      </TableCell>
                      <TableCell data-testid="cell-stage">
                        <StageBadge stage={proposal.stage} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/gate/proposals/${proposal.proposalId}`}>
                          <Button size="sm" variant="ghost" className="gap-1" data-testid={`button-open-${proposal.proposalId}`}>
                            Open
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {sortedProposals.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing {sortedProposals.length} proposal{sortedProposals.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </GateLayout>
  );
}
