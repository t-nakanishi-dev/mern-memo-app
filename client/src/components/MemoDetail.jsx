// client/src/components/MemoDetail.jsx

import React from "react";
import ReactMarkdown from "react-markdown";

/**
 * MemoDetail コンポーネント
 * 1件のメモ詳細を表示する役割
 * - タイトルを大きく表示
 * - 内容は Markdown としてレンダリング（見出し、リスト、リンクなど対応）
 * - ダークモード対応のデザイン
 */
const MemoDetail = ({ memo }) => {
  return (
    <div
      className="max-w-xl mx-auto p-4 bg-white dark:bg-gray-900 
                 rounded shadow text-gray-900 dark:text-gray-100"
    >
      {/* メモのタイトル */}
      <h2 className="text-2xl font-bold mb-4">{memo.title}</h2>

      {/* メモの内容（Markdown対応） */}
      <div className="prose max-w-none dark:prose-invert">
        {/* ReactMarkdown により本文をMarkdownとしてレンダリング */}
        <ReactMarkdown>{memo.content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default MemoDetail;
