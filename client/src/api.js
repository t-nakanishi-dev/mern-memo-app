// client/src/api.js
import { apiFetch } from "./apiFetch";
// .envファイルに REACT_APP_API_URL=http://localhost:3000 と設定している前提
// 各エンドポイントのベースURLとして利用する
// 例: `${API_BASE_URL}/api/memos`
const API_BASE_URL = process.env.REACT_APP_API_URL;

// 各API関数は「fetch」または「apiFetch」を利用して
// HTTPレスポンスオブジェクト(Response)をそのまま返す設計。
// 呼び出し元のコンポーネントで `res.ok` や `res.status` を直接確認できる。

// -----------------------------
// ユーザー認証関連
// -----------------------------
export const signup = async (email, password) => {
  // 新規ユーザー登録
  const res = await fetch(`${API_BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include", // ← 追加！！
  });
  return res;
};

export const login = async (email, password) => {
  // ログイン処理
  const res = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include", // ← 追加！！
  });
  return res;
};

// -----------------------------
// メモ関連
// -----------------------------
export const fetchMemos = async (token, page = 1, limit = 10) => {
  // メモ一覧の取得（ページネーション付き）
  return apiFetch(`${API_BASE_URL}/api/memos?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }, // 認証トークン付与
  });
};

export const createMemo = async (token, memo) => {
  // 新規メモ作成
  return apiFetch(`${API_BASE_URL}/api/memos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(memo), // メモ内容を送信
  });
};

export const updateMemo = async (token, id, updatedData) => {
  // メモの更新（id指定）
  return apiFetch(`${API_BASE_URL}/api/memos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });
};

export const deleteMemo = async (token, id) => {
  // メモ削除（id指定）
  return apiFetch(`${API_BASE_URL}/api/memos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchMemo = async (token, id) => {
  // 特定のメモ詳細を取得
  return apiFetch(`${API_BASE_URL}/api/memos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchTrashedMemos = async (token, page, limit) => {
  // ゴミ箱に入っているメモの一覧を取得
  return apiFetch(
    `${API_BASE_URL}/api/memos/trash?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const restoreMemo = async (token, id) => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}/restore`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ← ここに追加！！
export const permanentlyDeleteMemo = async (token, id) => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}/permanent`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const emptyTrash = async (token) => {
  return apiFetch(`${API_BASE_URL}/api/memos/trash`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// -----------------------------
// パスワードリセット関連
// -----------------------------
export const passwordResetRequest = async (email) => {
  // リセットリンク送信リクエスト
  return fetch(`${API_BASE_URL}/api/password-reset-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
};

export const passwordReset = async (token, newPassword) => {
  // リセットリンク経由で新しいパスワードを設定
  return fetch(`${API_BASE_URL}/api/password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
};
