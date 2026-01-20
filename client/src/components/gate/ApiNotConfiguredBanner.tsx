import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/config/api";

export function ApiNotConfiguredBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-destructive">
      <Card className="max-w-2xl mx-auto border-destructive">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">API Not Configured</h3>
              <p className="text-sm text-muted-foreground">
                The ARISE API is not configured. Set <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">VITE_API_BASE_URL</code> in Replit Secrets/Environment Variables.
              </p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs font-mono text-muted-foreground mb-1">Expected value:</p>
                <code className="text-xs font-mono text-foreground">
                  VITE_API_BASE_URL=https://artemis-arise--arthursmt89.replit.app
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                Current value: <code className="bg-muted px-1 rounded">{API_BASE_URL || "(empty)"}</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
