// server/models/User.js

const mongoose = require("mongoose"); // MongoDB操作ライブラリ
const bcrypt = require("bcrypt"); // パスワードを安全に保存するためのハッシュ化ライブラリ

// ユーザースキーマの定義
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true, // 必須項目
      unique: true, // 重複を許さない（同じメールで複数登録できない）
    },
    password: {
      type: String,
      required: true, // 必須項目
    },
    resetToken: String, // パスワードリセット時に使用するトークン
    resetTokenExpires: Date, // トークンの有効期限（例：1時間後など）
  },
  { timestamps: true } // 作成日時 (createdAt)、更新日時 (updatedAt) を自動付与
);

// 保存前にパスワードをハッシュ化する処理（Mongooseの「preフック」）
UserSchema.pre("save", async function (next) {
  // もしパスワードが変更されていなければ、そのまま保存処理へ進む
  if (!this.isModified("password")) return next();

  // パスワードが新規または変更されている場合 → ハッシュ化する
  this.password = await bcrypt.hash(this.password, 10);
  // bcrypt.hash(平文パスワード, ソルトのラウンド数)
  // ラウンド数が大きいほど安全だが処理が重くなる（10は一般的なバランス）

  next(); // 次の処理（実際の保存処理）へ進む
});

// Userモデルとしてエクスポート
const User = mongoose.model("User", UserSchema);
module.exports = User;
