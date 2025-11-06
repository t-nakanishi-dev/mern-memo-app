// client/src/components/MemoList.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// 子コンポーネントのインポート
import MemoForm from "./MemoForm"; // 新規メモ作成フォーム
import MemoCard from "./MemoCard"; // 各メモの表示カード
import DeleteModal from "./DeleteModal"; // 削除確認モーダル
import MemoSortSelect from "./MemoSortSelect"; // 並び替え選択
import Pagination from "./Pagination"; // ページネーション

// カスタムフックのインポート
import { useMemoListLogic } from "../hooks/useMemoListLogic"; // メモ取得・状態管理
import { useMemoActions } from "../hooks/useMemoActions"; // CRUD操作ロジック
import { useFilteredMemos } from "../hooks/useFilteredMemos"; // 検索・フィルタ・ソート処理

const MemoList = () => {
  const navigate = useNavigate();

  // 編集中メモの状態管理
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [editedCategory, setEditedCategory] = useState("");

  // 削除モーダル関連
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMemoId, setSelectedMemoId] = useState(null);

  // 並び替え・検索・カテゴリフィルタ
  const [sortOrder, setSortOrder] = useState("newest"); // デフォルトは新しい順
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // ページネーション管理
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // 1ページあたり表示件数

  // ログインユーザーのトークンを取得
  const token = localStorage.getItem("token");

  // ✅ カスタムフック: メモ一覧取得とローディング管理
  const { memos, total, error, loading, loadMemos, setError, setLoading } =
    useMemoListLogic(token, page, limit);

  // ✅ カスタムフック: メモのCRUD操作
  const {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleDone,
    handleTogglePin,
  } = useMemoActions({
    token,
    loadMemos,
    setLoading,
    setError,
    setEditingMemoId,
  });

  // ✅ 検索・カテゴリフィルタ・並び替え済みのメモ一覧
  const { sortedAndFilteredMemos } = useFilteredMemos(
    memos,
    searchQuery,
    filterCategory,
    sortOrder
  );

  // ページ切り替え処理
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };

  // 削除確認モーダルを開く
  const confirmDelete = (id) => {
    setSelectedMemoId(id);
    setShowDeleteModal(true);
  };

  // モーダルで削除確定
  const handleDeleteConfirmed = async () => {
    if (!selectedMemoId) return;
    await handleDelete(selectedMemoId);
    setShowDeleteModal(false);
    setSelectedMemoId(null);
  };

  // モーダルをキャンセル
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedMemoId(null);
  };

  // 編集開始時にフォームに値をセット
  const startEditing = (memo) => {
    setEditingMemoId(memo._id);
    setEditedTitle(memo.title);
    setEditedContent(memo.content);
    setEditedCategory(memo.category || "");
  };

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div className="p-4 md:p-8">
      {/* ===== ヘッダー部分 ===== */}
      <div className="flex justify-between items-center mb-6">
        {/* ゴミ箱ページへ */}
        <button
          onClick={() => navigate("/trash")}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          🗑 ゴミ箱
        </button>

        {/* タイトル */}
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 text-center flex-grow">
          📝 メモ一覧
        </h2>

        {/* プロフィール・ログアウト（ログイン時のみ表示） */}
        {token && (
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/profile")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
            >
              プロフィール
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>

      {/* 並び替えセレクト */}
      <MemoSortSelect sortOrder={sortOrder} setSortOrder={setSortOrder} />

      {/* 検索ボックス */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="タイトルまたは内容で検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
        />
      </div>

      {/* カテゴリフィルタ */}
      <div className="mb-6">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
          <option value="">カテゴリで絞り込み（すべて）</option>
          <option value="仕事">仕事</option>
          <option value="日記">日記</option>
          <option value="買い物">買い物</option>
          <option value="アイデア">アイデア</option>
          <option value="その他">その他</option>
        </select>
      </div>

      {/* 読み込み中・エラー表示 */}
      {loading && (
        <p className="text-blue-600 dark:text-blue-400 text-center mb-4">
          読み込み中...
        </p>
      )}
      {error && (
        <p className="text-red-500 text-center mb-4 font-medium">{`エラー: ${error}`}</p>
      )}

      {/* 新規メモ作成フォーム */}
      <MemoForm token={token} loading={loading} onCreate={handleCreate} />

      {/* メモがない場合のメッセージ */}
      {memos.length === 0 && !loading && !error && token && (
        <p className="text-gray-600 dark:text-gray-400 text-center text-lg mt-8">
          メモがありません。新しいメモを作成しましょう！
        </p>
      )}

      {/* ===== メモ一覧の表示（フィルタ・ソート済み） ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAndFilteredMemos.map((memo) => (
          <MemoCard
            key={memo._id}
            memo={memo}
            editingMemoId={editingMemoId}
            editedTitle={editedTitle}
            editedContent={editedContent}
            setEditedTitle={setEditedTitle}
            setEditedContent={setEditedContent}
            setEditingMemoId={setEditingMemoId}
            startEditing={startEditing}
            handleUpdate={handleUpdate}
            confirmDelete={confirmDelete}
            handleToggleDone={handleToggleDone}
            handleTogglePin={handleTogglePin}
            loading={loading}
            editedCategory={editedCategory}
            setEditedCategory={setEditedCategory}
          />
        ))}
      </div>

      {/* 削除確認モーダル */}
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirmed}
        onCancel={handleCancelDelete}
      />

      {/* ページネーション */}
      <Pagination
        page={page}
        totalPages={Math.ceil(total / limit)}
        onPageChange={handlePageChange}
      />

      {/* トースト通知 */}
      <Toaster position="top-center" />
    </div>
  );
};

export default MemoList;
