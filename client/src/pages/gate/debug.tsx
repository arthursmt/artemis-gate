import { useState } from "react";
import { Activity, Server, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GateLayout } from "@/components/gate/GateLayout";
import { API_BASE_URL, isApiConfigured } from "@/config/api";
import { checkHealth, listProposals, ApiError } from "@/lib/api";
import { getGateRole, getGateUserId } from "@/lib/gateStore";

interface TestResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
}

export default function DebugPage() {
  const [healthResult, setHealthResult] = useState<TestResult | null>(null);
  const [proposalsResult, setProposalsResult] = useState<TestResult | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(false);

  async function testHealth() {
    setLoadingHealth(true);
    setHealthResult(null);
    try {
      const data = await checkHealth();
      setHealthResult({
        success: true,
        message: "Health check passed!",
        data: data as unknown as Record<string, unknown>,
      });
    } catch (err) {
      const error = err instanceof ApiError ? err.message : "Unknown error";
      setHealthResult({
        success: false,
        message: "Health check failed",
        error,
      });
    } finally {
      setLoadingHealth(false);
    }
  }

  async function testProposals() {
    setLoadingProposals(true);
    setProposalsResult(null);
    try {
      const data = await listProposals("DOC_REVIEW");
      setProposalsResult({
        success: true,
        message: `Found ${data.length} proposals`,
        data: data.length > 0 ? {
          count: data.length,
          first: {
            proposalId: data[0].proposalId,
            groupId: data[0].groupId,
            stage: data[0].stage,
          }
        } : { count: 0 },
      });
    } catch (err) {
      const error = err instanceof ApiError ? err.message : "Unknown error";
      setProposalsResult({
        success: false,
        message: "Failed to list proposals",
        error,
      });
    } finally {
      setLoadingProposals(false);
    }
  }

  return (
    <GateLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Debug & Connectivity</h2>
          <p className="text-muted-foreground mt-1">
            Validate your connection to the ARISE API
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>Current API and session settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">API Base URL</span>
                <code className="bg-muted px-2 py-1 rounded text-xs font-mono" data-testid="text-api-url">
                  {API_BASE_URL || "(not set)"}
                </code>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">API Configured</span>
                <span data-testid="text-api-configured">
                  {isApiConfigured() ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Current Role</span>
                <code className="bg-muted px-2 py-1 rounded text-xs font-mono" data-testid="text-role">
                  {getGateRole()}
                </code>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">User ID</span>
                <code className="bg-muted px-2 py-1 rounded text-xs font-mono" data-testid="text-user-id">
                  {getGateUserId()}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Health Check
            </CardTitle>
            <CardDescription>Test connection to /api/health endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testHealth}
              disabled={loadingHealth || !isApiConfigured()}
              data-testid="button-test-health"
            >
              {loadingHealth ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test /api/health"
              )}
            </Button>

            {healthResult && (
              <div className={`p-4 rounded-md ${healthResult.success ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {healthResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${healthResult.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`} data-testid="text-health-message">
                    {healthResult.message}
                  </span>
                </div>
                {healthResult.data && (
                  <pre className="text-xs bg-card p-2 rounded mt-2 overflow-auto" data-testid="text-health-data">
                    {JSON.stringify(healthResult.data, null, 2)}
                  </pre>
                )}
                {healthResult.error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2" data-testid="text-health-error">
                    {healthResult.error}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              List Proposals
            </CardTitle>
            <CardDescription>Test fetching proposals from DOC_REVIEW stage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testProposals}
              disabled={loadingProposals || !isApiConfigured()}
              variant="secondary"
              data-testid="button-test-proposals"
            >
              {loadingProposals ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test list proposals"
              )}
            </Button>

            {proposalsResult && (
              <div className={`p-4 rounded-md ${proposalsResult.success ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {proposalsResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${proposalsResult.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`} data-testid="text-proposals-message">
                    {proposalsResult.message}
                  </span>
                </div>
                {proposalsResult.data && (
                  <pre className="text-xs bg-card p-2 rounded mt-2 overflow-auto" data-testid="text-proposals-data">
                    {JSON.stringify(proposalsResult.data, null, 2)}
                  </pre>
                )}
                {proposalsResult.error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2" data-testid="text-proposals-error">
                    {proposalsResult.error}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </GateLayout>
  );
}
