// src/hooks/useFilteredMemos.ts
import { useMemo } from "react";
import type { Memo } from "@/types/api";
import { sortMemos, type SortOrder } from "./utils/sortMemos";

export const useFilteredMemos = (
  memos: Memo[],
  searchQuery: string,
  filterCategory: string,
  sortOrder: SortOrder,
) => {
  // フィルタリング部分（検索 + カテゴリ）
  const filteredMemos = useMemo(() => {
    // 両方空ならフィルタ不要 → 元の配列をそのまま返す（参照コスト削減）
    if (!searchQuery.trim() && !filterCategory) {
      return memos;
    }

    const lowerSearch = searchQuery.toLowerCase().trim();

    return memos.filter((memo) => {
      const matchesSearch =
        memo.title.toLowerCase().includes(lowerSearch) ||
        memo.content.toLowerCase().includes(lowerSearch);

      const matchesCategory = filterCategory
        ? memo.category === filterCategory
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [memos, searchQuery, filterCategory]);

  // ソート適用（filteredMemosが変わったときだけ再計算）
  const sortedAndFilteredMemos = useMemo(() => {
    return sortMemos(filteredMemos, sortOrder);
  }, [filteredMemos, sortOrder]);

  return {
    filteredMemos,
    sortedAndFilteredMemos,
  };
};
