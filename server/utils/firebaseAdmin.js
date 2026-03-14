// server/utils/firebaseAdmin.js

const admin = require("firebase-admin");

// =======================================
// 環境変数チェック
// =======================================
if (!process.env.SERVICE_ACCOUNT_KEY_BASE64) {
  throw new Error("SERVICE_ACCOUNT_KEY_BASE64 is not set");
}

if (!process.env.FIREBASE_STORAGE_BUCKET) {
  throw new Error("FIREBASE_STORAGE_BUCKET is not set");
}

// =======================================
// Base64 → JSON
// =======================================
const serviceAccount = JSON.parse(
  Buffer.from(process.env.SERVICE_ACCOUNT_KEY_BASE64, "base64").toString(
    "utf-8",
  ),
);

// =======================================
// Firebase初期化
// =======================================
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = admin.storage().bucket();

module.exports = { bucket };
