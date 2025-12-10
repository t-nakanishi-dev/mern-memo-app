// client/src/api.js
import { apiFetch } from "./apiFetch";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// -----------------------------
// ユーザー認証関連
// -----------------------------
export const signup = async (email, password) => {
  return fetch(`${API_BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
};

export const login = async (email, password) => {
  return fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
};

// -----------------------------
// メモ関連（すべて Cookie 認証）
// -----------------------------
export const fetchMemos = async (page = 1, limit = 10) => {
  return apiFetch(`${API_BASE_URL}/api/memos?page=${page}&limit=${limit}`, {
    credentials: "include",
  });
};

export const createMemo = async (memo) => {
  return apiFetch(`${API_BASE_URL}/api/memos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(memo),
    credentials: "include",
  });
};

export const updateMemo = async (id, updatedData) => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
    credentials: "include",
  });
};

export const deleteMemo = async (id) => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
};

export const fetchMemo = async (id) => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}`, {
    credentials: "include",
  });
};

export const fetchTrashedMemos = async (page, limit) => {
  return apiFetch(
    `${API_BASE_URL}/api/memos/trash?page=${page}&limit=${limit}`,
    { credentials: "include" }
  );
};

export const restoreMemo = async (id) => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}/restore`, {
    method: "PUT",
    credentials: "include",
  });
};

export const permanentlyDeleteMemo = async (id) => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}/permanent`, {
    method: "DELETE",
    credentials: "include",
  });
};

export const emptyTrash = async () => {
  return apiFetch(`${API_BASE_URL}/api/memos/trash`, {
    method: "DELETE",
    credentials: "include",
  });
};

// -----------------------------
// パスワードリセット関連
// （これは認証不要なので現状のままでOK）
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
