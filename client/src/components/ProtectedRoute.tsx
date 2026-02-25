// client/src/components/ProtectedRoute.tsx
import React, { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiFetch } from "../apiFetch";

// ────────────────────────────────────────────────
// レスポンス型の仮定義（実際の /api/check のレスポンスに合わせて後で調整）
interface AuthCheckResponse {
  authenticated: boolean;
  // 必要なら追加: user?: { email: string }; など
}

// ────────────────────────────────────────────────
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
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

  // 認証判定中（ローディング）
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // 未認証 → ログインへリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 認証済み
  return <>{children}</>;
};

export default ProtectedRoute;
