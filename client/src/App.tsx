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

// ゲスト用シンプルレイアウト（ログイン・登録画面用）
const GuestLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
    <div className="w-full max-w-md">{children}</div>
    <div className="absolute bottom-6 text-center text-xs text-gray-500 dark:text-gray-600">
      © 2025 | Built with MERN Stack
    </div>
  </div>
);

function App() {
  const theme = useThemeStore((state) => state.theme);

  // テーマ変更時に class を更新（persistのonRehydrateStorageで初回は処理済み）
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-300">
        <Routes>
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
                <Layout>
                  {" "}
                  {/* props不要に！ */}
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
}

export default App;
