// src/components/MemoForm.jsx
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { uploadFile } from "../hooks/utils/uploadFile";

/**
 * MemoForm コンポーネント
 * - 新しいメモを作成するフォーム
 * - タイトル・内容・カテゴリを入力可能
 * - 画像 / PDF ファイルをアップロード可能
 * - 入力内容は `onCreate` を通じて親に渡す
 *
 * Props:
 *  - token: ユーザーの認証トークン（未ログイン時はフォーム無効）
 *  - loading: 親側でAPI通信中かどうか（trueのとき操作不可）
 *  - onCreate: メモ作成時に呼び出すコールバック関数
 */
const MemoForm = ({ token, loading, onCreate }) => {
  // フォームの入力値を管理
  const [newTitle, setNewTitle] = useState(""); // メモタイトル
  const [newContent, setNewContent] = useState(""); // 本文
  const [newCategory, setNewCategory] = useState(""); // カテゴリ
  const [files, setFiles] = useState([]); // 選択されたファイル（実体）
  const [previews, setPreviews] = useState([]); // プレビュー用データ
  const [uploading, setUploading] = useState(false); // アップロード中フラグ

  /**
   * ファイル選択時の処理
   * - 画像 → FileReader で base64 プレビューを生成
   * - PDF → プレビューはファイル名表示
   * - その他の形式はエラー
   */
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const newPreviews = [];
    selectedFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push({
            type: "image",
            src: reader.result, // base64形式
            name: file.name,
          });
          if (newPreviews.length === selectedFiles.length)
            setPreviews(newPreviews);
        };
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        newPreviews.push({ type: "pdf", name: file.name });
        if (newPreviews.length === selectedFiles.length)
          setPreviews(newPreviews);
      } else {
        toast.error("対応していないファイル形式が含まれています。");
      }
    });
  };

  /** プレビューからファイル削除 */
  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  /**
   * フォーム送信処理
   * - バリデーション（ログイン必須、必須項目チェック）
   * - ファイルがあればアップロードしてURL取得
   * - onCreate を実行して親に渡す
   * - 成功後はフォームリセット
   */
  const handleSubmit = async () => {
    if (!token) {
      toast.error("ログインが必要です。");
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("タイトルと内容を入力してください。");
      return;
    }
    if (!newCategory) {
      toast.error("カテゴリを選択してください。");
      return;
    }

    try {
      setUploading(true);

      // ファイルアップロード（utils/uploadFileを使用）
      const fileUrls = await Promise.all(files.map((file) => uploadFile(file)));

      // アップロード結果をattachmentsとして整形
      const attachments = fileUrls.map((url, idx) => ({
        url,
        name: files[idx].name,
        type: files[idx].type,
      }));

      // 親にメモ作成を依頼
      await onCreate(newTitle, newContent, newCategory, attachments);

      // 入力リセット
      setNewTitle("");
      setNewContent("");
      setNewCategory("");
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error(err);
      toast.error("ファイルのアップロードまたはメモ作成に失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">
        📌 新しいメモを作成
      </h3>

      {/* タイトル入力 */}
      <input
        type="text"
        placeholder="タイトル"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        disabled={!token || loading || uploading}
        className="w-full px-4 py-2 mb-3 border rounded-md"
      />

      {/* 本文入力 */}
      <textarea
        placeholder="内容"
        value={newContent}
        onChange={(e) => setNewContent(e.target.value)}
        disabled={!token || loading || uploading}
        className="w-full px-4 py-2 mb-4 h-32 resize-y border rounded-md"
      />

      {/* カテゴリ選択 */}
      <select
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        disabled={!token || loading || uploading}
        className="w-full px-4 py-2 mb-4 border rounded-md"
      >
        <option value="">カテゴリを選択</option>
        <option value="仕事">仕事</option>
        <option value="日記">日記</option>
        <option value="買い物">買い物</option>
        <option value="アイデア">アイデア</option>
        <option value="その他">その他</option>
      </select>

      {/* ファイル選択 */}
      <input
        type="file"
        accept="image/*,application/pdf"
        multiple
        onChange={handleFileChange}
        disabled={!token || loading || uploading}
        className="mb-4"
      />

      {/* プレビュー表示 */}
      <div className="flex flex-wrap gap-4 mb-4">
        {previews.map((p, i) => (
          <div key={i} className="relative">
            {p.type === "image" ? (
              <img
                src={p.src}
                alt={p.name}
                className="w-20 h-20 object-cover rounded"
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                PDF
              </div>
            )}
            {/* プレビュー削除ボタン */}
            <button
              onClick={() => handleRemoveFile(i)}
              type="button"
              className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 作成ボタン */}
      <button
        onClick={handleSubmit}
        disabled={!token || loading || uploading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
      >
        {uploading ? "アップロード中..." : "作成"}
      </button>
    </div>
  );
};

export default MemoForm;
