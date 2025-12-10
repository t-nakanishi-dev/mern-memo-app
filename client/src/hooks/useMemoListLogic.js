// src/hooks/useMemoListLogic.js

// カスタムフック: メモ一覧を取得し、状態管理を行う
import { useCallback, useEffect, useState } from "react";
import { fetchMemos } from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export const useMemoListLogic = (page, limit) => {
  // 🔹 メモ一覧のデータを保持
  const [memos, setMemos] = useState([]);

  // 🔹 総メモ数（ページネーションで使用）
  const [total, setTotal] = useState(0);

  // 🔹 エラーメッセージ
  const [error, setError] = useState(null);

  // 🔹 ローディング状態（true の間は読み込み中）
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /**
   * 🔸 メモ一覧を API から取得する関数
   * - 認証エラーが発生した場合はログイン画面へリダイレクト
   * - 成功時：メモ一覧と総数を state に保存
   * - 失敗時：エラーを state にセットし、toast 表示
   */
  const loadMemos = useCallback(async () => {
    // トークンがない場合はログイン画面へ

    setLoading(true); // ローディング開始
    setError(null); // エラーリセット

    try {
      // API からメモを取得
      const response = await fetchMemos(page, limit);

      // それ以外の HTTP エラー処理
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 成功した場合：メモ一覧と総件数を state にセット
      const data = await response.json();
      setMemos(data.memos);
      setTotal(data.total);
    } catch (err) {
      console.error("メモ取得エラー:", err);
      setError(err.message || "メモの取得に失敗しました。");
      setMemos([]); // 取得失敗時は一覧を空に
      toast.error(err.message || "メモの取得に失敗しました。");
    } finally {
      setLoading(false); // ローディング終了
    }
  }, [navigate, page, limit]);

  /**
   * 🔸 初回レンダリング時および依存値（ページ・トークンなど）が変わった時にメモを取得
   */
  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  // 🔸 外部に返す state と関数
  return {
    memos, // メモ一覧
    total, // 総メモ数（ページネーション用）
    error, // エラー情報
    loading, // ローディング状態
    loadMemos, // メモ取得関数
    setMemos, // メモ一覧更新関数
    setTotal, // 総件数更新関数
    setError, // エラー更新関数
    setLoading, // ローディング更新関数
  };
};
