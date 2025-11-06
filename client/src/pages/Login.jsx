// client/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ページ遷移用のフック
import { login } from "../api"; // ログインAPI通信関数

const Login = () => {
  const navigate = useNavigate(); // ページ遷移を制御するためのフック

  // 入力フォームの状態管理
  const [email, setEmail] = useState(""); // ユーザーが入力するメールアドレス
  const [password, setPassword] = useState(""); // ユーザーが入力するパスワード
  const [error, setError] = useState(null); // エラーメッセージを保持
  const [loading, setLoading] = useState(false); // ログイン中のローディング状態

  // フォーム送信時の処理
  const handleSubmit = async (e) => {
    e.preventDefault(); // ページリロードを防止
    setError(null); // 前回のエラーをリセット
    setLoading(true); // ローディング開始

    try {
      // API呼び出し
      const response = await login(email, password);
      const data = await response.json();

      if (response.ok) {
        // ✅ ログイン成功
        // JWTトークンとメールアドレスをローカルストレージに保存
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);

        // ホーム画面に遷移
        navigate("/");
      } else {
        // ❌ ログイン失敗（認証エラーなど）
        setError(data.message || "ログインに失敗しました。");
      }
    } catch (err) {
      // ネットワークエラー（サーバーダウンなど）
      setError("ネットワークエラーが発生しました。");
    } finally {
      // ✅ 成否に関わらずローディング終了
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-colors duration-300">
        {/* タイトル */}
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Log In
        </h2>

        {/* ログインフォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* エラーメッセージ表示 */}
          {error && <p className="text-red-500 text-center">{error}</p>}

          {/* メールアドレス入力 */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-300"
          />

          {/* パスワード入力 */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-300"
          />

          {/* ログインボタン */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md 
                       transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading} // ローディング中はボタンを無効化
          >
            {loading ? "ログイン中..." : "Log In"}
          </button>
        </form>

        {/* 補助リンク（新規登録・パスワードリセット） */}
        <div className="text-sm text-center text-gray-600 dark:text-gray-300 mt-4 transition-colors duration-300">
          <p>
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-indigo-600 hover:underline">
              Sign Up
            </a>
          </p>
          <p className="mt-2">
            パスワードを忘れましたか？{" "}
            <a
              href="/password-reset-request"
              className="text-indigo-600 hover:underline"
            >
              パスワードをリセットする
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
