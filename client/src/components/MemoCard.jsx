// client/src/components/MemoCard.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";

/**
 * メモカードコンポーネント
 * 1件のメモを表示し、編集・削除・完了切替・ピン留めなどの操作を提供
 * PDFや画像添付ファイルのプレビューにも対応
 */
const MemoCard = ({
  memo, // メモデータ（タイトル、内容、カテゴリ、ステータス、添付ファイルなど）
  editingMemoId, // 現在編集中のメモID
  editedTitle, // 編集中のタイトル
  editedContent, // 編集中の内容
  setEditedTitle, // 編集タイトル更新関数
  setEditedContent, // 編集内容更新関数
  loading, // 保存処理中フラグ
  startEditing, // 編集開始処理
  handleUpdate, // メモ更新処理
  setEditingMemoId, // 編集中IDセット関数
  confirmDelete, // 削除確認処理
  handleToggleDone, // 完了/未完了切替処理
  handleTogglePin, // ピン留め切替処理
  editedCategory, // 編集中カテゴリ
  setEditedCategory, // 編集中カテゴリ更新関数
}) => {
  // PDFプレビューモーダルの表示フラグ
  const [showPdfModal, setShowPdfModal] = useState(false);
  // PDFプレビュー用URL
  const [pdfUrl, setPdfUrl] = useState("");

  /**
   * PDFプレビューモーダルを開く
   * @param {string} url PDFのURL
   */
  const openPdfModal = (url) => {
    setPdfUrl(url);
    setShowPdfModal(true);
  };

  /**
   * PDFプレビューモーダルを閉じる
   */
  const closePdfModal = () => {
    setShowPdfModal(false);
    setPdfUrl("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* 編集モード判定 */}
      {editingMemoId === memo._id ? (
        <div>
          {/* タイトル編集フォーム */}
          <input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="タイトル"
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md
                       dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />

          {/* 内容編集フォーム */}
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="内容"
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md h-24 resize-y
                       dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />

          {/* カテゴリ選択 */}
          <select
            value={editedCategory}
            onChange={(e) => setEditedCategory(e.target.value)}
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md
             dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="">カテゴリを選択</option>
            <option value="仕事">仕事</option>
            <option value="日記">日記</option>
            <option value="買い物">買い物</option>
            <option value="アイデア">アイデア</option>
            <option value="その他">その他</option>
          </select>

          {/* 保存・キャンセルボタン */}
          <div className="flex gap-3">
            <button
              onClick={() =>
                handleUpdate(
                  memo._id,
                  editedTitle,
                  editedContent,
                  editedCategory
                )
              }
              disabled={loading} // 保存中は押せない
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              保存
            </button>

            <button
              onClick={() => setEditingMemoId(null)} // 編集キャンセル
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg
                         transition-colors duration-300"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        // 表示モード
        <div>
          {/* タイトル */}
          <h3
            className={`text-xl font-bold mb-2 ${
              memo.isDone
                ? "line-through text-gray-500 dark:text-gray-400"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            <Link
              to={`/memo/${memo._id}`} // 詳細ページへのリンク
              className="hover:underline text-blue-600 dark:text-blue-400 block"
            >
              {memo.title}
            </Link>
          </h3>

          {/* カテゴリ表示 */}
          {memo.category && (
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">
              カテゴリ: {memo.category}
            </p>
          )}

          {/* メモ内容 */}
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {memo.content}
          </p>

          {/* 完了ステータス */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            完了: {memo.isDone ? "✅" : "❌"}
          </p>

          {/* 作成日 */}
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            作成日: {new Date(memo.createdAt).toLocaleString()}
          </p>

          {/* 添付ファイル一覧 */}
          {memo.attachments && memo.attachments.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                添付ファイル
              </h4>
              <div className="flex flex-wrap gap-3">
                {memo.attachments.map((file) => (
                  <div key={file._id} className="relative">
                    {/* 画像ファイル */}
                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-20 h-20 object-cover rounded cursor-pointer border border-gray-300"
                        onClick={() => window.open(file.url, "_blank")}
                      />
                    ) : file.type === "application/pdf" ? (
                      // PDFファイルはモーダルで表示
                      <button
                        onClick={() => openPdfModal(file.url)}
                        className="w-20 h-20 flex items-center justify-center bg-gray-300 rounded cursor-pointer text-sm
                                   border border-gray-300 dark:bg-gray-700 dark:text-gray-300"
                      >
                        PDF
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作ボタン群 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => startEditing(memo)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm
                         transition-colors duration-300"
            >
              編集
            </button>
            <button
              onClick={() => confirmDelete(memo._id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm
                         transition-colors duration-300"
            >
              削除
            </button>
            <button
              onClick={() => handleToggleDone(memo)}
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors duration-300 ${
                memo.isDone
                  ? "bg-yellow-500 hover:bg-yellow-600 text-gray-800"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {memo.isDone ? "未完了にする" : "完了にする"}
            </button>
            <button
              onClick={() => handleTogglePin(memo)}
              className={`text-yellow-500 font-bold transition-opacity duration-200 ${
                memo.isPinned ? "opacity-100" : "opacity-40 hover:opacity-70"
              }`}
              aria-label={memo.isPinned ? "ピン留め解除" : "ピン留め"}
            >
              📌
            </button>
          </div>
        </div>
      )}

      {/* PDFプレビューモーダル */}
      {showPdfModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={closePdfModal} // モーダル外クリックで閉じる
        >
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            className="w-11/12 h-5/6 bg-white rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default MemoCard;
