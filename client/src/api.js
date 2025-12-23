// client/src/api.js
import { apiFetch } from "./apiFetch";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// -----------------------------
// ユーザー認証関連
// -----------------------------
export const signup = async (email, password) => {
  return apiFetch(`${API_BASE_URL}/api/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const login = async (email, password) => {
  return apiFetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

// -----------------------------
// メモ関連（全て Cookie 認証）
// -----------------------------
export const fetchMemos = async (page = 1, limit = 12) => {
  return apiFetch(`${API_BASE_URL}/api/memos?page=${page}&limit=${limit}`);
};

export const createMemo = async (memo) => {
  return apiFetch(`${API_BASE_URL}/api/memos`, {
    method: "POST",
    body: JSON.stringify(memo),
  });
};

export const updateMemo = async (id, updatedData) => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}`, {
    method: "PUT",
    body: JSON.stringify(updatedData),
  });
};

export const deleteMemo = async (id) => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}`, {
    method: "DELETE",
  });
};

export const fetchMemo = async (id) => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}`);
};

export const fetchTrashedMemos = async (page, limit) => {
  return apiFetch(
    `${API_BASE_URL}/api/memos/trash?page=${page}&limit=${limit}`
  );
};

export const restoreMemo = async (id) => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}/restore`, {
    method: "PUT",
  });
};

export const permanentlyDeleteMemo = async (id) => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}/permanent`, {
    method: "DELETE",
  });
};

export const emptyTrash = async () => {
  return apiFetch(`${API_BASE_URL}/api/memos/trash`, {
    method: "DELETE",
  });
};

// -----------------------------
// パスワードリセット関連
// （これは認証不要なので fetch のままでOK）
// -----------------------------
export const passwordResetRequest = async (email) => {
  return fetch(`${API_BASE_URL}/api/password-reset-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
};

export const passwordReset = async (token, newPassword) => {
  return fetch(`${API_BASE_URL}/api/password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
};
