// client/src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiFetch } from "../apiFetch"; // ← これが命！

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = 判定中
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 超軽量な認証確認エンドポイントを叩く（おすすめ）
        const res = await apiFetch("/api/auth/check"); // ← 後で作る（1行でOK）
        
        // apiFetch が401返したら自動で/loginに飛ぶので、ここには来ない
        setIsAuthenticated(res?.ok || false);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // まだ判定中
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // 認証されてなかったらログイン画面へ
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 認証OK！
  return <>{children}</>;
};

export default ProtectedRoute;