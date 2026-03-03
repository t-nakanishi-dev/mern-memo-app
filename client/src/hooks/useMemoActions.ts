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
  // 新規メモ作成
  const handleCreate = useCallback(
    async (
      title: string,
      content: string,
      category?: string,
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
          err instanceof Error ? err.message : "メモ作成中にエラーが発生しました。";
        console.error("メモ作成エラー:", err);
        toast.error(message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading, setError],
  );

  // メモ更新
  const handleUpdate = useCallback(
    async (
      id: string,
      title: string,
      content: string,
      category?: string,
      attachments?: MemoPayload["attachments"],
    ) => {
      setLoading(true);
      setError(null);

      try {
        const payload: Partial<MemoPayload> = {
          title,
          content,
          category,
        };

        if (attachments !== undefined) {
          payload.attachments = attachments;
        }

        await updateMemo(id, payload as MemoPayload);

        await loadMemos();
        setEditingMemoId?.(null);
        toast.success("メモを更新しました！");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "メモ更新中にエラーが発生しました。";
        console.error("メモ更新エラー:", err);
        toast.error(message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading, setError, setEditingMemoId],
  );

  // 削除（ゴミ箱へ）
  const handleDelete = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        await deleteMemo(id);

        await loadMemos();
        toast.success("メモをゴミ箱に移動しました。");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "メモ削除中にエラーが発生しました。";
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
          title: memo.title,
          content: memo.content,
          isDone: !memo.isDone,
        } as MemoPayload);

        await loadMemos();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "完了状態の更新中にエラーが発生しました。";
        console.error("完了切り替えエラー:", err);
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
          err instanceof Error ? err.message : "ピン状態の更新中にエラーが発生しました。";
        console.error("ピン切り替えエラー:", err);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading],
  );

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleDone,
    handleTogglePin,
  };
};