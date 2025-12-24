// server/index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const memoRoutes = require("./routes/memos");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const cookieParser = require("cookie-parser");
require("dotenv").config(); // まず .env（共通）を読み込む

// ============================================
// dotenv 設定
// ============================================

// 1. まず共通の .env を読み込む（あれば）
require("dotenv").config(); // → .env（共通変数）

// 2. 開発時は強制的に .env.development を上書き読み込み
//    → npm run dev で起動している限り、常にこれが優先される！
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: ".env.development",
    override: true, // 同じ変数があっても上書き
  });
} else {
  // 本番時は .env.production を読み込む（デプロイ時に使う）
  require("dotenv").config({
    path: ".env.production",
    override: true,
  });
}

// デバッグログ（開発時のみ表示）
if (process.env.NODE_ENV !== "production") {
  console.log("🧑‍💻 現在の環境変数（開発モード）:");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
  console.log("MONGODB_URI:", process.env.MONGODB_URI ? "設定済み" : "未設定");
}

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB接続
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// ミドルウェア（ここが重要！）
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(cookieParser()); // ← クッキー読み取り
app.use(express.json());

// ルーティング
app.use("/api/memos", memoRoutes);
app.use("/api/users", userRoutes);
app.use("/api", authRoutes);

// 静的ファイル配信（本番用）
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
