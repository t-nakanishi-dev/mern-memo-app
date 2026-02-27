// client/src/types/api.ts

/**
 * ユーザー型
 */
export type User = {
  _id: string;
  email: string;
};

/**
 * 認証系APIレスポンス
 */
export type AuthResponse = {
  user: User;
};

/**
 * メモ型
 */
export type Memo = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * メモ作成・更新用
 */
export type MemoPayload = {
  title: string;
  content: string;
};

/**
 * ページネーション付きメモ一覧のレスポンス型
 * サーバー側：{ memos: Memo[], total: number }
 */
export interface PagedMemosResponse {
  memos: Memo[];
  total: number;
}
