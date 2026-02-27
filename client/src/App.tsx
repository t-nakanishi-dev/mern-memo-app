// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

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
import { useThemeStore } from "./store/themeStore";

interface GuestLayoutProps {
  children: React.ReactNode;
}

const GuestLayout = ({ children }: GuestLayoutProps) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
    <div className="w-full max-w-md">{children}</div>
    <div className="absolute bottom-6 text-center text-xs text-gray-500 dark:text-gray-600">
      © 2025 | Built with MERN Stack
    </div>
  </div>
);

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-300">
        <Routes>
          {/* ゲスト用ルート */}
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

          {/* 認証が必要なルート全体 */}
          <Route element={<ProtectedRoute />}>
            {/* Layout で囲むルート */}
            <Route element={<Layout />}>
              <Route path="/" element={<MemoList />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/memo/:id" element={<MemoDetailPage />} />
              <Route path="/trash" element={<TrashMemoList />} />

              {/* 404フォールバック（推奨） */}
              <Route
                path="*"
                element={
                  <div className="text-center py-20">
                    404 - ページが見つかりません
                  </div>
                }
              />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
