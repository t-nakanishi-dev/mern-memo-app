// client/src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { apiFetch } from "../apiFetch";

interface AuthCheckResponse {
  authenticated: boolean;
}

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiFetch<AuthCheckResponse>("/api/check");
        console.log("🔍 auth check:", res);
        setIsAuthenticated(res.authenticated ?? false);
      } catch (err) {
        console.error("認証チェックエラー:", err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // 🔄 認証判定中（ローディング）
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // ❌ 未認証 → ログインへ
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ 認証済み → 子ルート表示
  return <Outlet />;
};

export default ProtectedRoute;
