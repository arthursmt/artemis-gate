import { getApiBaseUrl, isApiConfigured } from "@/config/api";
import { getGateRole, getGateUserId } from "@/lib/gateStore";
import type { ProposalSummary, ProposalDetail, HealthResponse, DecisionPayload } from "@/types/gate";

const TIMEOUT_MS = 10000;

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public isNetworkError: boolean = false
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError("API not configured. Set VITE_API_BASE_URL in Replit Secrets/Env.", undefined, false);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers: Record<string, string> = {
    "x-gate-role": getGateRole(),
    "x-gate-user-id": getGateUserId(),
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      if (response.status === 409) {
        throw new ApiError(`Stage mismatch: ${errorText}`, 409);
      }
      throw new ApiError(`API Error: ${response.status} - ${errorText}`, response.status);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiError("Request timed out after 10 seconds", undefined, true);
      }
      throw new ApiError(
        `Cannot reach ARISE API. Check VITE_API_BASE_URL and ARISE CORS. Error: ${error.message}`,
        undefined,
        true
      );
    }

    throw new ApiError("Unknown error occurred", undefined, true);
  }
}

export async function checkHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/api/health");
}

export async function listProposals(stage: string): Promise<ProposalSummary[]> {
  return apiFetch<ProposalSummary[]>(`/api/gate/proposals?stage=${encodeURIComponent(stage)}`);
}

export async function getProposal(proposalId: string): Promise<ProposalDetail> {
  return apiFetch<ProposalDetail>(`/api/gate/proposals/${encodeURIComponent(proposalId)}`);
}

export async function submitDecision(
  proposalId: string,
  payload: DecisionPayload
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/gate/proposals/${encodeURIComponent(proposalId)}/decision`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export { ApiError };
