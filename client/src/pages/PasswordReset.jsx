// client/src/pages/PasswordReset.jsx
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { passwordReset } from "../api"; // api.js に追加予定の関数

const PasswordReset = () => {
  // URL のクエリパラメータからリセット用トークンを取得 (?token=xxxxx)
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // ページ遷移用
  const navigate = useNavigate();

  // 入力フォーム用の state
  const [newPassword, setNewPassword] = useState(""); // 新しいパスワード
  const [confirmPassword, setConfirmPassword] = useState(""); // 確認用パスワード

  // フィードバックメッセージ
  const [error, setError] = useState(null); // エラーメッセージ
  const [message, setMessage] = useState(null); // 成功メッセージ

  // ローディング状態
  const [loading, setLoading] = useState(false);

  /**
   * パスワードリセット処理
   * - 新しいパスワードと確認用が一致しているかチェック
   * - API にトークンと新しいパスワードを送信
   * - 成功時はメッセージを表示し、3秒後にログインページへ遷移
   * - 失敗時はエラーメッセージを表示
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // パスワード一致チェック
    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    setLoading(true);

    try {
      // API呼び出し（token と newPassword を渡す）
      const res = await passwordReset(token, newPassword);

      if (res.ok) {
        // 成功時
        setMessage("パスワードがリセットされました。ログインしてください。");
        setTimeout(() => {
          navigate("/login"); // 3秒後にログインページへ
        }, 3000);
      } else {
        // サーバーから返却されたエラーメッセージを取得
        const data = await res.json();
        setError(data.message || "リセットに失敗しました。");
      }
    } catch (err) {
      // ネットワークエラーなど
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  // トークンがない場合（不正なリンクなど）
  if (!token) {
    return (
      <p className="text-center mt-20 text-red-600">
        無効なURLです。パスワードリセットリンクを確認してください。
      </p>
    );
  }

  // 通常の表示
  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">新しいパスワードを設定</h2>

      {/* 成功 or エラーメッセージ */}
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="新しいパスワード"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full mb-4 px-4 py-2 border rounded"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="パスワード確認"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full mb-4 px-4 py-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "送信中..." : "パスワードをリセットする"}
        </button>
      </form>
    </div>
  );
};

export default PasswordReset;
