// server/index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const memoRoutes = require("./routes/memos");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const cookieParser = require("cookie-parser");
require("dotenv").config(); 

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
// ⭐ CORS
// ============================================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL, 
      "https://mern-memo-app-client-v2.onrender.com", 
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
