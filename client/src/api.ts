// client/src/api.ts
/* eslint-disable no-undef */
import { apiFetch } from "./apiFetch";

import type {
  AuthResponse,
  Memo,
  MemoPayload,
} from "./types/api";

/**
 * API のベースURL
 * .env に定義された URL を使用
 * （undefined の可能性があるため、実運用ではチェックしてもよい）
 */
const API_BASE_URL = process.env.REACT_APP_API_URL as string;

/* =============================
 * ユーザー認証関連
 * ============================= */

/**
 * サインアップ
 * @param email - ユーザーのメールアドレス
 * @param password - パスワード
 */
export const signup = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  return apiFetch(`${API_BASE_URL}/api/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

/**
 * ログイン
 * @param email - ユーザーのメールアドレス
 * @param password - パスワード
 */
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  return apiFetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

/* =============================
 * メモ関連（Cookie 認証）
 * ============================= */

/**
 * メモ一覧取得（ページネーション対応）
 */
export const fetchMemos = async (
  page: number = 1,
  limit: number = 12
): Promise<Memo[]> => {
  return apiFetch(
    `${API_BASE_URL}/api/memos?page=${page}&limit=${limit}`
  );
};

/**
 * メモ作成
 */
export const createMemo = async (
  memo: MemoPayload
): Promise<Memo> => {
  return apiFetch(`${API_BASE_URL}/api/memos`, {
    method: "POST",
    body: JSON.stringify(memo),
  });
};

/**
 * メモ更新
 */
export const updateMemo = async (
  id: string,
  updatedData: MemoPayload
): Promise<Memo> => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}`, {
    method: "PUT",
    body: JSON.stringify(updatedData),
  });
};

/**
 * メモ削除（論理削除）
 */
export const deleteMemo = async (
  id: string
): Promise<void> => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}`, {
    method: "DELETE",
  });
};

/**
 * メモ1件取得
 */
export const fetchMemo = async (
  id: string
): Promise<Memo> => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}`);
};

/**
 * ゴミ箱のメモ一覧取得
 */
export const fetchTrashedMemos = async (
  page: number,
  limit: number
): Promise<Memo[]> => {
  return apiFetch(
    `${API_BASE_URL}/api/memos/trash?page=${page}&limit=${limit}`
  );
};

/**
 * ゴミ箱からメモを復元
 */
export const restoreMemo = async (
  id: string
): Promise<Memo> => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}/restore`, {
    method: "PUT",
  });
};

/**
 * メモを完全削除
 */
export const permanentlyDeleteMemo = async (
  id: string
): Promise<void> => {
  return apiFetch(`${API_BASE_URL}/api/memos/${id}/permanent`, {
    method: "DELETE",
  });
};

/**
 * ゴミ箱を空にする
 */
export const emptyTrash = async (): Promise<void> => {
  return apiFetch(`${API_BASE_URL}/api/memos/trash`, {
    method: "DELETE",
  });
};

/* =============================
 * パスワードリセット関連
 * （認証不要のため fetch を使用）
 * ============================= */

/**
 * パスワードリセットメール送信
 */
export const passwordResetRequest = async (
  email: string
): Promise<Response> => {
  return fetch(`${API_BASE_URL}/api/password-reset-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
};

/**
 * パスワードリセット実行
 */
export const passwordReset = async (
  token: string,
  newPassword: string
): Promise<Response> => {
  return fetch(`${API_BASE_URL}/api/password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
};
