// src/hooks/useMemoListLogic.js
import { useCallback, useEffect, useState } from "react";
import { fetchMemos } from "../api";
import { toast } from "react-hot-toast";

export const useMemoListLogic = (page, limit) => {
  const [memos, setMemos] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMemos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchMemos(page, limit);
      console.log("📦 memos data:", data);

      setMemos(data.memos);
      setTotal(data.total);
    } catch (err) {
      console.error("メモ取得エラー:", err);
      setError(err.message || "メモの取得に失敗しました。");
      setMemos([]);
      toast.error(err.message || "メモの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [page, limit]); // navigate を削除（不要）

  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  return {
    memos,
    total,
    error,
    loading,
    loadMemos,
    setMemos,
    setTotal,
    setError,
    setLoading,
  };
};
