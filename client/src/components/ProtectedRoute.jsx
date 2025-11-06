// client/src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRouteコンポーネント
 * -----------------------------
 * 認証が必要なルート（ページ）を保護するためのラッパー
 * 
 * props:
 * - children: 保護対象のコンポーネント
 *
 * 使用例:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children }) => {
  // ローカルストレージからトークンを取得
  const token = localStorage.getItem("token");

  // トークンが存在しない場合、ログイン画面へリダイレクト
  if (!token) {
    // Navigateコンポーネントでリダイレクト
    // replace={true} で履歴を置き換える（戻るボタンで戻れないようにする）
    return <Navigate to="/login" replace />;
  }

  // トークンがある場合は子コンポーネントを表示
  return children;
};

export default ProtectedRoute;
