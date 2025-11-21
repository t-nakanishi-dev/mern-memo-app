// client/src/firebase.js

// Firebase SDK の必要な機能をインポート
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // Firebase Storage を使う場合に必要

// Firebase プロジェクトの設定情報
// 各項目は Firebase コンソールから取得
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Firebase アプリを初期化
const app = initializeApp(firebaseConfig);

// Firebase Storage をエクスポート
// メモ画像やファイルのアップロードに使用可能
export const storage = getStorage(app);

// デフォルトエクスポートとして app もエクスポート可能
export default app;
