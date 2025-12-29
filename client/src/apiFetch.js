// client/src/apiFetch.js

let isRefreshing = false;
let refreshWaitQueue = [];

// REACT_APP_API_URL が未定義の場合のフォールバック（ローカル用）
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const refreshAccessToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshWaitQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    console.log("🔄 Refresh Token で再取得中…");

    // 正しいパスに修正（/api/refresh）
    const refreshUrl = `${API_BASE_URL}/api/refresh`;

    const res = await fetch(refreshUrl, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      console.error("❌ Refresh失敗:", res.status);
      window.location.href = "/login";
      return null;
    }

    console.log("✅ Refresh成功！");
    refreshWaitQueue.forEach((resolve) => resolve(true));
    refreshWaitQueue = [];
    return true;
  } catch (err) {
    console.error("❌ Refreshエラー:", err);
    window.location.href = "/login";
    return null;
  } finally {
    isRefreshing = false;
  }
};

// ------------------------------------------------------------
// apiFetch：相対パスを自動で絶対パスに変換
// ------------------------------------------------------------
export const apiFetch = async (endpoint, options = {}) => {
  // endpointが http で始まる場合はそのまま、さもなくば絶対パスに変換
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const doRequest = async () => {
    return await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  };

  let res = await doRequest();

  // 401ならrefresh試行
  if (res.status === 401) {
    console.warn("⚠️ 401検知 → Refresh試行");

    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      console.warn("❌ Refresh失敗 → ログイン画面へ");
      window.location.href = "/login";
      return null;
    }

    // 再実行
    res = await doRequest();
  }

  return res;
};
