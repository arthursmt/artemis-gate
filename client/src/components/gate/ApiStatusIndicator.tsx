import { useApiStatus } from "@/lib/apiStatus";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ApiStatusIndicator() {
  const { status, lastError } = useApiStatus();

  const dotColor = {
    unknown: "bg-gray-400",
    ok: "bg-green-500",
    error: "bg-red-500",
  }[status];

  const statusText = {
    unknown: "API: Checking...",
    ok: "API: OK",
    error: "API: Error",
  }[status];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 text-xs" data-testid="api-status-indicator">
          <div className={`w-2 h-2 rounded-full ${dotColor}`} data-testid="api-status-dot" />
          <span className="text-muted-foreground" data-testid="api-status-text">{statusText}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {status === "ok" && "Connection to ARISE API is healthy"}
        {status === "error" && (lastError || "Failed to connect to ARISE API")}
        {status === "unknown" && "Checking API connection..."}
      </TooltipContent>
    </Tooltip>
  );
}
