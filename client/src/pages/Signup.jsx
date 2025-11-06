// client/src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api"; // api.jsからsignup関数をインポート

const Signup = () => {
  const navigate = useNavigate();

  // 入力フォームの状態管理
  const [email, setEmail] = useState(""); // 入力されたメールアドレス
  const [password, setPassword] = useState(""); // 入力されたパスワード
  const [error, setError] = useState(null); // エラーメッセージ
  const [loading, setLoading] = useState(false); // ローディング状態（API通信中）

  /**
   * サインアップ処理
   * - 入力された email と password をサーバーに送信
   * - 成功時: ログインページへリダイレクト
   * - 失敗時: サーバーからのエラーメッセージ or デフォルトエラーを表示
   * - ネットワークエラーにも対応
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // 前回のエラーをクリア
    setLoading(true); // ローディング開始

    try {
      // api.js に定義した signup 関数を呼び出し
      const response = await signup(email, password);

      // サーバーから返ってきたレスポンスを JSON に変換
      const data = await response.json();

      if (response.ok) {
        // サインアップ成功
        console.log("Signup successful:", data);
        navigate("/login"); // ログインページへ遷移
      } else {
        // サインアップ失敗（例: 既に登録済みメールなど）
        console.error("Signup failed:", data);
        setError(data.message || "サインアップに失敗しました。");
      }
    } catch (err) {
      // ネットワークエラーや予期しないエラー
      console.error("Network error during signup:", err);
      setError("ネットワークエラーが発生しました。");
    } finally {
      // 通信終了 → ローディング解除
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Sign Up
        </h2>

        {/* サインアップフォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* エラーメッセージ */}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* メール入力 */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* パスワード入力 */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* 送信ボタン */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "登録中..." : "Sign Up"}
          </button>
        </form>

        {/* ログインページへのリンク */}
        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
