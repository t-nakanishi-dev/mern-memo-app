// client/src/api.ts
/* eslint-disable no-undef */
import { apiFetch } from "./apiFetch";

import type {
  AuthResponse,
  Memo,
  MemoPayload,
  PagedMemosResponse, // ← 追加
} from "./types/api";

/**
 * API のベースURL
 */
const API_BASE_URL = process.env.REACT_APP_API_URL as string;

/* =============================
 * ユーザー認証関連
 * ============================= */

export const signup = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  return apiFetch(`${API_BASE_URL}/api/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  return apiFetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

/* =============================
 * メモ関連（Cookie 認証）
 * ============================= */

export const fetchMemos = async (
  page: number = 1,
  limit: number = 12,
): Promise<PagedMemosResponse> => {
  return apiFetch<PagedMemosResponse>(
    `${API_BASE_URL}/api/memos?page=${page}&limit=${limit}`,
  );
};

export const createMemo = async (memo: MemoPayload): Promise<Memo> => {
  return apiFetch<Memo>(`${API_BASE_URL}/api/memos`, {
    method: "POST",
    body: JSON.stringify(memo),
  });
};

export const updateMemo = async (
  id: string,
  updatedData: MemoPayload,
): Promise<Memo> => {
  return apiFetch<Memo>(`${API_BASE_URL}/api/memos/${id}`, {
    method: "PUT",
    body: JSON.stringify(updatedData),
  });
};

export const deleteMemo = async (id: string): Promise<void> => {
  return apiFetch<void>(`${API_BASE_URL}/api/memos/${id}`, {
    method: "DELETE",
  });
};

export const fetchMemo = async (id: string): Promise<Memo> => {
  return apiFetch<Memo>(`${API_BASE_URL}/api/memos/${id}`);
};

export const fetchTrashedMemos = async (
  page: number,
  limit: number,
): Promise<PagedMemosResponse> => {
  return apiFetch<PagedMemosResponse>(
    `${API_BASE_URL}/api/memos/trash?page=${page}&limit=${limit}`,
  );
};

export const restoreMemo = async (id: string): Promise<Memo> => {
  return apiFetch<Memo>(`${API_BASE_URL}/api/memos/${id}/restore`, {
    method: "PUT",
  });
};

export const permanentlyDeleteMemo = async (id: string): Promise<void> => {
  return apiFetch<void>(`${API_BASE_URL}/api/memos/${id}/permanent`, {
    method: "DELETE",
  });
};

export const emptyTrash = async (): Promise<void> => {
  return apiFetch<void>(`${API_BASE_URL}/api/memos/trash`, {
    method: "DELETE",
  });
};

/* =============================
 * パスワードリセット関連
 * ============================= */

export const passwordResetRequest = async (
  email: string,
): Promise<Response> => {
  return fetch(`${API_BASE_URL}/api/password-reset-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
};

export const passwordReset = async (
  token: string,
  newPassword: string,
): Promise<Response> => {
  return fetch(`${API_BASE_URL}/api/password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
};
