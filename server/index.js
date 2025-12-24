// server/index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const memoRoutes = require("./routes/memos");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const cookieParser = require("cookie-parser");

// ============================================
// dotenv 設定
// ============================================

require("dotenv").config(); // 共通の .env を読み込む

if (process.env.NODE_ENV !== "production") {
  // 開発時
  require("dotenv").config({
    path: ".env.development",
    override: true,
  });
} else {
  // 本番時
  require("dotenv").config({
    path: ".env.production",
    override: true,
  });
}

// デバッグログ（開発時のみ）
if (process.env.NODE_ENV !== "production") {
  console.log("🧑‍💻 現在の環境変数（開発モード）:");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log(
    "FRONTEND_URL:",
    process.env.FRONTEND_URL || "未設定（デフォルト: localhost:3000）"
  );
  console.log("MONGODB_URI:", process.env.MONGODB_URI ? "設定済み" : "未設定");
}

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB接続
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// ============================================
// CORS 設定（これが最重要！）
// ============================================

const allowedOrigins = [
  "http://localhost:3000", // 開発用
  process.env.FRONTEND_URL, // 本番クライアントURL（Renderで設定）
  // 必要に応じて追加（例: "https://another-client.example.com"）
].filter(Boolean); // undefinedや空文字列を除外

app.use(
  cors({
    origin: (origin, callback) => {
      // origin が undefined の場合（同じoriginからのリクエストやPostmanなど）は許可
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORSブロック: 不正なorigin → ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // CookieやAuthorizationヘッダーを許可
    optionsSuccessStatus: 200, // レガシーブラウザ対応
  })
);

// ============================================
// その他のミドルウェア
// ============================================

app.use(cookieParser());
app.use(express.json());

// ============================================
// API ルーティング
// ============================================

app.use("/api/memos", memoRoutes);
app.use("/api/users", userRoutes);
app.use("/api", authRoutes); // /api/login, /api/register など

// ============================================
// サーバー起動
// ============================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
