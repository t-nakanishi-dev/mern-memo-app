// server/routes/auth.js

const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// ---------------------------------------------------------
// ユーティリティ：AccessToken & RefreshToken 生成関数
// ---------------------------------------------------------
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "14d",
  });
};

// ---------------------------------------------------------
// ログイン（修正版）
// ---------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("【診断A】/api/login にリクエスト到達");

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ message: "メールアドレスかパスワードが間違っています。" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // DB に refreshToken 保存
    user.refreshToken = refreshToken;
    await user.save();

    // 【重要】refreshToken のみ httpOnly Cookie に保存
    // accessToken はボディで返す（クライアントがヘッダーに付与するため）
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 本番はHTTPSのみ
      sameSite: "none", // ★これが超重要！クロスサイト許可
      maxAge: 14 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // accessToken のCookieは完全に削除（不要）
    res.clearCookie("accessToken");

    console.log(
      "【診断G】ログイン成功 → accessTokenをボディ返却、refreshTokenをCookie設定"
    );

    return res.json({
      success: true,
      message: "ログイン成功",
      accessToken, // ← クライアントがこれを使ってAuthorizationヘッダー設定
      email: user.email,
    });
  } catch (err) {
    console.error("ログインエラー:", err);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

// ---------------------------------------------------------
// Refresh Token エンドポイント（修正版）
// ---------------------------------------------------------
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "リフレッシュトークンがありません" });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res
        .status(401)
        .json({ message: "無効なリフレッシュトークンです" });
    }

    // JWT検証
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user); // ローテーション

    user.refreshToken = newRefreshToken;
    await user.save();

    // refreshToken を更新（sameSite: "none" + secure必須）
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // ★クロスサイト対応
      maxAge: 14 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // accessToken はボディで返す
    return res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("Refresh エラー:", err);
    return res.status(401).json({ message: "再ログインが必要です。" });
  }
});

// ---------------------------------------------------------
// ログアウト
// ---------------------------------------------------------
router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await User.updateOne({ refreshToken }, { $unset: { refreshToken: "" } });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });

    return res.json({ message: "ログアウトしました。" });
  } catch (err) {
    console.error("ログアウトエラー:", err);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

// ---------------------------------------------------------
// パスワードリセット（既存機能）
// ---------------------------------------------------------
router.post("/password-reset-request", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message: "（存在する場合）パスワードリセットメールを送信しました。",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 1000 * 60 * 60;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/password-reset?token=${token}`;

    await transporter.sendMail({
      from: '"Your App" <no-reply@yourapp.com>',
      to: user.email,
      subject: "パスワードリセットのご案内",
      html: `<p>以下のリンクからパスワードリセットを行ってください：</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>※リンクの有効期限は1時間です。</p>`,
    });

    res
      .status(200)
      .json({ message: "パスワードリセットメールを送信しました。" });
  } catch (err) {
    console.error("リセットリクエストエラー:", err);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

// ---------------------------------------------------------
// パスワードリセット
// ---------------------------------------------------------
router.post("/password-reset", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "無効なリンク、または有効期限が切れています。再度パスワードリセットを要求してください。",
      });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    res.json({ message: "パスワードが正常にリセットされました。" });
  } catch (err) {
    console.error("パスワードリセットエラー:", err);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

// ---------------------------------------------------------
// AccessToken のみ検証
// ---------------------------------------------------------
router.get("/check", verifyToken, (req, res) => {
  return res.json({ authenticated: true });
});

module.exports = router;
