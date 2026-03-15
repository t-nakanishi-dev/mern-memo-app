// client/src/components/MemoSortSelect.tsx
import React from "react";
import type { SortOrder } from "@/hooks/utils/sortMemos"; // ← これを追加（すでに存在する型を import）

interface MemoSortSelectProps {
  sortOrder: SortOrder;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  // または短く: (value: SortOrder | ((prev: SortOrder) => SortOrder)) => void
  // でも Dispatch<SetStateAction<...>> が一番自然で一般的
}

const MemoSortSelect = ({ sortOrder, setSortOrder }: MemoSortSelectProps) => {
  return (
    <div className="mb-4 flex justify-end">
      <select
        value={sortOrder}
        onChange={
          (e: React.ChangeEvent<HTMLSelectElement>) =>
            setSortOrder(e.target.value as SortOrder) // ← as SortOrder で安全にキャスト
        }
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm
                   focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   dark:border-gray-600"
      >
        <option value="newest">新しい順</option>
        <option value="oldest">古い順</option>
      </select>
    </div>
  );
};

export default MemoSortSelect;
