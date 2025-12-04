// ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie"; // ← 追加！

const ProtectedRoute = ({ children }) => {
  const token = Cookies.get("accessToken"); // ← ここだけ変更！
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
