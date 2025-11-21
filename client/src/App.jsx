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
import TrashMemoList from "./components/TrashMemoList";
import Layout from "./components/Layout"; // ← ここを追加！

// 認証不要ページ用シンプルレイアウト
const GuestLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md">{children}</div>

      {/* フッター（小さく） */}
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
          {/* ログイン後ページ：ヘッダーあり */}
          <Route
            path="/*"
            element={
              <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
                <Routes>
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
                </Routes>
              </Layout>
            }
          />

          {/* ログイン・登録系：ヘッダーなし */}
          <Route
            path="/login"
            element={
              <GuestLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                <Login />
              </GuestLayout>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                <Signup />
              </GuestLayout>
            }
          />
          <Route
            path="/password-reset-request"
            element={
              <GuestLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                <PasswordResetRequest />
              </GuestLayout>
            }
          />
          <Route
            path="/password-reset"
            element={
              <GuestLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                <PasswordReset />
              </GuestLayout>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
