// src/hooks/useFilteredMemos.ts
import { useMemo } from "react";
import type { Memo } from "@/types/api";
import { sortMemos } from "./utils/sortMemos";  // ← 既存のまま想定（後で型付け推奨）

type SortOrder = "newest" | "oldest" | "priority";

export const useFilteredMemos = (
  memos: Memo[],
  searchQuery: string,
  filterCategory: string,
  sortOrder: SortOrder,
) => {
  // 検索 + カテゴリフィルタ
  const filteredMemos = useMemo(() => {
    return memos.filter((memo) => {
      const matchesSearch =
        memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memo.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filterCategory
        ? memo.category === filterCategory
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [memos, searchQuery, filterCategory]);

  // ソート適用
  const sortedAndFilteredMemos = useMemo(() => {
    return sortMemos(filteredMemos, sortOrder);
  }, [filteredMemos, sortOrder]);

  return { filteredMemos, sortedAndFilteredMemos };
};