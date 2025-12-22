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
