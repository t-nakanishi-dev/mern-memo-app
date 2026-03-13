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
 * 添付ファイルの型（サーバー側で保存される形を想定）
 */
export type Attachment = {
  _id?: string; // MongoDBのObjectIdの場合
  url: string;
  path?: string; // ←追加（重要）
  name: string;
  type: string; // MIME type e.g. "image/jpeg", "application/pdf"
  size?: number; // 任意：バイトサイズ
};

/**
 * メモ型（サーバー側の実データを反映）
 */
export type Memo = {
  _id: string;
  title: string;
  content: string;
  category?: string; // 空文字 or undefinedもあり得る
  isDone: boolean; // デフォルト false
  isPinned: boolean; // デフォルト false
  attachments: Attachment[]; // 配列（空配列もあり）
  createdAt: string; // ISO文字列
  updatedAt: string;
  isDeleted?: boolean; // クライアント側では基本不要だが一応
  userId?: string; // 通常クライアントでは不要
};

/**
 * メモ作成・更新時にクライアントから送るペイロード
 */
export type MemoPayload = {
  title: string;
  content: string;
  category?: string;
  attachments?: Attachment[]; // 更新時は完全上書き
  isDone?: boolean;
  isPinned?: boolean;
};

/**
 * ページネーション付きメモ一覧レスポンス
 */
export interface PagedMemosResponse {
  memos: Memo[];
  total: number;
}
