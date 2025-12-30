// src/components/Layout.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Layout = ({ children, darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("email") || "ユーザー";

  const handleLogout = async () => {
    try {
      // サーバー側で access / refresh を両方削除
      await fetch(`${process.env.REACT_APP_API_URL}/api/logout`, {
        method: "POST",
        credentials: "include", // ← Cookie を送るため必須
      });
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }

    // クライアント側のデータも削除
    localStorage.removeItem("email");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              Memo App
            </Link>

            <div className="flex items-center space-x-4">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2">
                {darkMode ? "☀️" : "🌙"}
              </button>

              <Link
                to="/profile"
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition"
              >
                {userEmail}
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
