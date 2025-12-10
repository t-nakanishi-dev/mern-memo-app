// src/hooks/useMemoActions.js
import { useCallback } from "react";
import { createMemo, updateMemo, deleteMemo } from "../api";
import { toast } from "react-hot-toast";

/**
 * メモに対するアクションを扱うカスタムフック
 * （作成・更新・削除・ピン切替・完了状態切替）
 */
export const useMemoActions = ({
  loadMemos,
  setLoading,
  setError,
  setEditingMemoId,
}) => {
  // 🔸 新しいメモ作成処理
  const handleCreate = useCallback(
    async (title, content, category, attachments = []) => {
      setLoading(true);
      setError(null);

      try {
        const response = await createMemo({
          title,
          content,
          category,
          attachments,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "メモ作成に失敗しました。");
        }

        await loadMemos();
        toast.success("メモを作成しました！");
      } catch (err) {
        console.error("メモ作成エラー:", err);
        toast.error(err.message || "メモ作成中にエラーが発生しました。");
        setError(err.message || "メモ作成中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading, setError]
  );

  // 🔸 メモ編集・更新処理
  const handleUpdate = useCallback(
    async (id, title, content, category, attachments = undefined) => {
      setLoading(true);
      setError(null);

      try {
        const payload = {
          title,
          content,
          category,
        };

        if (attachments !== undefined) {
          payload.attachments = attachments;
        }

        const response = await updateMemo(id, payload);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "メモ更新に失敗しました。");
        }

        await loadMemos();
        setEditingMemoId(null);
        toast.success("メモを更新しました！");
      } catch (err) {
        console.error("メモ更新エラー:", err);
        toast.error(err.message || "メモ更新中にエラーが発生しました。");
        setError(err.message || "メモ更新中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading, setError, setEditingMemoId]
  );

  // 🔸 メモ削除処理（ゴミ箱へ移動）
  const handleDelete = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const response = await deleteMemo(id);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "メモ削除に失敗しました。");
        }

        await loadMemos();
        toast.success("メモをゴミ箱に移動しました。");
      } catch (err) {
        console.error("メモ削除エラー:", err);
        toast.error(err.message || "メモ削除中にエラーが発生しました。");
        setError(err.message || "メモ削除中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading, setError]
  );

  // 🔸 完了状態切替処理
  const handleToggleDone = useCallback(
    async (memo) => {
      setLoading(true);
      setError(null);

      try {
        const response = await updateMemo(memo._id, {
          title: memo.title,
          content: memo.content,
          isDone: !memo.isDone,
        });

        if (!response.ok) {
          throw new Error("完了状態の切り替えに失敗しました。");
        }

        await loadMemos();
      } catch (err) {
        console.error("完了切り替えエラー:", err);
        toast.error(err.message || "完了状態の更新中にエラーが発生しました。");
        setError(err.message || "完了状態の更新中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading, setError]
  );

  // 🔸 ピン状態切替処理
  const handleTogglePin = useCallback(
    async (memo) => {
      setLoading(true);

      try {
        const response = await updateMemo(memo._id, {
          isPinned: !memo.isPinned,
        });

        if (!response.ok) {
          throw new Error("ピン状態の更新に失敗しました。");
        }

        await loadMemos();
      } catch (err) {
        console.error("ピン切り替えエラー:", err);
        toast.error(err.message || "ピン状態の更新中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading]
  );

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleDone,
    handleTogglePin,
  };
};
