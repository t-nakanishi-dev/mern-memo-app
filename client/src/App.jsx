// client/src/App.jsx

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MemoList from "./components/MemoList";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import PasswordResetRequest from "./pages/PasswordResetRequest";
import PasswordReset from "./pages/PasswordReset";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/Profile";
import MemoDetailPage from "./pages/MemoDetailPage";
import Layout from "./components/Layout"; // 共通レイアウト
import TrashMemoList from "./components/TrashMemoList";

const App = () => {
  // ダークモード状態の管理
  // 初期値は localStorage から取得。存在しなければ false（ライトモード）を設定
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  // dark クラスの付与 / 削除と localStorage 保存
  useEffect(() => {
    const html = window.document.documentElement;
    if (darkMode) {
      html.classList.add("dark"); // Tailwind CSS の dark モード用クラス
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* ダークモード切り替えボタン */}
        <div className="p-4 text-right">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 border rounded bg-gray-200 dark:bg-gray-700"
          >
            {darkMode ? "ライトモードへ" : "ダークモードへ"}
          </button>
        </div>

        {/* 共通レイアウトでヘッダー・フッターなどをまとめる */}
        <Layout>
          <Routes>
            {/* ログイン必須ルート（ProtectedRoute でガード） */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MemoList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/memo/:id"
              element={
                <ProtectedRoute>
                  <MemoDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trash"
              element={
                <ProtectedRoute>
                  <TrashMemoList />
                </ProtectedRoute>
              }
            />

            {/* 認証不要ページ（ログイン前でもアクセス可能） */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/password-reset-request"
              element={<PasswordResetRequest />}
            />
            <Route path="/password-reset" element={<PasswordReset />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
};

export default App;
