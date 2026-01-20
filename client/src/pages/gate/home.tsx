import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, Clock, Shield, CheckCircle, RefreshCw, ArrowRight, Loader2, 
  Inbox, Bug, TrendingUp, Users, DollarSign, AlertTriangle, Wallet 
} from "lucide-react";

import { GateLayout } from "@/components/gate/GateLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { isApiConfigured, getApiBaseUrl } from "@/config/api";
import { listProposals } from "@/lib/api";
import { formatCurrency, formatValue } from "@/lib/selectors";
import type { ProposalSummary } from "@/types/gate";

// Backend valid stages ONLY - do not call stages backend doesn't recognize
const VALID_STAGES = ["DOC_REVIEW", "RISK_REVIEW", "APPROVED", "REJECTED"] as const;
type ValidStage = typeof VALID_STAGES[number];

// Metrics endpoint - may not exist yet
async function fetchMetrics(): Promise<Record<string, unknown> | null> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return null;
  try {
    const res = await fetch(`${baseUrl}/api/gate/metrics?period=month`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function HomePage() {
  const configured = isApiConfigured();

  // Query only valid backend stages
  const docReviewQuery = useQuery<ProposalSummary[]>({
    queryKey: ["/api/gate/proposals", "DOC_REVIEW"],
    queryFn: () => listProposals("DOC_REVIEW"),
    enabled: configured,
    staleTime: 60000,
    retry: 1,
  });

  const riskReviewQuery = useQuery<ProposalSummary[]>({
    queryKey: ["/api/gate/proposals", "RISK_REVIEW"],
    queryFn: () => listProposals("RISK_REVIEW"),
    enabled: configured,
    staleTime: 60000,
    retry: 1,
  });

  const approvedQuery = useQuery<ProposalSummary[]>({
    queryKey: ["/api/gate/proposals", "APPROVED"],
    queryFn: () => listProposals("APPROVED"),
    enabled: configured,
    staleTime: 60000,
    retry: 1,
  });

  const rejectedQuery = useQuery<ProposalSummary[]>({
    queryKey: ["/api/gate/proposals", "REJECTED"],
    queryFn: () => listProposals("REJECTED"),
    enabled: configured,
    staleTime: 60000,
    retry: 1,
  });

  // Optional metrics endpoint
  const metricsQuery = useQuery({
    queryKey: ["/api/gate/metrics"],
    queryFn: fetchMetrics,
    enabled: configured,
    staleTime: 300000,
    retry: 0,
  });

  const allQueries = [docReviewQuery, riskReviewQuery, approvedQuery, rejectedQuery];
  const anyLoading = allQueries.some((q) => q.isLoading);
  const stageErrors = allQueries.filter((q) => q.isError);

  // Compute counts defensively
  const counts = useMemo(() => {
    const safeLen = (data: unknown) => (Array.isArray(data) ? data.length : 0);
    
    const docReview = safeLen(docReviewQuery.data);
    const riskReview = safeLen(riskReviewQuery.data);
    const approved = safeLen(approvedQuery.data);
    const rejected = safeLen(rejectedQuery.data);
    
    // "In Progress" is derived - we can't reliably detect from API, so show 0
    // In future, could inspect proposals for signs of being worked on
    const inProgress = 0;
    
    // "Completed" = APPROVED + REJECTED
    const completed = approved + rejected;
    
    return { docReview, inProgress, riskReview, completed, approved, rejected };
  }, [docReviewQuery.data, riskReviewQuery.data, approvedQuery.data, rejectedQuery.data]);

  // Extract metrics if available
  const metrics = useMemo(() => {
    const data = metricsQuery.data;
    if (!data) return null;
    return {
      approvedCount: typeof data.approvedCount === "number" ? data.approvedCount : undefined,
      approvedAmount: typeof data.approvedAmount === "number" ? data.approvedAmount : undefined,
      newClients: typeof data.newClients === "number" ? data.newClients : undefined,
      activeClients: typeof data.activeClients === "number" ? data.activeClients : undefined,
      portfolioSize: typeof data.portfolioSize === "number" ? data.portfolioSize : undefined,
      delinquencyRate: typeof data.delinquencyRate === "number" ? data.delinquencyRate : undefined,
      disbursements: typeof data.disbursements === "number" ? data.disbursements : undefined,
    };
  }, [metricsQuery.data]);

  const metricsAvailable = metrics !== null;

  const onRefresh = () => {
    allQueries.forEach((q) => q.refetch());
    metricsQuery.refetch();
  };

  // Workflow card config - maps to valid backend stages
  const workflowCards = [
    {
      id: "doc_review",
      label: "Doc Review",
      description: "New to review",
      count: counts.docReview,
      isLoading: docReviewQuery.isLoading,
      isError: docReviewQuery.isError,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      viewHref: "/gate/inbox?stage=DOC_REVIEW",
    },
    {
      id: "in_progress",
      label: "In Progress",
      description: "Work started, not finished (derived)",
      count: counts.inProgress,
      isLoading: docReviewQuery.isLoading,
      isError: false,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      viewHref: "/gate/inbox?stage=DOC_REVIEW",
      disabled: true,
    },
    {
      id: "risk_review",
      label: "Risk Review",
      description: "Sent to risk evaluation",
      count: counts.riskReview,
      isLoading: riskReviewQuery.isLoading,
      isError: riskReviewQuery.isError,
      icon: Shield,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      viewHref: "/gate/inbox?stage=RISK_REVIEW",
    },
    {
      id: "completed",
      label: "Completed",
      description: "Finished reviews (approved + rejected)",
      count: counts.completed,
      isLoading: approvedQuery.isLoading || rejectedQuery.isLoading,
      isError: approvedQuery.isError || rejectedQuery.isError,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      viewHref: "/gate/inbox?stage=APPROVED",
      note: "Completed proposals view coming soon",
    },
  ];

  // Business performance KPI cards
  const businessCards = [
    {
      id: "approved_month",
      label: "Approved This Month",
      value: metrics?.approvedCount,
      subValue: metrics?.approvedAmount ? formatCurrency(metrics.approvedAmount) : undefined,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "new_clients",
      label: "New Clients",
      value: metrics?.newClients,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "active_clients",
      label: "Total Active Clients",
      value: metrics?.activeClients,
      icon: Users,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      id: "portfolio",
      label: "Credit Portfolio",
      value: metrics?.portfolioSize ? formatCurrency(metrics.portfolioSize) : undefined,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      id: "delinquency",
      label: "Delinquency Rate",
      value: metrics?.delinquencyRate !== undefined ? `${metrics.delinquencyRate.toFixed(1)}%` : undefined,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      id: "disbursements",
      label: "Disbursements",
      value: metrics?.disbursements ? formatCurrency(metrics.disbursements) : undefined,
      icon: Wallet,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
    },
  ];

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

        {/* SECTION 1: Operational Workflow */}
        <div>
          <h2 className="text-lg font-semibold mb-4" data-testid="text-section-workflow">
            Operational Workflow
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.id} className="overflow-hidden" data-testid={`card-workflow-${card.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-md ${card.bgColor}`}>
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                      {card.isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <CardTitle className="text-sm font-medium text-muted-foreground mt-2">
                      {card.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-3xl font-bold" data-testid={`count-${card.id}`}>
                          {card.isLoading ? "—" : card.isError ? "0" : card.count}
                        </p>
                        <CardDescription className="mt-1 text-xs">{card.description}</CardDescription>
                      </div>
                      {card.disabled ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs"
                          disabled
                          data-testid={`button-view-${card.id}`}
                        >
                          Soon
                        </Button>
                      ) : (
                        <Link href={card.viewHref}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs"
                            disabled={!configured}
                            data-testid={`button-view-${card.id}`}
                          >
                            View
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Business Performance */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold" data-testid="text-section-performance">
                Business Performance
              </h2>
              <p className="text-sm text-muted-foreground">
                Key indicators for this month (real-time)
              </p>
            </div>
            {!metricsAvailable && configured && !metricsQuery.isLoading && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Metrics endpoint not available yet
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessCards.map((card) => {
              const Icon = card.icon;
              const displayValue = card.value !== undefined ? card.value : "--";
              return (
                <Card key={card.id} data-testid={`card-metric-${card.id}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-md ${card.bgColor}`}>
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                        <p className="text-2xl font-bold truncate" data-testid={`value-${card.id}`}>
                          {metricsQuery.isLoading ? "—" : displayValue}
                        </p>
                        {card.subValue && (
                          <p className="text-sm text-muted-foreground">{card.subValue}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Quick Actions */}
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
