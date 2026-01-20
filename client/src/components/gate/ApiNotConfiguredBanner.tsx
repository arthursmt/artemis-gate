import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL, getApiConfigError } from "@/config/api";

export function ApiNotConfiguredBanner() {
  const errorMessage = getApiConfigError();
  
  return (
    <div className="p-4 bg-destructive/10 border-b border-destructive/20">
      <Card className="max-w-2xl mx-auto border-destructive">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground" data-testid="text-api-error-title">
                {errorMessage?.includes("Invalid") ? "Invalid API Configuration" : "API Not Configured"}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-api-error-message">
                {errorMessage}
              </p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs font-mono text-muted-foreground mb-1">Expected format:</p>
                <code className="text-xs font-mono text-foreground">
                  VITE_API_BASE_URL=https://artemis-arise--arthursmt89.replit.app
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                Current value: <code className="bg-muted px-1 rounded" data-testid="text-current-api-url">
                  {import.meta.env.VITE_API_BASE_URL || "(empty)"}
                </code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
