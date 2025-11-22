// client/src/components/MemoCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // テーブル・タスクリスト・打ち消し線などに必要
import {
  Edit3,
  Trash2,
  CheckCircle2,
  Circle,
  Pin,
  PinOff,
  Image as ImageIcon,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";

const MemoCard = ({
  memo,
  confirmDelete,
  handleToggleDone,
  handleTogglePin,
}) => {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  const openPdfModal = (url) => {
    setPdfUrl(url);
    setShowPdfModal(true);
  };

  const isDone = memo.isDone;

  // \n を実際の改行に変換（DBに \\n で保存されてるため）
  const processedContent = memo.content
    ? memo.content.replace(/\\n/g, "\n")
    : "内容がありません";

  return (
    <div className="group relative bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* ピン留め表示 */}
      {memo.isPinned && (
        <div className="absolute top-3 right-3 z-10">
          <Pin
            className="w-6 h-6 text-yellow-500 drop-shadow-lg"
            fill="currentColor"
          />
        </div>
      )}

      <div className="p-6">
        {/* タイトル */}
        <h3 className="text-xl font-bold mb-3">
          <Link
            to={`/memo/${memo._id}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
          >
            <span className={isDone ? "line-through opacity-70" : ""}>
              {memo.title || "無題のメモ"}
            </span>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-70 transition-opacity" />
          </Link>
        </h3>

        {/* カテゴリバッジ */}
        {memo.category && (
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 mb-3">
            {memo.category}
          </span>
        )}

        {/* Markdown で内容を美しく表示 */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                return !inline ? (
                  <code
                    className={`block bg-gray-900 text-white rounded-lg px-4 py-3 overflow-x-auto font-mono text-sm leading-relaxed ${
                      match ? className : "language-text"
                    }`}
                    style={{
                      fontVariantLigatures: "none",
                      letterSpacing: "-0.02em",
                      fontWeight: 400,
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code
                    className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                    style={{
                      fontVariantLigatures: "none",
                      letterSpacing: "-0.02em",
                      fontWeight: 400,
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => <>{children}</>,
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>

        {/* 添付ファイルプレビュー */}
        {memo.attachments && memo.attachments.length > 0 && (
          <div className="mb-5">
            <div className="flex flex-wrap gap-3">
              {memo.attachments.map((file) => (
                <div
                  key={file._id || file.url}
                  className="relative group/item cursor-pointer"
                >
                  {file.type.startsWith("image/") ? (
                    <div className="relative overflow-hidden rounded-lg shadow-md">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-20 h-20 object-cover transition-transform group-hover/item:scale-110 duration-300"
                        onClick={() => window.open(file.url, "_blank")}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : file.type === "application/pdf" ? (
                    <button
                      onClick={() => openPdfModal(file.url)}
                      className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/50 dark:to-pink-900/50 rounded-lg flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform shadow-md"
                    >
                      <FileText className="w-9 h-9 text-red-600 dark:text-red-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        PDF
                      </span>
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* メタ情報 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-5 space-y-1">
          <p>作成: {new Date(memo.createdAt).toLocaleDateString("ja-JP")}</p>
          {memo.updatedAt !== memo.createdAt && (
            <p>更新: {new Date(memo.updatedAt).toLocaleDateString("ja-JP")}</p>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleDone(memo)}
              className={`p-2 rounded-full transition-all ${
                isDone
                  ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/50"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700"
              }`}
              title={isDone ? "未完了にする" : "完了にする"}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => handleTogglePin(memo)}
              className={`p-2 rounded-full transition-all ${
                memo.isPinned
                  ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50"
                  : "bg-gray-100 text-gray-400 hover:text-yellow-600 dark:bg-gray-700"
              }`}
              title={memo.isPinned ? "ピン留め解除" : "ピン留め"}
            >
              {memo.isPinned ? (
                <PinOff className="w-5 h-5" />
              ) : (
                <Pin className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/memo/${memo._id}`}
              className="p-2.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 dark:bg-blue-900/50 transition-all"
              title="編集・詳細"
            >
              <Edit3 className="w-5 h-5" />
            </Link>
            <button
              onClick={() => confirmDelete(memo._id)}
              className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 dark:bg-red-900/50 transition-all"
              title="削除"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* PDFモーダル */}
      {showPdfModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPdfModal(false)}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-5/6 overflow-hidden">
            <button
              onClick={() => setShowPdfModal(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={pdfUrl}
              title="PDF Preview"
              className="w-full h-full rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoCard;
