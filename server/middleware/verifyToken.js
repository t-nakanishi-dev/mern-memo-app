// server/middleware/verifyToken.js（← これに完全置き換え）

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  console.log("\n=== 【診断START】verifyToken ミドルウェア実行 ===");
  console.log("【診断1】リクエストURL:", req.method, req.originalUrl);
  console.log("【診断2】req.cookies の全内容:", req.cookies);
  console.log("【診断3】accessToken 存在？ →", !!req.cookies?.accessToken);

  const token = req.cookies?.accessToken;

  if (!token) {
    console.log("【診断4】トークンなし → 401返します");
    return res.status(401).json({ message: "認証トークンが必要です" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("【診断5】トークン検証成功！ユーザーID:", decoded.userId);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("【診断6】トークン検証失敗:", err.message);
    return res.status(401).json({ message: "無効なトークンです" });
  }
};

module.exports = verifyToken;
