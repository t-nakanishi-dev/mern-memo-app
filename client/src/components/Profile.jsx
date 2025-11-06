// client/src/components/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate(); // ページ遷移用のフックを取得
  const [profile, setProfile] = useState(null); // プロフィールデータを格納するstate
  const [error, setError] = useState(null); // エラーメッセージを格納するstate

  // ローカルストレージから認証用トークンを取得
  const token = localStorage.getItem("token");

  // コンポーネントマウント時に認証チェックとプロフィール取得を実行
  useEffect(() => {
    // トークンが存在しない場合、ログイン画面へリダイレクト
    if (!token) {
      navigate("/login");
      return; // ここで処理を終了
    }

    // プロフィール情報をバックエンドから取得する非同期関数
    const fetchProfile = async () => {
      try {
        // fetchでユーザー情報を取得
        const res = await fetch("/api/users/profile", {
          headers: {
            // 認証情報としてトークンを送信
            Authorization: `Bearer ${token}`,
          },
        });

        // fetchのレスポンスがエラーの場合
        if (!res.ok) {
          throw new Error("プロフィール情報の取得に失敗しました。");
        }

        // レスポンスをJSONとしてパース
        const data = await res.json();

        // 取得したプロフィール情報をstateに格納
        setProfile(data);
      } catch (err) {
        // エラー発生時はエラーメッセージをセット
        setError(err.message);

        // 2秒後にログイン画面へ自動遷移
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    };

    // 非同期関数を呼び出し
    fetchProfile();
  }, [token, navigate]); // tokenやnavigateが変化した場合にも再実行

  // ---------------------------
  // 表示内容の条件分岐
  // ---------------------------

  // エラーが発生した場合の表示（例: トークン切れなど）
  if (error) {
    return (
      <div className="text-red-500 text-center mt-6">
        <p>{error}</p>
        <p>2秒後にログイン画面へ移動します...</p>
      </div>
    );
  }

  // プロフィールデータがまだ読み込まれていない場合（ローディング中）
  if (!profile) {
    return <p className="text-center mt-6">読み込み中...</p>;
  }

  // プロフィールデータを正常に取得できた場合の表示
  return (
    <div className="max-w-md mx-auto mt-8 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">ユーザープロファイル</h2>

      {/* メールアドレスの表示 */}
      <p>
        <strong>メールアドレス:</strong> {profile.email}
      </p>

      {/* 登録日をローカル日付形式に変換して表示 */}
      <p>
        <strong>登録日:</strong>{" "}
        {new Date(profile.createdAt).toLocaleDateString()}
      </p>

      {/* 登録しているメモの数を表示 */}
      <p>
        <strong>メモ数:</strong> {profile.memoCount}
      </p>

      {/* メモ一覧ページに戻るボタン */}
      <button
        onClick={() => navigate("/")}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        メモ一覧に戻る
      </button>
    </div>
  );
};

export default Profile;
