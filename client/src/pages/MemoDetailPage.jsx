// client/src/pages/MemoDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMemo } from "../api";
import MemoDetail from "../components/MemoDetail";

const MemoDetailPage = () => {
  // URLパラメータからメモIDを取得（例: /memo/123 → id = 123）
  const { id } = useParams();

  // ページ遷移用フック
  const navigate = useNavigate();

  // メモの詳細データを保持
  const [memo, setMemo] = useState(null);

  // エラーメッセージを保持
  const [error, setError] = useState(null);

  // コンポーネントがマウントされたとき or id/token が変化したときに実行
  useEffect(() => {
    const getMemo = async () => {
      try {
        // ✅ apiFetch は JSON を返す
        const data = await fetchMemo(id);
        setMemo(data);
        const res = await fetchMemo(id);
        console.log("🔍 memo detail res:", res);
      } catch (err) {
        setError(err.message || "メモの取得に失敗しました。");
        setTimeout(() => navigate("/"), 2000);
      }
    };

    getMemo();
  }, [id, navigate]);

  console.log("🧠 memo state:", memo);

  // エラーがある場合の表示
  if (error) {
    return (
      <div className="text-red-500 text-center mt-6 bg-white dark:bg-gray-900 p-4 rounded-md">
        <p>{error}</p>
        <p>2秒後にメモ一覧へ戻ります...</p>
      </div>
    );
  }

  // メモデータがまだ取得できていない場合の読み込み中表示
  if (!memo) {
    return (
      <p className="text-center mt-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 rounded-md">
        読み込み中...
      </p>
    );
  }

  // 正常時: メモ詳細を表示
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 rounded-md shadow-md">
      {/* メモ詳細表示用コンポーネント */}
      <MemoDetail memo={memo} />
      <div className="text-center mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate("/")}
        >
          メモ一覧に戻る
        </button>
      </div>
    </div>
  );
};

export default MemoDetailPage;
