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
      "http://localhost:3000", // 開発用
      process.env.FRONTEND_URL, // 本番URL (.env.productionで設定)
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
// 本番の静的ファイル配信（client/build）
// ============================================
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// ============================================
// サーバー起動
// ============================================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
