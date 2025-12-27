// client/src/apiFetch.js

const API_BASE_URL = process.env.REACT_APP_API_URL;

let isRefreshing = false;
let refreshWaitQueue = [];

// refreshToken によるアクセストークン再取得
const refreshAccessToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshWaitQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    console.log("🔄 Refresh Token を使用してアクセストークン再取得中…");

    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      console.error("❌ Refresh Token が無効");
      return null;
    }

    console.log("✅ Refresh Token → 新しい accessToken 再発行に成功！");

    refreshWaitQueue.forEach((resolve) => resolve(true));
    refreshWaitQueue = [];

    return true;
  } catch (err) {
    console.error("❌ refreshAccessToken エラー:", err);
    return null;
  } finally {
    isRefreshing = false;
  }
};

// ------------------------------------------------------------
// apiFetch：すべての fetch をラップ（自動で refresh）
// ------------------------------------------------------------
export const apiFetch = async (url, options = {}) => {
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

  if (res.status === 401) {
    console.warn("⚠️ 401 を検知 → Refresh Token で復旧を試みます");

    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      console.warn("❌ refresh に失敗 → ログアウト処理へ");
      window.location.href = "/login";
      return null;
    }

    console.log("♻️ Refresh 成功 → 元のリクエストを再実行します");

    res = await doRequest();
  }

  return res;
};
