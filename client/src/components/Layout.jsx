// client/src/components/Layout.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

const Layout = ({ children, darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem("token"); // これだけで認証解除！
    navigate("/login", { replace: true }); // ログイン画面にリダイレクト
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1
            className="text-2xl font-bold text-gray-800 dark:text-white cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            メモアプリ
          </h1>

          <div className="flex items-center gap-4">
            {/* ダークモードトグル */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="ダークモード切り替え"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            {/* ログアウトボタン */}
            <button
              onClick={handleLogout}
              className="px-5 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-8 mt-16 border-t border-gray-200 dark:border-gray-700">
        © 2025 | Built with MERN Stack + Tailwind CSS
      </footer>
    </div>
  );
};

export default Layout;
