// server/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ユーザースキーマの定義
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    // 🔐 パスワードリセット用
    resetToken: String,
    resetTokenExpires: Date,

    // 🔑 Refresh Token を DB に保存
    refreshToken: {
      type: String,
      default: "", 
    },
  },
  { timestamps: true }
);

// パスワードハッシュ化の pre-hook
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // パスワードが変更されている場合はハッシュ化
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Userモデルとしてエクスポート
const User = mongoose.model("User", UserSchema);
module.exports = User;
