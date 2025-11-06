// server/middleware/verifyToken.js

const jwt = require("jsonwebtoken"); // JWT (JSON Web Token) を扱うライブラリを読み込む

// JWTトークンを検証するミドルウェア
const verifyToken = (req, res, next) => {
  // リクエストヘッダーの "Authorization" を取得
  // 形式は "Bearer <TOKEN>" が想定される
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN" から TOKEN 部分のみ抽出

  if (!token) {
    // トークンが存在しない場合は 401 Unauthorized を返す
    return res.status(401).json({ message: "認証トークンがありません。" });
  }

  try {
    // JWTトークンの検証
    const secretKey = process.env.JWT_SECRET; // .env に設定したシークレットキーを使用
    const decoded = jwt.verify(token, secretKey); // トークンが有効かどうかを確認

    // 検証が成功した場合、トークン内のペイロード情報を req.user に格納
    // これにより、次のルートハンドラでユーザー情報を利用可能
    req.user = decoded;

    console.log("Decoded JWT payload:", decoded); // デバッグ用にデコード結果を出力

    next(); // 次のミドルウェアまたはルートハンドラへ処理を渡す
  } catch (err) {
    // トークンが無効または期限切れの場合は 403 Forbidden を返す
    return res.status(403).json({ message: "無効なトークンです。" });
  }
};

// モジュールとしてエクスポート
module.exports = verifyToken;
