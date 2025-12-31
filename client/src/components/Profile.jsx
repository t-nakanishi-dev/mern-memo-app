// client/src/components/Profile.jsx 
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../apiFetch"; 

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch("/api/users/profile"); 
        if (!res) return;

        if (!res.ok) throw new Error("取得失敗");

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError("プロフィール取得失敗。ログインし直してください。");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!profile) return <p className="text-center mt-10">読み込み中...</p>;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">ユーザープロファイル</h2>
      <p>
        <strong>メール:</strong> {profile.email}
      </p>
      <p>
        <strong>登録日:</strong>{" "}
        {new Date(profile.createdAt).toLocaleDateString()}
      </p>
      <p>
        <strong>メモ数:</strong> {profile.memoCount}
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py- py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        メモ一覧に戻る
      </button>
    </div>
  );
};

export default Profile;
