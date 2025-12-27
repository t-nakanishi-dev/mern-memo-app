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
    { expiresIn: "15m" } // 15分
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "14d" } // 14日
  );
};

// ---------------------------------------------------------
// サインアップ
// ---------------------------------------------------------
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "すでに登録済みのメールアドレスです。" });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ message: "ユーザー登録が完了しました。" });
  } catch (err) {
    console.error("サインアップエラー:", err);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

// ---------------------------------------------------------
// ログイン（Refresh Token対応）
// ---------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("【診断A】/api/login にリクエスト到達");

    const user = await User.findOne({ email });
    if (!user) {
      console.log("【診断C】ユーザーが見つからない");
      return res
        .status(400)
        .json({ message: "メールアドレスかパスワードが間違っています。" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("【診断D】パスワード不一致");
      return res
        .status(400)
        .json({ message: "メールアドレスかパスワードが間違っています。" });
    }

    console.log("【診断E】認証成功 → トークン生成");

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // DB に refreshToken 保存
    user.refreshToken = refreshToken;
    await user.save();

    // Cookie 設定（login / refresh 共通）
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // ← 本番クロスサイト用
      maxAge: 15 * 60 * 1000,
      path: "/", // ← 全てのパスで有効
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // ← 本番クロスサイト用
      maxAge: 14 * 24 * 60 * 60 * 1000,
      path: "/", // ← 全てのパスで有効
    });

    console.log("【診断G】Cookie セット完了");

    return res.json({
      success: true,
      message: "ログイン成功",
      email: user.email,
    });
  } catch (err) {
    console.error("ログインエラー:", err);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

// ---------------------------------------------------------
// Refresh Token エンドポイント
// ---------------------------------------------------------
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({ message: "未認証です。" });

    // DB から refreshToken を持つユーザーを探す
    const user = await User.findOne({ refreshToken });
    if (!user)
      return res
        .status(401)
        .json({ message: "無効なリフレッシュトークンです。" });

    // Refresh Token の検証
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // 新しいアクセストークン発行
    const newAccessToken = generateAccessToken(user);

    // ついでに refreshToken も更新（トークンローテーション）
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    // Cookie 更新
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000,
      path: "/auth/refresh",
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Refresh エラー:", err);
    return res.status(401).json({ message: "再ログインが必要です。" });
  }
});

// ---------------------------------------------------------
// ログアウト（Refresh Token 削除）
// ---------------------------------------------------------
router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = "";
        await user.save();
      }
    }

    // Cookie を削除
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/auth/refresh" });

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
