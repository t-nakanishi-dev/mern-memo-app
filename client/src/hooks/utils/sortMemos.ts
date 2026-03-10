// src/hooks/utils/sortMemos.ts
import type { Memo } from "@/types/api";

/**
 * ソート順の種類
 */
export type SortOrder = "newest" | "oldest";

/**
 * メモ配列を以下の優先順位で並び替える
 * 1. ピン留め (isPinned: true) が最上位
 * 2. 未完了 (isDone: false) が完了済み (isDone: true) より上
 * 3. createdAt の日付順（newest: 降順 / oldest: 昇順）
 *
 * @param memosToSort - 並び替え対象（元の配列は変更しない）
 * @param order - 並び順（デフォルト: "newest"）
 * @returns 新しい並び替え済み配列
 */
export function sortMemos(
  memosToSort: readonly Memo[] | Memo[],
  order: SortOrder = "newest"
): Memo[] {
  const sorted = [...memosToSort];

  sorted.sort((a, b) => {
    // 1. ピン留め優先
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    // 2. 未完了優先
    if (a.isDone !== b.isDone) {
      return a.isDone ? 1 : -1;
    }

    // 3. createdAt で日付比較
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    return order === "newest" ? dateB - dateA : dateA - dateB;
  });

  return sorted;
}