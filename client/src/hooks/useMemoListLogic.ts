// src/hooks/useMemoListLogic.ts
import { useCallback, useEffect, useState } from "react";
import { fetchMemos } from "../api";
import { toast } from "react-hot-toast";
import type { Memo, PagedMemosResponse } from "@/types/api";

interface UseMemoListLogicReturn {
  memos: Memo[];
  total: number;
  error: string | null;
  loading: boolean;
  loadMemos: () => Promise<void>;
  setMemos: React.Dispatch<React.SetStateAction<Memo[]>>;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useMemoListLogic = (
  page: number,
  limit: number,
): UseMemoListLogicReturn => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadMemos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchMemos(page, limit) as PagedMemosResponse;
      console.log("📦 memos data:", data);

      setMemos(data.memos);
      setTotal(data.total);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "メモの取得に失敗しました。";
      console.error("メモ取得エラー:", err);
      setError(message);
      setMemos([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

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
