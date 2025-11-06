// hooks/utils/sortMemos.js

/**
 * メモ配列を並び替えるユーティリティ関数
 *
 * ソートルールの優先順位:
 * 1. ピン留めされたメモ (isPinned: true) が最優先で先頭に来る
 * 2. 未完了のメモ (isDone: false) が完了済み (isDone: true) より先に来る
 * 3. 作成日 createdAt の新しい順 or 古い順で並び替える
 *
 * @param {Array} memosToSort - 並び替え対象のメモ配列
 * @param {string} order - 並び順 ("newest": 新しい順, "oldest": 古い順)
 * @returns {Array} 並び替えられた新しいメモ配列
 */
export const sortMemos = (memosToSort, order) => {
  // 元の配列を直接変更しないようにスプレッド構文で浅いコピーを作成
  const sorted = [...memosToSort];

  // 配列をカスタムルールに基づいてソート
  sorted.sort((a, b) => {
    // 1️⃣ ピン留め (isPinned: true) を優先
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

    // 2️⃣ 完了状態 (isDone: false → true) を優先
    if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;

    // 3️⃣ 作成日 (createdAt) を比較
    if (order === "newest")
      // 新しい順（降順: 日付が大きい方が先）
      return new Date(b.createdAt) - new Date(a.createdAt);

    if (order === "oldest")
      // 古い順（昇順: 日付が小さい方が先）
      return new Date(a.createdAt) - new Date(b.createdAt);

    // 上記条件に当てはまらなければ元の順序を維持
    return 0;
  });

  return sorted;
};
