// server/models/Memo.js

const mongoose = require("mongoose"); // MongoDBとやり取りするためのMongooseをインポート

// メモ情報を格納するスキーマ定義
const memoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // ユーザーIDはMongoDBのObjectId型
      ref: "User", // Userモデルを参照することで、populate() を使った結合が可能になる
      required: true, // このメモは必ず特定のユーザーに紐づく必要がある
    },
    title: {
      type: String,
      required: true, // メモのタイトルは必須
    },
    content: {
      type: String,
      required: true, // メモ本文は必須
    },
    category: {
      type: String,
      default: "", // カテゴリー未指定なら空文字をデフォルトにする
    },
    isDone: {
      type: Boolean,
      default: false, // タスクとしての完了状態（初期値は未完了）
    },
    isPinned: {
      type: Boolean,
      default: false, // ピン留め状態（初期値はピン留めされていない）
    },
    isDeleted: {
      type: Boolean,
      default: false, // 論理削除用フラグ（物理削除ではなくゴミ箱管理）
    },
    attachments: [
      // 添付ファイルの配列
      new mongoose.Schema(
        {
          // 各添付ファイルの情報をサブスキーマで定義
          url: { type: String, required: true }, // FirebaseやS3にアップロードしたファイルのURL
          name: { type: String, required: true }, // 元のファイル名
          type: { type: String, required: true }, // ファイルMIMEタイプ（例: "image/png", "application/pdf"）
        },
        { _id: false } // 添付ファイルごとに不要な _id フィールドを生成しないように設定
      ),
    ],
  },
  { timestamps: true } // createdAt と updatedAt を自動管理
);

// Memoモデルとしてエクスポート
module.exports = mongoose.model("Memo", memoSchema);
