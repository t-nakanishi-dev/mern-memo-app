// server/index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const memoRoutes = require("./routes/memos");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const cookieParser = require("cookie-parser");
require("dotenv").config(); // 基本の .env

// ============================================
// dotenv 設定
// ============================================

console.log(
  "🔍 【JWT診断】JWT_SECRET:",
  process.env.JWT_SECRET
    ? "設定済み (長さ: " + process.env.JWT_SECRET.length + ")"
    : "❌ 未設定 or undefined"
);
console.log(
  "🔍 【JWT診断】REFRESH_TOKEN_SECRET:",
  process.env.REFRESH_TOKEN_SECRET
    ? "設定済み (長さ: " + process.env.REFRESH_TOKEN_SECRET.length + ")"
    : "❌ 未設定 or undefined"
);

// 1. 共通の .env を読み込む
require("dotenv").config();

// 2. 開発モードでは .env.development を上書き
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: ".env.development",
    override: true,
  });
} else {
  // 本番モード（Render）では .env.production
  require("dotenv").config({
    path: ".env.production",
    override: true,
  });
}

// デバッグログ（開発時のみ）
if (process.env.NODE_ENV !== "production") {
  console.log("🧑‍💻 現在の環境変数（開発モード）:");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
  console.log("MONGODB_URI:", process.env.MONGODB_URI ? "設定済み" : "未設定");
}

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MongoDB 接続
// ============================================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// ============================================
// ⭐ CORS（最重要：ここが原因だった）
// ============================================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL, // 👈 https://mern-memo-app-client.onrender.com
      "https://mern-memo-app-client-v2.onrender.com", // 👈 明示的に追加
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// プリフライト OPTIONS を完全対応
app.options("*", cors());

// ============================================
// ミドルウェア
// ============================================
app.use(cookieParser());
app.use(express.json());

// ============================================
// ルーティング
// ============================================
app.use("/api/memos", memoRoutes);
app.use("/api/users", userRoutes);
app.use("/api", authRoutes);

// ============================================
// 本番の静的ファイル配信 → 開発環境のみ適用
// ============================================
if (process.env.NODE_ENV !== "production") {
  // ローカルのみ：クライアントのビルドファイルを配信（Vite/ReactのSPA対応）
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

// ============================================
// サーバー起動
// ============================================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
