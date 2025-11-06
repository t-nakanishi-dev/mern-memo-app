// client/src/pages/PasswordResetRequest.jsx
import React, { useState } from "react";
import { passwordResetRequest } from "../api"; // api.js に追加予定
// ※ この関数が未作成の場合は、バックエンドのエンドポイントに合わせて作成する必要があります。

const PasswordResetRequest = () => {
  // 入力フォーム用 state
  const [email, setEmail] = useState(""); // 入力されたメールアドレス
  const [message, setMessage] = useState(null); // 成功メッセージ
  const [error, setError] = useState(null); // エラーメッセージ
  const [loading, setLoading] = useState(false); // ローディング状態

  /**
   * パスワードリセットリンク送信処理
   * - 入力されたメールアドレスをサーバーへ送信
   * - 成功時: メール送信完了メッセージを表示
   * - 失敗時: サーバーからのエラーメッセージ or デフォルトエラーメッセージを表示
   * - ネットワークエラーの場合も考慮
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      // API呼び出し
      const res = await passwordResetRequest(email);

      if (res.ok) {
        // 成功時 → サーバーがリセット用メールを送信
        setMessage(
          "パスワードリセット用のリンクを送信しました。メールをご確認ください。"
        );
      } else {
        // サーバーエラーの場合（例: 登録されていないメールなど）
        const data = await res.json();
        setError(data.message || "エラーが発生しました。");
      }
    } catch (err) {
      // 通信エラー
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">パスワードリセット</h2>

      {/* 成功・エラーメッセージの表示 */}
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* メールアドレス入力フォーム */}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-4 py-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "送信中..." : "リセットリンクを送る"}
        </button>
      </form>
    </div>
  );
};

export default PasswordResetRequest;
