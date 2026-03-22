import {
  MOONSHOT_API_KEY_HEADER,
  MOONSHOT_API_KEY_CHANGED_EVENT,
  MOONSHOT_API_KEY_STORAGE_KEY,
} from "@/lib/constants/moonshot";

export function getStoredMoonshotApiKey(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return localStorage.getItem(MOONSHOT_API_KEY_STORAGE_KEY)?.trim() || undefined;
  } catch {
    return undefined;
  }
}

export function setStoredMoonshotApiKey(key: string): void {
  localStorage.setItem(MOONSHOT_API_KEY_STORAGE_KEY, key.trim());
}

export function clearStoredMoonshotApiKey(): void {
  localStorage.removeItem(MOONSHOT_API_KEY_STORAGE_KEY);
}

export function notifyMoonshotApiKeyChanged(): void {
  window.dispatchEvent(new Event(MOONSHOT_API_KEY_CHANGED_EVENT));
}

/** 合并到 JSON API 请求的 headers */
export function moonshotAuthHeaders(): Record<string, string> {
  const key = getStoredMoonshotApiKey();
  if (!key) return {};
  return { [MOONSHOT_API_KEY_HEADER]: key };
}
