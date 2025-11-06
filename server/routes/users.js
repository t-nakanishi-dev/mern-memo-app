// server/routes/users.js
const express = require("express");
const verifyToken = require("../middleware/verifyToken"); // JWT認証を行うカスタムミドルウェア
const User = require("../models/User"); // Userモデルをインポート

const router = express.Router();

/**
 * GET /api/users/profile
 * 認証済みユーザーのプロフィール情報を取得するルート
 * - JWTトークンを検証し、ユーザーIDを取得
 * - パスワードなどの機密情報を除いたユーザーデータを返却
 * - ユーザーが作成したメモの総数も同時に返す
 */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    // JWTミドルウェアで検証済みのユーザー情報から userId を取得
    const userId = req.user.userId;

    // ユーザー情報を取得（パスワードは除外する）
    const user = await User.findById(userId).select("-password");
    if (!user) {
      // ユーザーが存在しない場合
      return res.status(404).json({ message: "ユーザーが見つかりません。" });
    }

    // ユーザーに紐づくメモの件数を数える
    // require をルート内で行っているため、models/Memo を毎回ロードする形になっている
    const memoCount = await require("../models/Memo").countDocuments({
      userId,
    });

    // プロフィール情報を返却
    res.json({
      email: user.email, // 登録メールアドレス
      createdAt: user.createdAt, // アカウント作成日時
      memoCount, // ユーザーが持つメモの総数
    });
  } catch (err) {
    // エラーハンドリング
    console.error("プロフィール取得エラー:", err);
    res.status(500).json({ message: "プロフィールの取得に失敗しました。" });
  }
});

module.exports = router;
