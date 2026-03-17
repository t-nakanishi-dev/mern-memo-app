// client/src/components/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../apiFetch";
import { UserProfile } from "@/types/api";

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // apiFetch<T> で JSON を直接返す前提
        const data = await apiFetch<UserProfile>("/api/users/profile");

        setProfile(data);
      } catch (err: unknown) {
        console.error("プロフィール取得エラー:", err);
        const message =
          err instanceof Error
            ? err.message
            : "プロフィール取得に失敗しました。";
        setError("プロフィール取得失敗。ログインし直してください。");
        // 2秒後にリダイレクト
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!profile) {
    return <p className="text-center mt-10">読み込み中...</p>;
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
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        メモ一覧に戻る
      </button>
    </div>
  );
};

export default Profile;
