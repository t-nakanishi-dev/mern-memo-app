// server/routes/memo.js
const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const Memo = require("../models/Memo");
const { memoCreateSchema } = require("../schemas/memoSchema");
const { bucket } = require("../utils/firebaseAdmin");

const router = express.Router();

// =======================================
// Firebase Storageファイル削除
// =======================================
async function deleteAttachmentsFromStorage(attachments = []) {
  if (!Array.isArray(attachments) || attachments.length === 0) return;

  for (const file of attachments) {
    try {
      if (file?.path) {
        await bucket.file(file.path).delete();
      }
    } catch (err) {
      console.error("Storage削除失敗:", {
        path: file?.path,
        error: err.message,
      });
    }
  }
}

// =======================================
// GET /api/memos?page=1&limit=12
// メモ一覧を取得（削除されていないもののみ）
// =======================================
router.get("/", verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1; // ページ番号（デフォルト1）
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 12;

  try {
    // 認証済みユーザーのメモを検索（削除されていないもの）
    const memos = await Memo.find({ userId: req.user.userId, isDeleted: false })
      .sort({ updatedAt: -1 }) // 更新日時の降順
      .skip((page - 1) * limit) // ページング用スキップ
      .limit(limit); // 最大件数制限

    // 総件数を取得（ページング用）
    const total = await Memo.countDocuments({
      userId: req.user.userId,
      isDeleted: false,
    });

    res.json({ memos, total });
  } catch (err) {
    console.error("メモ取得エラー:", err);
    res.status(500).json({ message: "メモの取得に失敗しました。" });
  }
});

// =======================================
// POST /api/memos
// メモ作成（Zodバリデーション版）
// =======================================
router.post("/", verifyToken, async (req, res) => {
  try {
    // 🔹 attachments が文字列で来た場合の救済（現状維持）
    if (typeof req.body.attachments === "string") {
      try {
        req.body.attachments = JSON.parse(req.body.attachments);
      } catch (e) {
        console.error("attachments parse error:", e);
      }
    }

    // 🔥 Zod バリデーション（ここが面談評価ポイント）
    const parsed = memoCreateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "入力値が不正です",
        errors: parsed.error.flatten(),
      });
    }

    // 🔹 型安全に取り出し
    const { title, content, category, attachments } = parsed.data;

    // 🔹 新しいメモ作成
    const newMemo = new Memo({
      userId: req.user.userId,
      title,
      content,
      category: category || "",
      attachments: attachments || [],
    });

    await newMemo.save();

    res.status(201).json(newMemo);
  } catch (err) {
    console.error("メモ作成エラー:", err);
    res
      .status(500)
      .json({ message: "メモの作成中にサーバーエラーが発生しました。" });
  }
});

// =======================================
// GET /api/memos/trash
// ゴミ箱にあるメモ一覧を取得
// =======================================
router.get("/trash", verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 12;

  try {
    const trashedMemos = await Memo.find({
      userId: req.user.userId,
      isDeleted: true, // 論理削除済みのメモのみ
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Memo.countDocuments({
      userId: req.user.userId,
      isDeleted: true,
    });

    res.status(200).json({ memos: trashedMemos, total });
  } catch (err) {
    console.error("ゴミ箱メモ取得エラー:", err);
    res.status(500).json({ message: "ゴミ箱の取得に失敗しました。" });
  }
});

// =======================================
// DELETE /api/memos/trash
// ゴミ箱を空にする
// =======================================
router.delete("/trash", verifyToken, async (req, res) => {
  try {
    const trashedMemos = await Memo.find({
      userId: req.user.userId,
      isDeleted: true,
    });

    // 🔥 Storage削除
    for (const memo of trashedMemos) {
      await deleteAttachmentsFromStorage(memo.attachments);
    }

    const result = await Memo.deleteMany({
      userId: req.user.userId,
      isDeleted: true,
    });

    res.json({
      message: `ゴミ箱を空にしました（${result.deletedCount} 件削除）。`,
    });
  } catch (err) {
    console.error("ゴミ箱完全削除エラー:", err);
    res.status(500).json({ message: "ゴミ箱の完全削除に失敗しました。" });
  }
});

// =======================================
// GET /api/memos/:id
// 特定のメモを取得
// =======================================
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const memo = await Memo.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!memo) {
      return res.status(404).json({
        message: "メモが見つかりません、または閲覧する権限がありません。",
      });
    }

    res.json(memo);
  } catch (err) {
    console.error("メモ取得エラー:", err);
    res
      .status(500)
      .json({ message: "メモの取得中にサーバーエラーが発生しました。" });
  }
});

// =======================================
// PUT /api/memos/:id
// 特定のメモを更新（孤児ファイル対策あり）
// =======================================
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, content, category, isDone, isPinned, attachments } =
      req.body;

    const memo = await Memo.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!memo) {
      return res.status(404).json({ message: "メモが見つかりません" });
    }

    const updateFields = {};

    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;
    if (category !== undefined) updateFields.category = category;
    if (isDone !== undefined) updateFields.isDone = isDone;
    if (isPinned !== undefined) updateFields.isPinned = isPinned;

    // =======================================
    // 🔥 attachments差分削除（孤児対策）
    // =======================================
    if (attachments !== undefined) {
      const oldAttachments = memo.attachments || [];
      const newAttachments = attachments || [];

      const newPaths = new Set(newAttachments.map((a) => a.path));

      const removedFiles = oldAttachments.filter(
        (file) => file?.path && !newPaths.has(file.path),
      );

      // attachments更新
      updateFields.attachments = newAttachments;

      const updatedMemo = await Memo.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        updateFields,
        { new: true },
      );

      // DB更新成功後にStorage削除
      await deleteAttachmentsFromStorage(removedFiles);

      return res.json(updatedMemo);
    }

    // =======================================
    // attachmentsが送られていない場合の通常更新
    // =======================================
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "更新する内容がありません" });
    }

    const updatedMemo = await Memo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateFields,
      { new: true },
    );

    res.json(updatedMemo);
  } catch (err) {
    console.error("Memo update failed", {
      userId: req.user.userId,
      memoId: req.params.id,
      error: err.message,
    });

    res.status(500).json({ message: "サーバーエラー" });
  }
});

// =======================================
// DELETE /api/memos/:id
// 特定のメモをゴミ箱に移動（論理削除）
// =======================================
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedMemo = await Memo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isDeleted: true }, // 論理削除
      { new: true },
    );
    if (!deletedMemo) {
      return res.status(404).json({
        message: "メモが見つかりません、または削除する権限がありません。",
      });
    }
    res.json({ message: "メモをゴミ箱に移動しました。" });
  } catch (err) {
    console.error("メモ削除エラー:", err);
    res
      .status(500)
      .json({ message: "メモの削除中にサーバーエラーが発生しました。" });
  }
});

// =======================================
// PUT /api/memos/:id/restore
// ゴミ箱からメモを復元
// =======================================
router.put("/:id/restore", verifyToken, async (req, res) => {
  try {
    const restoredMemo = await Memo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isDeleted: false }, // ゴミ箱から復元
      { new: true },
    );

    if (!restoredMemo) {
      return res.status(404).json({ message: "メモが見つかりません。" });
    }

    res.json(restoredMemo);
  } catch (err) {
    res.status(500).json({ message: "メモの復元に失敗しました。" });
  }
});

// =======================================
// DELETE /api/memos/:id/permanent
// ゴミ箱にあるメモを完全削除
// =======================================
router.delete("/:id/permanent", verifyToken, async (req, res) => {
  try {
    const memo = await Memo.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isDeleted: true,
    });

    if (!memo) {
      return res.status(404).json({
        message:
          "メモが見つかりません（または既に削除済み、またはゴミ箱にありません）",
      });
    }

    // 🔥 Storage削除
    await deleteAttachmentsFromStorage(memo.attachments);

    // 🔥 DB削除
    await Memo.deleteOne({ _id: memo._id });

    res.json({ message: "メモを完全に削除しました。" });
  } catch (err) {
    console.error("完全削除エラー:", err);
    res.status(500).json({ message: "完全に削除できませんでした。" });
  }
});

module.exports = router;
