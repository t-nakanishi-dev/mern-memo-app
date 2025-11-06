// src/hooks/useMemoAction.js
import { useCallback } from "react";
import { createMemo, updateMemo, deleteMemo } from "../api";
import { toast } from "react-hot-toast";

/**
 * メモに対するアクションを扱うカスタムフック
 * （作成・更新・削除・ピン切替・完了状態切替）
 */
export const useMemoActions = ({
  token,
  loadMemos,
  setLoading,
  setError,
  setEditingMemoId,
}) => {
  // 🔸 新しいメモ作成処理
  const handleCreate = useCallback(
    async (title, content, category, attachments = []) => {
      if (!token) {
        toast.error("ログインが必要です。");
        setError("ログインが必要です。");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // API経由でメモ作成
        const response = await createMemo(token, {
          title,
          content,
          category,
          attachments,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "メモ作成に失敗しました。");
        }

        await loadMemos(); // 作成後にメモ一覧を再読み込み
        toast.success("メモを作成しました！");
      } catch (err) {
        console.error("メモ作成エラー:", err);
        toast.error(err.message || "メモ作成中にエラーが発生しました。");
        setError(err.message || "メモ作成中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    },
    [token, loadMemos, setLoading, setError]
  );

  // 🔸 メモ編集・更新処理
  const handleUpdate = useCallback(
    async (id, title, content, category, attachments = undefined) => {
      if (!token) {
        toast.error("ログインが必要です。");
        setError("ログインが必要です。");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const payload = {
          title,
          content,
          category,
        };

        // 添付ファイルが明示的に渡されている場合のみ更新対象に含める
        if (attachments !== undefined) {
          payload.attachments = attachments;
        }

        const response = await updateMemo(token, id, payload);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "メモ更新に失敗しました。");
        }

        await loadMemos(); // 更新後にメモ一覧を再読み込み
        setEditingMemoId(null); // 編集中IDをクリア
        toast.success("メモを更新しました！");
      } catch (err) {
        console.error("メモ更新エラー:", err);
        toast.error(err.message || "メモ更新中にエラーが発生しました。");
        setError(err.message || "メモ更新中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    },
    [token, loadMemos, setLoading, setError, setEditingMemoId]
  );

  // 🔸 メモ削除処理（ゴミ箱へ移動）
  const handleDelete = useCallback(
    async (id) => {
      if (!token) {
        toast.error("ログインが必要です。");
        setError("ログインが必要です。");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await deleteMemo(token, id);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "メモ削除に失敗しました。");
        }

        await loadMemos(); // 削除後にメモ一覧を再読み込み
        toast.success("メモをゴミ箱に移動しました。");
      } catch (err) {
        console.error("メモ削除エラー:", err);
        toast.error(err.message || "メモ削除中にエラーが発生しました。");
        setError(err.message || "メモ削除中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    },
    [token, loadMemos, setLoading, setError]
  );

  // 🔸 完了状態切替処理（isDone true/false）
  const handleToggleDone = useCallback(
    async (memo) => {
      if (!token) {
        toast.error("ログインが必要です。");
        setError("ログインが必要です。");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await updateMemo(token, memo._id, {
          title: memo.title,
          content: memo.content,
          isDone: !memo.isDone, // 完了状態を反転
        });

        if (!response.ok) {
          throw new Error("完了状態の切り替えに失敗しました。");
        }

        await loadMemos(); // 更新後にメモ一覧を再読み込み
      } catch (err) {
        console.error("完了切り替えエラー:", err);
        toast.error(err.message || "完了状態の更新中にエラーが発生しました。");
        setError(err.message || "完了状態の更新中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    },
    [token, loadMemos, setLoading, setError]
  );

  // 🔸 ピン状態切替処理（isPinned true/false）
  const handleTogglePin = useCallback(
    async (memo) => {
      if (!token) {
        toast.error("ログインが必要です。");
        return;
      }

      setLoading(true);

      try {
        const response = await updateMemo(token, memo._id, {
          isPinned: !memo.isPinned, // ピン状態を反転
        });

        if (!response.ok) {
          throw new Error("ピン状態の更新に失敗しました。");
        }

        await loadMemos(); // 更新後にメモ一覧を再読み込み
      } catch (err) {
        console.error("ピン切り替えエラー:", err);
        toast.error(err.message || "ピン状態の更新中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    },
    [token, loadMemos, setLoading]
  );

  // 🔸 外部で使用するアクション関数をまとめて返す
  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleDone,
    handleTogglePin,
  };
};
