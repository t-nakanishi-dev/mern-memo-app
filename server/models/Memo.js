// server/models/Memo.js

const mongoose = require("mongoose");

const memoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: "" },
    isDone: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

    // ここを修正！！
    attachments: [
      {
        // ← new mongoose.Schema(...) をやめて、普通のオブジェクトで書く
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // ← これで自動でユニークID付与！！
        url: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }, // おまけで便利
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Memo", memoSchema);
