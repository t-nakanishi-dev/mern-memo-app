// client/src/apiFetch.js

// 共通の fetch ラッパ関数
// - 認証トークンの有効期限切れや不正トークンによる 401 / 403 エラーを一括で検知
// - エラー検出時にはローカルストレージのトークン削除 & 疑似レスポンスを返す
// - 正常時は fetch のレスポンスをそのまま返す
export const apiFetch = async (url, options = {}) => {
  // API呼び出し実行
  const res = await fetch(url, options);

  // 認証エラー（未ログイン / トークン期限切れ / 不正トークン）
  if (res.status === 401 || res.status === 403) {
    console.warn("認証エラー: ログアウト処理へ");

    // 保存されているトークンを削除
    localStorage.removeItem("token");

    // 本来であればここでリダイレクト処理をするのが自然だが、
    // 共通関数なので UI に依存せず「Response風のダミー」を返す形をとっている
    return new Response(
      JSON.stringify({ message: "認証エラー" }), // 疑似レスポンスの中身
      {
        status: res.status, // 元のステータスコードを引き継ぐ
        headers: { "Content-Type": "application/json" }, // JSONレスポンス形式に揃える
      }
    );
  }

  // 認証エラー以外はそのまま呼び出し元へ返却
  return res;
};
