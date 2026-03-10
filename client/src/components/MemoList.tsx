// client/src/components/MemoList.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MemoForm from "./MemoForm";
import MemoCard from "./MemoCard";
import DeleteModal from "./DeleteModal";
import MemoSortSelect from "./MemoSortSelect";
import Pagination from "./Pagination";
import { fetchTrashedMemos } from "../api";
import { useMemoListLogic } from "../hooks/useMemoListLogic";
import { useMemoActions } from "../hooks/useMemoActions";
import { useFilteredMemos } from "../hooks/useFilteredMemos";
import { Search, Sparkles, PlusCircle, Loader2, Package } from "lucide-react";
import { Memo } from "@/types/api"; // これでOKになるはず
import type { SortOrder } from "@/hooks/utils/sortMemos";

const MemoList: React.FC = () => {
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 12;

  const [trashedCount, setTrashedCount] = useState<number>(0);

  const { memos, total, loading, error, loadMemos, setLoading, setError } =
    useMemoListLogic(page, limit);

  const { handleCreate, handleDelete, handleToggleDone, handleTogglePin } =
    useMemoActions({ loadMemos, setLoading, setError });

  const { sortedAndFilteredMemos } = useFilteredMemos(
    memos,
    searchQuery,
    filterCategory,
    sortOrder,
  );

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setSelectedMemoId(id);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    const fetchTrashedCount = async () => {
      try {
        const response = await fetchTrashedMemos(1, 1);
        setTrashedCount(response.total ?? 0);
      } catch (err) {
        console.log("ゴミ箱件数取得失敗（無視）", err);
      }
    };

    fetchTrashedCount();
    const interval = setInterval(fetchTrashedCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          マイメモ
        </h1>

        <Link
          to="/trash"
          className="group flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-red-500/30 transition-all transform hover:scale-105"
        >
          <Package className="w-6 h-6 group-hover:animate-pulse" />
          ゴミ箱を見る
          {trashedCount > 0 && (
            <span className="ml-3 px-3 py-1 bg-white text-red-600 rounded-lg text-sm font-bold animate-pulse">
              {trashedCount}
            </span>
          )}
        </Link>
      </div>

      <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="メモを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          >
            <option value="">すべてのカテゴリ</option>
            <option value="仕事">仕事</option>
            <option value="日記">日記</option>
            <option value="買い物">買い物</option>
            <option value="アイデア">アイデア</option>
            <option value="その他">その他</option>
          </select>

          <div className="flex justify-end">
            <MemoSortSelect sortOrder={sortOrder} setSortOrder={setSortOrder} />
          </div>
        </div>
      </div>

      <div className="mb-10">
        <MemoForm loading={loading} onCreate={handleCreate} />
      </div>

      {loading && (
        <div className="text-center py-24">
          <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            メモを読み込んでいます...
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-24">
          <p className="text-red-500 text-lg font-semibold">{error}</p>
        </div>
      )}

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
        {sortedAndFilteredMemos.map(
          (
            memo: Memo, // ← ここで Memo 型を使う
          ) => (
            <MemoCard
              key={memo._id}
              memo={memo}
              confirmDelete={confirmDelete}
              handleToggleDone={handleToggleDone}
              handleTogglePin={handleTogglePin}
            />
          ),
        )}
      </div>

      {total > limit && (
        <div className="mt-16">
          <Pagination
            page={page}
            totalPages={Math.ceil(total / limit)}
            onPageChange={setPage}
          />
        </div>
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          if (selectedMemoId) await handleDelete(selectedMemoId);
          setShowDeleteModal(false);
        }}
        onCancel={() => setShowDeleteModal(false)}
      />

      <Toaster position="top-center" />
    </div>
  );
};

export default MemoList;
