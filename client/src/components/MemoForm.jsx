// src/components/MemoForm.jsx
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { uploadFile } from "../hooks/utils/uploadFile";
import { Plus, X, Image, FileText, Loader2, Send } from "lucide-react";

const MemoForm = ({ loading, onCreate }) => {
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [files, setFiles] = useState([]); // ← ここにFileオブジェクトをそのまま保持
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const newPreviews = [];
    selectedFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push({
            type: "image",
            src: reader.result,
            name: file.name,
            file, // ← ここで元のFileオブジェクトを保持
          });
          if (newPreviews.length === selectedFiles.length) {
            setFiles(selectedFiles); // ← 元のFileオブジェクトをそのまま保存
            setPreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        newPreviews.push({ type: "pdf", name: file.name, file });
        setFiles(selectedFiles);
        setPreviews((prev) => [...prev, ...newPreviews]);
      } else {
        toast.error(`「${file.name}」は画像またはPDFのみ対応しています`);
      }
    });
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!newTitle.trim()) return toast.error("タイトルを入力してください");
    if (!newContent.trim()) return toast.error("内容を入力してください");
    if (!newCategory) return toast.error("カテゴリを選択してください");

    try {
      setUploading(true);

      // files は元のFileオブジェクトの配列 → そのままuploadFileに渡せる！
      const fileUrls =
        files.length > 0
          ? await Promise.all(files.map((file) => uploadFile(file)))
          : [];

      const attachments = fileUrls.map((url, i) => ({
        url,
        name: files[i].name,
        type: files[i].type,
      }));

      await onCreate(newTitle, newContent, newCategory, attachments);

      // 成功したらリセット
      setNewTitle("");
      setNewContent("");
      setNewCategory("");
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error("メモ作成エラー:", err);
      toast.error("メモの作成に失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const isDisabled = loading || uploading;

  return (
    <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <Plus className="w-8 h-8" />
          新しいメモを作成
        </h3>
        <p className="text-blue-100 mt-1">あなたのアイデアを形にしましょう</p>
      </div>

      <div className="p-7 space-y-6">
        <input
          type="text"
          placeholder="メモのタイトル..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={isDisabled}
          className="w-full text-2xl font-semibold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white"
        />

        <textarea
          placeholder="内容を入力...（Markdownも使えます）"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          disabled={isDisabled}
          rows={6}
          className="w-full bg-gray-50 dark:bg-gray-700/50 border text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 text-base resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500 dark:placeholder-gray-400"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={isDisabled}
            className="flex-1 px-5 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300"
          >
            <option value="">カテゴリを選択</option>
            <option value="仕事">仕事</option>
            <option value="日記">日記</option>
            <option value="買い物">買い物</option>
            <option value="アイデア">アイデア</option>
            <option value="その他">その他</option>
          </select>

          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileChange}
              disabled={isDisabled}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all font-medium text-gray-700 dark:text-gray-300">
              <Image className="w-5 h-5" />
              画像・PDFを追加
            </div>
          </label>
        </div>

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            {previews.map((p, i) => (
              <div key={i} className="relative group">
                {p.type === "image" ? (
                  <img
                    src={p.src}
                    alt={p.name}
                    className="w-24 h-24 object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-lg flex flex-col items-center justify-center gap-2">
                    <FileText className="w-10 h-10 text-red-600 dark:text-red-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      PDF
                    </span>
                  </div>
                )}
                <button
                  onClick={() => handleRemoveFile(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate w-24">
                  {p.name}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 disabled:scale-100 shadow-xl"
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              アップロード中...
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              メモを作成する
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MemoForm;
