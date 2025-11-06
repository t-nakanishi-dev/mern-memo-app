// server/routes/auth.js

const express = require("express");
const crypto = require("crypto"); // ランダムなトークン生成に使用
const User = require("../models/User"); // Userモデルをインポート
const bcrypt = require("bcrypt"); // パスワード照合に使用
const jwt = require("jsonwebtoken"); // JWT生成・検証に使用
const nodemailer = require("nodemailer"); // メール送信ライブラリ

const router = express.Router(); // Expressのルーターを作成

// -------------------------------
// ユーザー新規登録（サインアップ）
// POST /api/signup
// -------------------------------
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body; // リクエストボディからメール・パスワード取得

    // すでに同じメールアドレスで登録されているかチェック
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "すでに登録済みのメールアドレスです。" });
    }

    // 新しいユーザーを作成
    // パスワードはUserモデルのpre("save")フックで自動的にハッシュ化される
    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ message: "ユーザー登録が完了しました。" });
  } catch (err) {
    console.error("サインアップエラー:", err);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

// -------------------------------
// ユーザーログイン
// POST /api/login
// -------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 入力されたメールアドレスのユーザーを探す
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "メールアドレスかパスワードが間違っています。" });
    }

    // 入力パスワードとDB内のハッシュ化されたパスワードを比較
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "メールアドレスかパスワードが間違っています。" });
    }

    // JWTトークンを発行（7日間有効）
    const token = jwt.sign(
      { userId: user._id, email: user.email }, // ペイロード
      process.env.JWT_SECRET, // 秘密鍵（.envに設定）
      { expiresIn: "7d" } // 有効期限
    );

    res.json({ token, message: "ログイン成功" });
  } catch (err) {
    console.error("ログインエラー:", err);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

// -------------------------------
// パスワードリセット要求
// POST /api/password-reset-request
// メールアドレスを受け取り、リセット用のURLを送信
// -------------------------------
router.post("/password-reset-request", async (req, res) => {
  const { email } = req.body;

  try {
    // メールアドレスに対応するユーザーを検索
    const user = await User.findOne({ email });
    if (!user) {
      // セキュリティのため「存在しない」場合でも成功レスポンスを返す
      return res.status(200).json({
        message: "（存在する場合）パスワードリセットメールを送信しました。",
      });
    }

    // ランダムなリセットトークンを生成
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 1000 * 60 * 60; // 1時間有効
    await user.save();

    // Nodemailerの送信設定（Mailtrapを利用した開発環境用例）
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // パスワードリセット用のURLを生成（フロントエンド側でクエリパラメータとして利用）
    const resetLink = `http://localhost:3000/password-reset?token=${token}`;

    // ユーザーにメールを送信
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

// -------------------------------
// パスワードリセット処理
// POST /api/password-reset
// トークンと新しいパスワードを受け取り、DBを更新
// -------------------------------
router.post("/password-reset", async (req, res) => {
  const { token, newPassword } = req.body; // リクエストからトークンと新パスワードを取得

  try {
    // 有効なトークンを持つユーザーを検索
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }, // 現在時刻より有効期限が未来
    });

    if (!user) {
      return res.status(400).json({
        message:
          "無効なリンク、または有効期限が切れています。再度パスワードリセットを要求してください。",
      });
    }

    // 新しいパスワードを設定（ハッシュ化はUserモデルのpre("save")で自動実行される）
    user.password = newPassword;

    // 使用済みのトークン情報を削除
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    // 保存 → pre("save")でパスワードがハッシュ化される
    await user.save();

    res.json({ message: "パスワードが正常にリセットされました。" });
  } catch (err) {
    console.error("パスワードリセットエラー:", err);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

module.exports = router;
