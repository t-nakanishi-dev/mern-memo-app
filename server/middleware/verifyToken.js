// server/middleware/verifyToken.js

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // アクセストークンを取得
  const token = req.cookies?.accessToken;

  // トークンがなければ 401 を返す
  if (!token) {
    return res.status(401).json({ message: "認証トークンが必要です" });
  }

  try {
    // トークンを検証し、ユーザー情報を req.user にセット
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // トークンが無効または期限切れの場合
    console.error("verifyToken middleware error:", err.message);
    return res.status(401).json({ message: "アクセストークンが無効です" });
  }
};

module.exports = verifyToken;
