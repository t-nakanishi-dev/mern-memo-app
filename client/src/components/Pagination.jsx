// client/src/components/Pagination.jsx
import React from "react";

const Pagination = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
      >
        ◀ 前へ
      </button>

      <span className="text-gray-700 dark:text-gray-200">
        {page} / {totalPages} ページ
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
      >
        次へ ▶
      </button>
    </div>
  );
};

export default Pagination;
