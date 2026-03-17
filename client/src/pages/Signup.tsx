// client/src/pages/Signup.tsx
import React, { useState, SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api";
import type { AuthResponse } from "@/types/api";

const Signup: React.FC = () => {
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
      const data = await signup(email, password); // ← AuthResponse が返る

      // 成功時はリダイレクト（signup が成功レスポンスを返す前提）
      // ※ サーバー側が成功時に 200 + JSON を返す場合
      navigate("/login");
    } catch (err: unknown) {
      // エラー時はメッセージを抽出
      let message = "サインアップに失敗しました。";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }
      console.error("Signup error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-colors duration-300">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-300"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-300"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "登録中..." : "Sign Up"}
          </button>
        </form>

        <div className="text-sm text-center text-gray-600 dark:text-gray-300 mt-4 transition-colors duration-300">
          <p>
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 hover:underline">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
