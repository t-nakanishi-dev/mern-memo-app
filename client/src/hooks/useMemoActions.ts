// src/hooks/useMemoActions.ts
import { useCallback } from "react";
import { createMemo, updateMemo, deleteMemo } from "../api";
import { toast } from "react-hot-toast";
import type { Memo, MemoPayload } from "@/types/api";

interface UseMemoActionsProps {
  loadMemos: () => Promise<void>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingMemoId?: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useMemoActions = ({
  loadMemos,
  setLoading,
  setError,
  setEditingMemoId,
}: UseMemoActionsProps) => {
  // 新規作成
  const handleCreate = useCallback(
    async (
      title: string,
      content: string,
      category: string,
      attachments: MemoPayload["attachments"] = [],
    ) => {
      setLoading(true);
      setError(null);

      try {
        await createMemo({
          title,
          content,
          category,
          attachments,
        });
        await loadMemos();
        toast.success("メモを作成しました！");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "メモの作成に失敗しました";
        console.error("メモ作成エラー:", err);
        toast.error(message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading, setError],
  );

  // 更新（部分更新対応）
  const handleUpdate = useCallback(
    async (
      id: string,
      updates: Partial<
        Pick<
          Memo,
          | "title"
          | "content"
          | "category"
          | "attachments"
          | "isDone"
          | "isPinned"
        >
      >,
    ) => {
      setLoading(true);
      setError(null);

      try {
        // サーバー側が部分更新を許容している前提でそのまま送信
        await updateMemo(id, updates as MemoPayload);
        await loadMemos();
        setEditingMemoId?.(null);
        toast.success("メモを更新しました！");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "メモの更新に失敗しました";
        console.error("メモ更新エラー:", err);
        toast.error(message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading, setError, setEditingMemoId],
  );

  // 削除（ゴミ箱へ移動）
  const handleDelete = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        await deleteMemo(id);
        await loadMemos();
        toast.success("メモをゴミ箱に移動しました");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "メモの削除に失敗しました";
        console.error("メモ削除エラー:", err);
        toast.error(message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading, setError],
  );

  // 完了/未完了トグル
  const handleToggleDone = useCallback(
    async (memo: Memo) => {
      setLoading(true);
      setError(null);

      try {
        await updateMemo(memo._id, {
          isDone: !memo.isDone,
        } as MemoPayload);
        await loadMemos();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "完了状態の更新に失敗しました";
        console.error("完了トグルエラー:", err);
        toast.error(message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading, setError],
  );

  // ピン留め/解除トグル
  const handleTogglePin = useCallback(
    async (memo: Memo) => {
      setLoading(true);
      setError(null);

      try {
        await updateMemo(memo._id, {
          isPinned: !memo.isPinned,
        } as MemoPayload);
        await loadMemos();
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "ピン留め状態の更新に失敗しました";
        console.error("ピントグルエラー:", err);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading, setError],
  );

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleDone,
    handleTogglePin,
  };
};
