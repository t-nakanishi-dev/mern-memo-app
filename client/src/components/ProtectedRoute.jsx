// client/src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiFetch } from "../apiFetch";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = 判定中
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 軽量認証チェックエンドポイント
        const res = await apiFetch("/api/check");

        // res が null の場合は apiFetch により自動ログアウト済み
        if (!res) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(res.ok);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // 判定中のローディング表示
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // 認証NG → ログインへ
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 認証OK
  return <>{children}</>;
};

export default ProtectedRoute;
