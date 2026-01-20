import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  FileText,
  Users,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { GateLayout } from "@/components/gate/GateLayout";
import { StageBadge } from "@/components/gate/StageBadge";

import { isApiConfigured } from "@/config/api";
import { listProposals } from "@/lib/api";
import { getGateRole, getDefaultStage } from "@/lib/gateStore";
import {
  type GateRole,
  GATE_STAGES,
  STAGE_LABELS,
} from "@/lib/stages";

import {
  formatDate,
  formatCurrency,
  formatValue,
} from "@/lib/selectors";

import type { ProposalSummary } from "@/types/gate";

export default function InboxPage() {
  const [role, setRole] = useState<GateRole>(getGateRole);
  const [stage, setStage] = useState(() =>
    getDefaultStage(getGateRole())
  );

  /**
   * Sync role + stage if role changes externally
   */
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

  /**
   * Fetch proposals
   */
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/gate/proposals", stage],
    queryFn: () => listProposals(stage),
    enabled: isApiConfigured(),
    refetchInterval: 30_000,
  });

  /**
   * 🔐 NORMALIZATION LAYER
   * Guarantees proposals is ALWAYS an array
   */
  const proposals: ProposalSummary[] = useMemo(() => {
    if (!data) return [];

    // Backend might return array directly
    if (Array.isArray(data)) return data;

    // Or wrapped response { items: [...] }
    if (
      typeof data === "object" &&
      data !== null &&
      Array.isArray((data as any).items)
    ) {
      return (data as any).items;
    }

    return [];
  }, [data]);

  /**
   * Sort by submission date (desc)
   */
  const sortedProposals = useMemo(() => {
    return [...proposals].sort((a, b) => {
      const dateA = a.submittedAt
        ? new Date(a.submittedAt).getTime()
        : 0;
      const dateB = b.submittedAt
        ? new Date(b.submittedAt).getTime()
        : 0;
      return dateB - dateA;
    });
  }, [proposals]);

  return (
    <GateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Proposal Inbox
            </h2>
            <p className="text-muted-foreground mt-1">
              Review and process loan proposals
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GATE_STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
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
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {/* API not configured */}
        {!isApiConfigured() && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="py-6 text-center">
              API not configured. Please set
              VITE_API_BASE_URL.
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {isApiConfigured() && isLoading && (
          <Card>
            <CardContent className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {isApiConfigured() && isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-6 text-center text-red-700">
              {error instanceof Error
                ? error.message
                : "Failed to load proposals"}
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {isApiConfigured() &&
          !isLoading &&
          !isError &&
          sortedProposals.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                No proposals found for stage: {stage}
              </CardContent>
            </Card>
          )}

        {/* Table */}
        {sortedProposals.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group ID</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead className="text-center">
                      Members
                    </TableHead>
                    <TableHead className="text-right">
                      Total Amount
                    </TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-center">
                      Evidence
                    </TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead className="text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProposals.map((p) => (
                    <TableRow key={p.proposalId}>
                      <TableCell className="font-mono text-sm">
                        {formatValue(p.groupId)}
                      </TableCell>
                      <TableCell>
                        {formatValue(p.leaderName)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4" />
                          {formatValue(p.membersCount)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(p.totalAmount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(p.submittedAt)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {p.evidenceCompletedCount ?? "--"} /
                        {p.evidenceRequiredCount ?? "--"}
                      </TableCell>
                      <TableCell>
                        <StageBadge stage={p.stage} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/gate/proposals/${p.proposalId}`}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1"
                          >
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
            Showing {sortedProposals.length} proposal
            {sortedProposals.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </GateLayout>
  );
}
