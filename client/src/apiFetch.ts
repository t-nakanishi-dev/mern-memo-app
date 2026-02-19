// client/src/apiFetch.ts

/* eslint-disable no-undef */
let isRefreshing: boolean = false;
let refreshWaitQueue: Array<(value: boolean) => void> = [];

const API_BASE_URL: string =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

const refreshAccessToken = async (): Promise<boolean | null> => {
  if (isRefreshing) {
    return new Promise<boolean>((resolve) => {
      refreshWaitQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const res = await fetch(`${API_BASE_URL}/api/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      window.location.href = "/login";
      return null;
    }

    refreshWaitQueue.forEach((resolve) => resolve(true));
    refreshWaitQueue = [];
    return true;
  } catch {
    window.location.href = "/login";
    return null;
  } finally {
    isRefreshing = false;
  }
};

/**
 * 🔹 JSON を返す API Fetch（改善版・最小修正）
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  console.log("🌐 apiFetch URL:", url);

  const isFormData = options.body instanceof FormData;

  const doRequest = async (): Promise<Response> => {
    console.log("📡 sending request...");
    return fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
    });
  };

  let res = await doRequest();
  console.log("📥 response status:", res.status);

  if (res.status === 401) {
    console.log("🔄 401 detected, refreshing...");
    const refreshed = await refreshAccessToken();
    if (!refreshed) throw new Error("Unauthorized");
    res = await doRequest();
  }

  // ✅ エラーメッセージ取得（超重要）
  if (!res.ok) {
    console.log("❌ API error status:", res.status);
    let message = `API Error: ${res.status}`;

    try {
      const errorData = await res.json();
      message = errorData.message || message;
    } catch {
      // JSONじゃない場合は無視
    }

    throw new Error(message);
  }

  console.log("✅ returning json");
  return res.json() as Promise<T>;
}
