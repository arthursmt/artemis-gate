export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export function isApiConfigured(): boolean {
  return !!API_BASE_URL && API_BASE_URL.trim().length > 0;
}

export function getApiBaseUrl(): string {
  if (!isApiConfigured()) {
    throw new Error("API_BASE_URL is not configured");
  }
  return API_BASE_URL!;
}
