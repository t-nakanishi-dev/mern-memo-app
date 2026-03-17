// client/src/pages/PasswordReset.tsx
import React, { useState, SubmitEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { passwordReset } from "../api";

const PasswordReset: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    setLoading(true);

    try {
      await passwordReset(token!, newPassword);  // token! で non-null assertion（!token は下で処理）

      setMessage("パスワードがリセットされました。ログインしてください。");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "リセットに失敗しました。";
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <p className="text-center mt-20 text-red-600">
        無効なURLです。パスワードリセットリンクを確認してください。
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">新しいパスワードを設定</h2>

      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="新しいパスワード"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full mb-4 px-4 py-2 border rounded"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="パスワード確認"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full mb-4 px-4 py-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "送信中..." : "パスワードをリセットする"}
        </button>
      </form>
    </div>
  );
};

export default PasswordReset;