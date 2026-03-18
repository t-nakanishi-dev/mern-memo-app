// client/src/components/Profile.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const { profile, loading, error, fetchProfile } = useProfile();

  if (loading) {
    return <p className="text-center mt-10">読み込み中...</p>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!profile) {
    return <p className="text-center mt-10">データがありません</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">ユーザープロファイル</h2>
      <p>
        <strong>メール:</strong> {profile.email}
      </p>
      <p>
        <strong>登録日:</strong>{" "}
        {new Date(profile.createdAt).toLocaleDateString("ja-JP")}
      </p>
      <p>
        <strong>メモ数:</strong> {profile.memoCount}
      </p>
      <button
        onClick={fetchProfile}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        {loading ? "読み込み中..." : "再取得"}
      </button>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        メモ一覧に戻る
      </button>
    </div>
  );
};

export default Profile;
