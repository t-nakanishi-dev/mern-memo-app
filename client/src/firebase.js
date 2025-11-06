// client/src/firebase.js

// Firebase SDK の必要な機能をインポート
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // Firebase Storage を使う場合に必要

// Firebase プロジェクトの設定情報
// 各項目は Firebase コンソールから取得
const firebaseConfig = {
  apiKey: "AIzaSyAhRmMtrtN3Vyhh9ZO1WJLKy_Qb2RXSdmA",             // Firebase API Key
  authDomain: "mern-memo-app-df006.firebaseapp.com",         // 認証用ドメイン
  projectId: "mern-memo-app-df006",          // プロジェクトID
  storageBucket: "mern-memo-app-df006.firebasestorage.app",      // ストレージバケット名（必須）
  messagingSenderId: "783073701834",  // メッセージ送信者ID（プッシュ通知用）
  appId: "1:783073701834:web:da761c945a7e9b3d0fe933",              // FirebaseアプリID
  measurementId: "G-V0DW6Z60LM",      // Analytics用ID（任意）
};

// Firebase アプリを初期化
const app = initializeApp(firebaseConfig);

// Firebase Storage をエクスポート
// メモ画像やファイルのアップロードに使用可能
export const storage = getStorage(app);

// デフォルトエクスポートとして app もエクスポート可能
export default app;

