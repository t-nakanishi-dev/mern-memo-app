// client/src/components/MemoDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Trash2,
  Pin,
  PinOff,
  Edit3,
  FileText,
  X,
  Upload,
} from "lucide-react";

import { apiFetch } from "../apiFetch"; // ← これ必須！
import { uploadFile } from "../hooks/utils/uploadFile";

const MemoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [memo, setMemo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [currentFiles, setCurrentFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const cacheBuster = () => Date.now();

  useEffect(() => {
    fetchMemo();
  }, [id]);

  const fetchMemo = async () => {
    try {
      const res = await apiFetch(`/api/memos/${id}`);
      if (!res) return;

      const data = await res.json();
      if (res.ok) {
        setMemo(data);
        setEditedTitle(data.title || "");
        setEditedContent(data.content || "");
        setEditedCategory(data.category || "");
        setExistingAttachments(data.attachments || []);
      } else {
        toast.error("メモの取得に失敗しました");
      }
    } catch (err) {
      toast.error("通信エラー");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setCurrentFiles((prev) => [...prev, ...files]);

    const previews = files.map((file) => ({
      type: file.type.startsWith("image/") ? "image" : "pdf",
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      name: file.name,
    }));
    setFilePreviews((prev) => [...prev, ...previews]);
  };

  const removeNewFile = (index) => {
    setCurrentFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (fileId) => {
    setExistingAttachments((prev) => prev.filter((f) => f._id !== fileId));
  };

  const handleUpdate = async () => {
    if (!editedTitle.trim()) return toast.error("タイトルを入力してください");

    try {
      setUploading(true);

      const newAttachments =
        currentFiles.length > 0
          ? await Promise.all(
              currentFiles.map(async (file) => {
                const url = await uploadFile(file, "memos");
                return { url, name: file.name, type: file.type };
              })
            )
          : [];

      const finalAttachments = [
        ...existingAttachments.map((f) => ({
          _id: f._id,
          url: f.url,
          name: f.name,
          type: f.type,
        })),
        ...newAttachments,
      ];

      const res = await apiFetch(`/api/memos/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
          category: editedCategory,
          attachments: finalAttachments,
        }),
      });

      if (!res) return;

      if (res.ok) {
        const updated = await res.json();
        setMemo(updated);
        setIsEditing(false);
        setCurrentFiles([]);
        setFilePreviews([]);
        setExistingAttachments(updated.attachments || []);
        toast.success("メモを更新しました！");
      } else {
        const error = await res.json();
        toast.error(error.message || "更新に失敗");
      }
    } catch (err) {
      toast.error("更新中にエラーが発生");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("本当に削除しますか？")) return;
    const res = await apiFetch(`/api/memos/${id}`, { method: "DELETE" });
    if (res && res.ok) {
      toast.success("メモを削除しました");
    } else {
      toast.error("削除に失敗");
    }
  };

  const togglePin = async () => {
    const res = await apiFetch(`/api/memos/${id}/pin`, { method: "PATCH" });
    if (res && res.ok) {
      const updated = await res.json();
      setMemo(updated);
      toast.success(
        updated.isPinned ? "ピン留めしました" : "ピン留めを解除しました"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!memo) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-lg">戻る</span>
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={togglePin}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition"
              >
                {memo.isPinned ? (
                  <PinOff className="w-6 h-6" />
                ) : (
                  <Pin className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={handleDelete}
                className="p-3 bg-red-500/30 hover:bg-red-500/50 rounded-full backdrop-blur-sm transition"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-10">
          {isEditing ? (
            <div className="space-y-8">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder-gray-400"
                placeholder="タイトルを入力..."
              />

              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={15}
                className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-6 py-5 text-lg resize-none focus:ring-4 focus:ring-blue-500/50"
                placeholder="内容をMarkdownで..."
              />

              <select
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
                className="w-full max-w-xs px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-lg"
              >
                <option value="">カテゴリを選択</option>
                <option value="仕事">仕事</option>
                <option value="日記">日記</option>
                <option value="買い物">買い物</option>
                <option value="アイデア">アイデア</option>
                <option value="その他">その他</option>
              </select>

              {/* 既存ファイル */}
              {existingAttachments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">
                    現在の添付ファイル（クリックで削除）
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {existingAttachments.map((file) => (
                      <div key={file._id} className="relative group">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={`${file.url}?t=${cacheBuster()}`}
                            alt={file.name}
                            className="w-24 h-24 object-cover rounded-lg shadow-md"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-lg flex flex-col items-center justify-center">
                            <FileText className="w-10 h-10 text-red-600" />
                            <span className="text-xs mt-1">PDF</span>
                          </div>
                        )}
                        <button
                          onClick={() => removeExistingFile(file._id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs mt-1 truncate w-24">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 新規ファイル追加 */}
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 px-6 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition"
                >
                  <Upload className="w-6 h-6" />
                  新しい画像・PDFを追加
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* 新規プレビュー */}
              {filePreviews.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {filePreviews.map((preview, i) => (
                    <div key={i} className="relative group">
                      {preview.type === "image" ? (
                        <img
                          src={preview.url}
                          alt="preview"
                          className="w-24 h-24 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-lg flex flex-col items-center justify-center">
                          <FileText className="w-10 h-10 text-red-600" />
                          <span className="text-xs mt-1">PDF</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeNewFile(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleUpdate}
                disabled={uploading}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-xl disabled:opacity-50"
              >
                <Save className="w-6 h-6" />
                {uploading ? "更新中..." : "更新する"}
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-6">
                {memo.title || "無題のメモ"}
              </h1>
              {memo.category && (
                <span className="inline-block px-5 py-2 text-lg font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 mb-8">
                  {memo.category}
                </span>
              )}
              <div className="prose prose-lg max-w-none dark:prose-invert mb-10">
                <ReactMarkdown>
                  {memo.content || "内容がありません"}
                </ReactMarkdown>
              </div>

              {memo.attachments?.length > 0 && (
                <div className="mt-12 p-8 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <h3 className="text-2xl font-bold mb-6">添付ファイル</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {memo.attachments.map((file) => (
                      <a
                        key={file._id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        {file.type.startsWith("image/") ? (
                          <img
                            src={`${file.url}?t=${cacheBuster()}`}
                            alt={file.name}
                            className="w-full h-48 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/50 rounded-xl flex flex-col items-center justify-center gap-3 group-hover:scale-105 transition-transform shadow-lg">
                            <FileText className="w-16 h-16 text-red-600" />
                            <span className="text-sm font-medium">PDF</span>
                          </div>
                        )}
                        <p className="mt-2 text-sm text-center truncate">
                          {file.name}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsEditing(true)}
                className="mt-12 flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-xl"
              >
                <Edit3 className="w-6 h-6" />
                このメモを編集
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoDetail;
