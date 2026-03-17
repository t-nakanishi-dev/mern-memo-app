// client/src/pages/PasswordResetRequest.tsx
import React, { useState, SubmitEvent } from "react";
import { passwordResetRequest } from "../api";

const PasswordResetRequest: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await passwordResetRequest(email);

      setMessage(
        "パスワードリセット用のリンクを送信しました。メールをご確認ください。"
      );
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "エラーが発生しました。";
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">パスワードリセット</h2>

      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-4 py-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "送信中..." : "リセットリンクを送る"}
        </button>
      </form>
    </div>
  );
};

export default PasswordResetRequest;