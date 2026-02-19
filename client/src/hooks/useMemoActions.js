// src/hooks/useMemoActions.js
import { useCallback } from "react";
import { createMemo, updateMemo, deleteMemo } from "../api";
import { toast } from "react-hot-toast";

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
        await createMemo({
          title,
          content,
          category,
          attachments,
        });

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
    [loadMemos, setLoading, setError],
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

        await updateMemo(id, payload);

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
    [loadMemos, setLoading, setError, setEditingMemoId],
  );

  // 🔸 メモ削除処理（ゴミ箱へ移動）
  const handleDelete = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        await deleteMemo(id);

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
    [loadMemos, setLoading, setError],
  );

  // 🔸 完了状態切替処理
  const handleToggleDone = useCallback(
    async (memo) => {
      setLoading(true);
      setError(null);

      try {
        await updateMemo(memo._id, {
          title: memo.title,
          content: memo.content,
          isDone: !memo.isDone,
        });

        await loadMemos();
      } catch (err) {
        console.error("完了切り替えエラー:", err);
        toast.error(err.message || "完了状態の更新中にエラーが発生しました。");
        setError(err.message || "完了状態の更新中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    },
    [loadMemos, setLoading, setError],
  );

  // 🔸 ピン状態切替処理
  const handleTogglePin = useCallback(
    async (memo) => {
      setLoading(true);

      try {
        await updateMemo(memo._id, {
          isPinned: !memo.isPinned,
        });

        await loadMemos();
      } catch (err) {
        console.error("ピン切り替えエラー:", err);
        toast.error(err.message || "ピン状態の更新中にエラーが発生しました。");
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
