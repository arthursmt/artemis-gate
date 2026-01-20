import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FileText, Clock, Shield, CheckCircle, RefreshCw, ArrowRight, Loader2, Inbox, Bug } from "lucide-react";

import { GateLayout } from "@/components/gate/GateLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { isApiConfigured } from "@/config/api";
import { listProposals } from "@/lib/api";
import { HOME_STAGES, getStageLabel, type ExtendedStage } from "@/lib/stages";
import type { ProposalSummary } from "@/types/gate";

// Stage configuration for KPI cards
const STAGE_CONFIG: Array<{
  stage: ExtendedStage;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}> = [
  {
    stage: "DOC_REVIEW",
    description: "New proposals to review",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    stage: "UNDER_EVAL",
    description: "Analysis in progress",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    stage: "RISK_REVIEW",
    description: "Sent to risk evaluation",
    icon: Shield,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    stage: "APPROVED",
    description: "Finished reviews",
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
];

export default function HomePage() {
  const configured = isApiConfigured();

  // Query all stages in parallel using centralized HOME_STAGES
  const queries = HOME_STAGES.map((stage) =>
    useQuery<ProposalSummary[]>({
      queryKey: ["/api/gate/proposals", stage],
      queryFn: () => listProposals(stage),
      enabled: configured,
      staleTime: 60000,
      refetchInterval: 45000,
      retry: 1,
    })
  );

  const anyLoading = queries.some((q) => q.isLoading);
  const anyError = queries.find((q) => q.isError)?.error;

  // Safe counts - handles undefined, null, or error cases
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    HOME_STAGES.forEach((stage, idx) => {
      const data = queries[idx].data;
      map[stage] = Array.isArray(data) ? data.length : 0;
    });
    return map;
  }, [queries]);

  const onRefresh = () => {
    queries.forEach((q) => q.refetch());
  };

  return (
    <GateLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
              Gate Overview
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-page-subtitle">
              Operational overview of incoming credit proposals
            </p>
          </div>

          <Button 
            variant="outline" 
            onClick={onRefresh} 
            disabled={!configured || anyLoading} 
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${anyLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* API not configured warning */}
        {!configured && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="py-4">
              <p className="text-amber-800 dark:text-amber-200 text-sm text-center">
                API not configured. Set <span className="font-mono">VITE_API_BASE_URL</span> to load dashboard data.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {configured && anyError && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="py-4">
              <p className="text-red-800 dark:text-red-200 text-sm text-center">
                {anyError instanceof Error ? anyError.message : "Failed to load dashboard data"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* KPI / Status Cards - 4 cards as required */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGE_CONFIG.map((config, idx) => {
            const Icon = config.icon;
            const q = queries[idx];
            const count = counts[config.stage] ?? 0;

            return (
              <Card key={config.stage} className="overflow-hidden" data-testid={`card-stage-${config.stage.toLowerCase()}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-md ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    {q.isLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground mt-2">
                    {getStageLabel(config.stage)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold" data-testid={`count-${config.stage.toLowerCase()}`}>
                        {q.isLoading ? "—" : q.isError ? "0" : count}
                      </p>
                      <CardDescription className="mt-1">{config.description}</CardDescription>
                    </div>
                    <Link href={`/gate/inbox?stage=${config.stage}`}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        disabled={!configured}
                        data-testid={`button-view-${config.stage.toLowerCase()}`}
                      >
                        View
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Navigate to key areas of the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/gate/inbox">
                <Button data-testid="button-go-inbox">
                  <Inbox className="mr-2 h-4 w-4" />
                  Go to Inbox
                </Button>
              </Link>
              <Link href="/gate/debug">
                <Button variant="outline" data-testid="button-go-debug">
                  <Bug className="mr-2 h-4 w-4" />
                  Debug & Connectivity
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </GateLayout>
  );
}
