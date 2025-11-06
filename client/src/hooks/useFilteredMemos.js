// src/hooks/useFilteredMemos.js
import { useMemo } from "react";
import { sortMemos } from "./utils/sortMemos";

export const useFilteredMemos = (
  memos,
  searchQuery,
  filterCategory,
  sortOrder
) => {
  // ステップ1: 検索キーワードとカテゴリでメモをフィルタリング
  const filteredMemos = useMemo(() => {
    return memos.filter((memo) => {
      // タイトルまたは本文に検索キーワードが含まれているか（大文字小文字を無視）
      const matchesSearch =
        memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memo.content.toLowerCase().includes(searchQuery.toLowerCase());

      // カテゴリが一致するか（フィルタが設定されている場合のみチェック）
      const matchesCategory = filterCategory
        ? memo.category === filterCategory
        : true;

      // 検索条件とカテゴリ条件を両方満たすメモのみを返す
      return matchesSearch && matchesCategory;
    });
  }, [memos, searchQuery, filterCategory]);

  // ステップ2: フィルタ済みメモを選択された順序で並び替え
  const sortedAndFilteredMemos = useMemo(() => {
    return sortMemos(filteredMemos, sortOrder);
  }, [filteredMemos, sortOrder]);

  // フィルタ済みメモとフィルタ+ソート済みメモの両方を返す
  return { filteredMemos, sortedAndFilteredMemos };
};
