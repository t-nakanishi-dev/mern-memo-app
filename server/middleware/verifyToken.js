// server/middleware/verifyToken.js

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  console.log("\n=== 【診断START】verifyToken ミドルウェア実行 ===");
  console.log("【診断1】リクエストURL:", req.method, req.originalUrl);
  console.log("【診断2】req.cookies:", req.cookies);

  const token = req.cookies?.accessToken;
  console.log("【診断3】accessToken 存在？ →", !!token);

  // -------------------------------------
  // アクセストークンが無ければ 401
  // → フロント側で refresh API を叩く
  // -------------------------------------
  if (!token) {
    console.log("【診断4】トークンなし → 401");
    return res.status(401).json({ message: "認証トークンが必要です" });
  }

  try {
    // ------------------------------------------------
    // アクセストークンを検証
    // 有効なら req.user に情報をセットして次へ
    // ------------------------------------------------
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("【診断5】トークン検証成功！ユーザーID:", decoded.userId);

    req.user = decoded;
    next();
  } catch (err) {
    console.log("【診断6】アクセストークンが期限切れ/無効:", err.message);

    // ------------------------------------------------
    // ※ここでは refresh を自動で実行しない！
    //   → 401 を返すだけ。
    //   → フロント側の apiFetch.js が自動で
    //      /auth/refresh を呼ぶ担当。
    // ------------------------------------------------
    return res.status(401).json({ message: "アクセストークンが無効です" });
  }
};

module.exports = verifyToken;
