// server/routes/memo.js
const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const validateAttachments = require("../middleware/validateAttachments");
const Memo = require("../models/Memo");
const { memoCreateSchema } = require("../schemas/memoSchema");
const { bucket } = require("../utils/firebaseAdmin");
const memoController = require("../controllers/memoController");

const router = express.Router();

// =======================================
// Firebase Storageファイル削除（ログ強化版）
// =======================================
async function deleteAttachmentsFromStorage(attachments = []) {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    console.log("削除対象の添付ファイルがありません");
    return;
  }

  console.log(`Storage削除対象ファイル数: ${attachments.length}`);

  const deletePromises = attachments.map(async (file) => {
    if (!file?.path) {
      console.warn("pathが空の添付ファイルが存在します", { file });
      return;
    }

    try {
      console.log(`削除試行: ${file.path}`);
      await bucket.file(file.path).delete();
      console.log(`削除成功: ${file.path}`);
    } catch (err) {
      if (err.code === 404) {
        // 既に存在しない場合は警告レベル（エラーではない）
        console.warn(
          `ファイルが見つかりません（既に削除済み？）: ${file.path}`,
        );
      } else if (err.code === 403) {
        console.error(`権限エラー（403）: ${file.path}`, {
          code: err.code,
          message: err.message,
        });
      } else {
        console.error(`Storage削除エラー: ${file.path}`, {
          code: err.code || "不明",
          message: err.message,
          stack: err.stack ? err.stack.substring(0, 300) : undefined,
        });
      }
    }
  });

  // すべて実行し、1つ失敗しても全体を止めない
  const results = await Promise.allSettled(deletePromises);

  // 失敗したものがあればサマリーを出す
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.warn(
      `Storage削除で失敗したファイル数: ${failed.length} / ${attachments.length}`,
    );
  } else {
    console.log("すべてのStorageファイル削除を試行完了（成功または404）");
  }
}

// =======================================
// GET /api/memos?page=1&limit=12
// メモ一覧を取得（削除されていないもののみ）
// =======================================
router.get("/", verifyToken, memoController.getMemos);

// =======================================
// POST /api/memos
// =======================================
router.post("/", verifyToken, validateAttachments, memoController.createMemo);

// =======================================
// GET /api/memos/trash
// =======================================
router.get("/trash", verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 12;

  try {
    const trashedMemos = await Memo.find({
      userId: req.user.userId,
      isDeleted: true,
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
router.delete("/trash", verifyToken, memoController.emptyTrash);

// =======================================
// GET /api/memos/:id
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
// =======================================
router.put("/:id", verifyToken, validateAttachments, memoController.updateMemo);

// =======================================
// DELETE /api/memos/:id （論理削除）
// =======================================
router.delete("/:id", verifyToken, memoController.deleteMemo);

// =======================================
// PUT /api/memos/:id/restore
// =======================================
router.put("/:id/restore", verifyToken, memoController.restoreMemo);

// =======================================
// DELETE /api/memos/:id/permanent （完全削除）
// =======================================
router.delete(
  "/:id/permanent",
  verifyToken,
  memoController.permanentDeleteMemo,
);
