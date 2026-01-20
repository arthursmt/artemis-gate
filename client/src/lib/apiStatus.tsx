import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { isApiConfigured } from "@/config/api";
import { checkHealth } from "@/lib/api";

type ApiStatus = "unknown" | "ok" | "error";

interface ApiStatusContextType {
  status: ApiStatus;
  lastError: string | null;
  checkStatus: () => Promise<void>;
}

const ApiStatusContext = createContext<ApiStatusContextType>({
  status: "unknown",
  lastError: null,
  checkStatus: async () => {},
});

export function useApiStatus() {
  return useContext(ApiStatusContext);
}

interface ApiStatusProviderProps {
  children: ReactNode;
}

export function ApiStatusProvider({ children }: ApiStatusProviderProps) {
  const [status, setStatus] = useState<ApiStatus>("unknown");
  const [lastError, setLastError] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!isApiConfigured()) {
      setStatus("error");
      setLastError("API not configured");
      return;
    }

    try {
      await checkHealth();
      setStatus("ok");
      setLastError(null);
    } catch (err) {
      setStatus("error");
      setLastError(err instanceof Error ? err.message : "Unknown error");
    }
  }, []);

  useEffect(() => {
    if (!hasChecked) {
      setHasChecked(true);
      checkStatus();
    }
  }, [hasChecked, checkStatus]);

  return (
    <ApiStatusContext.Provider value={{ status, lastError, checkStatus }}>
      {children}
    </ApiStatusContext.Provider>
  );
}
