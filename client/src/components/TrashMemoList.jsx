// client/src/components/TrashMemoList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchTrashedMemos,
  restoreMemo,
  permanentlyDeleteMemo,
  emptyTrash,
} from "../api";
import { toast, Toaster } from "react-hot-toast";
import { ArrowLeft, Trash2, RotateCcw, Package, Loader2 } from "lucide-react";
import MemoCard from "./MemoCard"; // ← 同じMemoCardを再利用！超統一感！

const TrashMemoList = () => {
  const navigate = useNavigate();
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [total, setTotal] = useState(0);

  const token = localStorage.getItem("token");

  const loadTrashedMemos = async (pageToLoad = page) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetchTrashedMemos(token, pageToLoad, limit);
      if (!res.ok) throw new Error("ゴミ箱のメモを取得できませんでした");

      const data = await res.json();
      setMemos(data.memos || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrashedMemos();
  }, [page]);

  // 復元
  const handleRestore = async (id) => {
    try {
      const res = await restoreMemo(token, id);
      if (!res.ok) throw new Error("復元に失敗しました");
      toast.success("メモを復元しました！");
      loadTrashedMemos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 完全削除（ゴミ箱からも消す）
  const handlePermanentDelete = async (id) => {
    if (
      !window.confirm("本当に完全に削除しますか？\nこの操作は元に戻せません。")
    )
      return;

    try {
      const res = await permanentlyDeleteMemo(token, id);
      if (!res.ok) throw new Error("削除に失敗しました");
      toast.success("完全に削除しました");
      loadTrashedMemos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ゴミ箱を空にする
  const handleEmptyTrash = async () => {
    if (
      !window.confirm(
        "ゴミ箱を空にしますか？\nすべてのメモが完全に削除されます。"
      )
    )
      return;

    try {
      const res = await emptyTrash(token);
      if (!res.ok) throw new Error("ゴミ箱を空にできませんでした");
      toast.success("ゴミ箱を空にしました");
      setMemos([]);
      setTotal(0);
      setPage(1);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Package className="w-10 h-10 text-red-500" />
                ゴミ箱
              </h1>
              <p className="text-gray1-600 dark:text-gray-400 mt-1">
                {total} 件のメモがゴミ箱に入っています
              </p>
            </div>
          </div>

          <button
            onClick={handleEmptyTrash}
            disabled={loading || total === 0}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-500/25"
          >
            <Trash2 className="w-5 h-5" />
            ゴミ箱を空にする
          </button>
        </div>
      </div>

      {/* ローディング */}
      {loading && (
        <div className="text-center py-24">
          <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="text-center py-24 text-red-500 text-xl font-bold">
          {error}
        </div>
      )}

      {/* 空のとき */}
      {!loading && !error && memos.length === 0 && (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full mb-8">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
            ゴミ箱は空です
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            削除したメモはここに一時保管されます
          </p>
        </div>
      )}

      {/* ゴミ箱メモ一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
        {memos.map((memo) => (
          <div key={memo._id} className="relative group">
            {" "}
            {/* ← group追加！ */}
            {/* 半透明のダークオーバーレイ（ホバー時のみ） */}
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
            {/* アクションボタン（ホバーで登場＋半透明背景） */}
            <div className="absolute top-4 left-4 z-20 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              {/* 復元ボタン */}
              <button
                onClick={() => handleRestore(memo._id)}
                className="p-3 bg-green-600/90 hover:bg-green-600 backdrop-blur-sm text-white rounded-xl shadow-xl hover:scale-110 transition-all"
                title="このメモを復元"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* 完全削除ボタン */}
              <button
                onClick={() => handlePermanentDelete(memo._id)}
                className="p-3 bg-red-600/90 hover:bg-red-600 backdrop-blur-sm text-white rounded-xl shadow-xl hover:scale-110 transition-all"
                title="完全に削除（復元不可）"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            {/* ゴミ箱にあることを示す赤い帯 */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-t-2xl" />
            {/* 実際のメモカード */}
            <MemoCard
              memo={memo}
              confirmDelete={() => handlePermanentDelete(memo._id)}
              handleToggleDone={() => {}}
              handleTogglePin={() => {}}
            />
          </div>
        ))}
      </div>

      {/* ページネーション */}
      {total > limit && (
        <div className="mt-16 flex justify-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded-xl transition-all"
            >
              前へ
            </button>
            <span className="text-lg font-medium">
              {page} / {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded-xl transition-all"
            >
              次へ
            </button>
          </div>
        </div>
      )}

      <Toaster position="top-center" />
    </div>
  );
};

export default TrashMemoList;
