// server/routes/memo.js

const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const validateAttachments = require("../middleware/validateAttachments");
const memoController = require("../controllers/memoController");

const router = express.Router();

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
router.get("/trash", verifyToken, memoController.getTrashedMemos);

// =======================================
// DELETE /api/memos/trash
// ゴミ箱を空にする
// =======================================
router.delete("/trash", verifyToken, memoController.emptyTrash);

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

// =======================================
// GET /api/memos/:id
// =======================================
router.get("/:id", verifyToken, memoController.getMemoById);

// =======================================
// PUT /api/memos/:id
// =======================================
router.put("/:id", verifyToken, validateAttachments, memoController.updateMemo);

// =======================================
// DELETE /api/memos/:id （論理削除）
// =======================================
router.delete("/:id", verifyToken, memoController.deleteMemo);

module.exports = router;
