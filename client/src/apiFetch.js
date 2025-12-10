// client/src/apiFetch.js ← これに完全置き換え（これで全て解決）

export const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    credentials: "include", // ← これが命！！！これでクッキー送る
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401 || res.status === 403) {
    console.warn("認証エラー: ログアウト処理へ");
    localStorage.removeItem("token");
    window.location.href = "/login";
    return null;
  }

  return res;
};
