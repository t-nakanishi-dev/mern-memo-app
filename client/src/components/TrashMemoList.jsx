// client/src/components/TrashMemoList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTrashedMemos, restoreMemo, emptyTrash } from "../api";
import { Toaster, toast } from "react-hot-toast";

/**
 * TrashMemoListコンポーネント
 * ----------------------------
 * ゴミ箱に入ったメモの一覧を表示・復元・完全削除するページ
 */
const TrashMemoList = () => {
  const navigate = useNavigate();

  // 状態管理
  const [memos, setMemos] = useState([]); // ゴミ箱メモ一覧
  const [loading, setLoading] = useState(false); // 読み込み中フラグ
  const [error, setError] = useState(null); // エラーメッセージ
  const [page, setPage] = useState(1); // 現在ページ
  const [limit] = useState(10); // 1ページあたり表示件数
  const [total, setTotal] = useState(0); // 総メモ件数

  const token = localStorage.getItem("token"); // ログイン認証用トークン取得

  /**
   * ゴミ箱メモ取得関数
   * @param {number} pageToLoad - 取得するページ番号
   */
  const loadTrashedMemos = async (pageToLoad = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTrashedMemos(token, pageToLoad, limit);

      if (!res.ok) {
        // APIエラー時の処理
        const data = await res.json();
        throw new Error(data.message || "取得に失敗しました。");
      }

      const data = await res.json();
      setMemos(data.memos);
      setTotal(data.total);

      // ページが空の場合は1ページ前に戻す（最低1ページ目）
      if (data.memos.length === 0 && pageToLoad > 1) {
        setPage(pageToLoad - 1);
      }
    } catch (err) {
      setError(err.message);
      setMemos([]);
    } finally {
      setLoading(false);
    }
  };

  // 初回レンダリング時・ページ変更時にゴミ箱メモを取得
  useEffect(() => {
    if (!token) {
      // トークンがない場合はログインページへ
      navigate("/login");
      return;
    }
    loadTrashedMemos(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, limit, navigate]);

  /**
   * メモを復元する処理
   * @param {string} id - 復元するメモのID
   */
  const handleRestore = async (id) => {
    setLoading(true);
    try {
      const res = await restoreMemo(token, id);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "復元に失敗しました。");
      }
      toast.success("メモを復元しました。");
      // 復元後はページを再取得して整合性を保つ
      await loadTrashedMemos(page);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ゴミ箱を空にする処理
   */
  const handleEmptyTrash = async () => {
    if (!window.confirm("本当にゴミ箱を空にしますか？")) return;

    setLoading(true);
    try {
      const res = await emptyTrash(token);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "完全削除に失敗しました。");
      }
      toast.success("ゴミ箱を空にしました。");
      // 空にしたので1ページ目を表示
      setPage(1);
      setMemos([]);
      setTotal(0);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ページ変更処理
   * @param {number} newPage - 新しいページ番号
   */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.max(1, Math.ceil(total / limit))) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🗑 ゴミ箱</h2>

      {/* メモ一覧ページに戻るボタンとゴミ箱を空にするボタン */}
      <div className="mb-4 flex justify-between">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow"
          disabled={loading}
        >
          ← メモ一覧に戻る
        </button>

        <button
          onClick={handleEmptyTrash}
          className="bg-red-500 text-white px-4 py-2 rounded shadow"
          disabled={loading || memos.length === 0}
        >
          ゴミ箱を空にする
        </button>
      </div>

      {/* 状態表示 */}
      {loading && <p>読み込み中...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && memos.length === 0 && !error && <p>ゴミ箱は空です。</p>}

      {/* ゴミ箱メモ一覧 */}
      <ul className="space-y-4">
        {memos.map((memo) => (
          <li key={memo._id} className="border rounded p-4 shadow">
            <h3 className="font-semibold text-lg">{memo.title}</h3>
            <p className="text-sm text-gray-600">{memo.content}</p>
            <button
              onClick={() => handleRestore(memo._id)}
              className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
              disabled={loading}
            >
              復元
            </button>
          </li>
        ))}
      </ul>

      {/* ページネーション */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1 || loading}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          ◀ 前へ
        </button>

        <span>
          {page} / {Math.max(1, Math.ceil(total / limit))} ページ
        </span>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= Math.ceil(total / limit) || loading}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          次へ ▶
        </button>
      </div>

      {/* トースト通知 */}
      <Toaster position="top-center" />
    </div>
  );
};

export default TrashMemoList;
