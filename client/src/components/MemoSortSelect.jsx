// client/src/components/MemoSortSelect.jsx
import React from "react";

const MemoSortSelect = ({ sortOrder, setSortOrder }) => {
  return (
    <div className="mb-4 flex justify-end">
      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
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
