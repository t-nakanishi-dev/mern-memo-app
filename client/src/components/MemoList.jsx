// client/src/components/MemoList.jsx
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import MemoForm from "./MemoForm";
import MemoCard from "./MemoCard";
import DeleteModal from "./DeleteModal";
import MemoSortSelect from "./MemoSortSelect";
import Pagination from "./Pagination";
import { useMemoListLogic } from "../hooks/useMemoListLogic";
import { useMemoActions } from "../hooks/useMemoActions";
import { useFilteredMemos } from "../hooks/useFilteredMemos";
import { Search, Sparkles, PlusCircle, Loader2 } from "lucide-react";

const MemoList = () => {
  const token = localStorage.getItem("token");

  const [sortOrder, setSortOrder] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { memos, total, loading, error, loadMemos, setLoading, setError } =
    useMemoListLogic(token, page, limit);
  const { handleCreate, handleDelete, handleToggleDone, handleTogglePin } =
    useMemoActions({
      token,
      loadMemos,
      setLoading,
      setError,
    });

  const { sortedAndFilteredMemos } = useFilteredMemos(
    memos,
    searchQuery,
    filterCategory,
    sortOrder
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMemoId, setSelectedMemoId] = useState(null);
  const confirmDelete = (id) => {
    setSelectedMemoId(id);
    setShowDeleteModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 検索＋フィルタバー */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="メモを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
            />
          </div>

          {/* カテゴリフィルタ */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          >
            <option value="">すべてのカテゴリ</option>
            <option value="仕事">仕事</option>
            <option value="日記">日記</option>
            <option value="買い物">買い物</option>
            <option value="アイデア">アイデア</option>
            <option value="その他">その他</option>
          </select>

          {/* 並び替え */}
          <div className="flex justify-end">
            <MemoSortSelect sortOrder={sortOrder} setSortOrder={setSortOrder} />
          </div>
        </div>
      </div>

      {/* 新規作成フォーム */}
      <div className="mb-10">
        <MemoForm token={token} loading={loading} onCreate={handleCreate} />
      </div>

      {/* ローディング */}
      {loading && (
        <div className="text-center py-24">
          <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            メモを読み込んでいます...
          </p>
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="text-center py-24">
          <p className="text-red-500 text-lg font-semibold">{error}</p>
        </div>
      )}

      {/* 空状態 */}
      {!loading && !error && sortedAndFilteredMemos.length === 0 && (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full mb-8 shadow-2xl">
            <Sparkles className="w-14 h-14 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
            まだメモがありません
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            <PlusCircle className="inline w-5 h-5 mr-1" />
            上のフォームから最初のメモを作成してみましょう！
          </p>
        </div>
      )}

      {/* メモグリッド（xlで4列に！） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
        {sortedAndFilteredMemos.map((memo) => (
          <MemoCard
            key={memo._id}
            memo={memo}
            confirmDelete={confirmDelete}
            handleToggleDone={handleToggleDone}
            handleTogglePin={handleTogglePin}
          />
        ))}
      </div>

      {/* ページネーション */}
      {total > limit && (
        <div className="mt-16">
          <Pagination
            page={page}
            totalPages={Math.ceil(total / limit)}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* モーダル */}
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={() =>
          handleDelete(selectedMemoId).then(() => setShowDeleteModal(false))
        }
        onCancel={() => setShowDeleteModal(false)}
      />

      <Toaster position="top-center" />
    </div>
  );
};

export default MemoList;
