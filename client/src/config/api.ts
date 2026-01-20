function normalizeApiUrl(url: string | undefined): { url: string | null; error: string | null } {
  if (!url || typeof url !== "string") {
    return { url: null, error: "API not configured. Set VITE_API_BASE_URL in Replit Secrets/Env." };
  }

  let normalized = url.trim();
  
  if (!normalized) {
    return { url: null, error: "API not configured. Set VITE_API_BASE_URL in Replit Secrets/Env." };
  }

  while (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    return { url: null, error: "Invalid API base URL. It must start with http:// or https://" };
  }

  return { url: normalized, error: null };
}

const rawUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const { url: normalizedUrl, error: configError } = normalizeApiUrl(rawUrl);

export const API_BASE_URL = normalizedUrl;
export const API_CONFIG_ERROR = configError;

export function isApiConfigured(): boolean {
  return normalizedUrl !== null;
}

export function getApiBaseUrl(): string {
  if (!normalizedUrl) {
    throw new Error(configError || "API_BASE_URL is not configured");
  }
  return normalizedUrl;
}

export function getApiConfigError(): string | null {
  return configError;
}
