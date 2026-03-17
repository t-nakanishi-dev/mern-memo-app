// client/src/pages/Login.tsx
import React, { useState, SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import Cookies from "js-cookie";
import type { AuthResponse } from "@/types/api"; // 既存の型をインポート

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("🚀 login start");

      const data = await login(email, password) as AuthResponse & {
        success?: boolean;
        token?: string;
        email?: string;
        message?: string;
      };

      console.log("✅ login response:", data);

      if (data.success) {
        // ログイン成功時の処理（Cookie版）
        Cookies.set("accessToken", data.token!, {
          expires: 7,
          path: "/",
          sameSite: "lax",
        });
        localStorage.setItem("email", data.email!);

        navigate("/");
      } else {
        setError(data.message || "ログインに失敗しました。");
      }
    } catch (err: unknown) {
      console.error("LOGIN ERROR:", err);
      const message = err instanceof Error ? err.message : "ネットワークエラーが発生しました。";
      setError(message);
    } finally {
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
            disabled={loading}
          >
            {loading ? "ログイン中..." : "Log In"}
          </button>
        </form>

        {/* 補助リンク */}
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