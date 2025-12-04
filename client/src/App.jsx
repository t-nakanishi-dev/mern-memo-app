// src/App.jsx
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
import TrashMemoList from "./components/TrashMemoList";
import Layout from "./components/Layout";

// ゲスト用シンプルレイアウト（ログイン・登録画面用）
const GuestLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md">{children}</div>
      <div className="absolute bottom-6 text-center text-xs text-gray-500 dark:text-gray-600">
        © 2025 | Built with MERN Stack
      </div>
    </div>
  );
};

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return (
      typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-300">
        <Routes>
          {/* 認証不要ページ */}
          <Route
            path="/login"
            element={
              <GuestLayout>
                <Login />
              </GuestLayout>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestLayout>
                <Signup />
              </GuestLayout>
            }
          />
          <Route
            path="/password-reset-request"
            element={
              <GuestLayout>
                <PasswordResetRequest />
              </GuestLayout>
            }
          />
          <Route
            path="/password-reset"
            element={
              <GuestLayout>
                <PasswordReset />
              </GuestLayout>
            }
          />

          {/* 認証必要ページ：一括でProtectedRoute + Layoutで囲む */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
                  <Routes>
                    <Route path="/" element={<MemoList />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/memo/:id" element={<MemoDetailPage />} />
                    <Route path="/trash" element={<TrashMemoList />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
