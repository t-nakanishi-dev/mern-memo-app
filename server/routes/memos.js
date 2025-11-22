// server/routes/memo.js
const express = require("express");
const verifyToken = require("../middleware/verifyToken"); // JWT認証を行うミドルウェア
const Memo = require("../models/Memo"); // Memoモデルをインポート

const router = express.Router();

// =======================================
// GET /api/memos?page=1&limit=10
// メモ一覧を取得（削除されていないもののみ）
// =======================================
router.get("/", verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1; // ページ番号（デフォルト1）
  const limit = parseInt(req.query.limit) || 10; // 1ページあたり件数（デフォルト10）

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
// メモ作成
// =======================================
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content, category, attachments } = req.body;

    // デバッグ用ログ（attachmentsが文字列として送られる場合の処理）
    console.log("------------------- DEBUG LOG START -------------------");
    console.log("Received attachments in server:", attachments);
    console.log("Type of received attachments (typeof):", typeof attachments);
    console.log(
      "Is attachments an array (Array.isArray):",
      Array.isArray(attachments)
    );

    if (typeof attachments === "string") {
      console.log("Attachments is a string. Attempting JSON.parse()...");
      try {
        const parsedAttachments = JSON.parse(attachments); // JSON文字列を配列に変換
        console.log("Successfully parsed attachments:", parsedAttachments);
        req.body.attachments = parsedAttachments; // 上書き
      } catch (parseError) {
        console.error("Failed to parse attachments string:", parseError);
      }
    }
    console.log("------------------- DEBUG LOG END ---------------------");

    // バリデーション：タイトル・内容は必須
    if (!title || !content) {
      return res.status(400).json({ message: "タイトルと内容は必須です。" });
    }

    // 新しいメモを作成
    const newMemo = new Memo({
      userId: req.user.userId, // JWTから取得したユーザーID
      title,
      content,
      category: category || "",
      attachments: attachments || [], // 添付ファイル（空配列可）
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
  const limit = parseInt(req.query.limit) || 10;

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
// ゴミ箱を空にする（完全削除）
// =======================================
router.delete("/trash", verifyToken, async (req, res) => {
  try {
    const result = await Memo.deleteMany({
      userId: req.user.userId,
      isDeleted: true, // ゴミ箱の中身のみ
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
// 特定のメモを更新
// =======================================
router.put("/:id", verifyToken, async (req, res) => {
  try {
    // ここが最重要！！ attachments をちゃんと受け取る！！
    const { title, content, category, isDone, isPinned, attachments } =
      req.body;

    const updateFields = {};

    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;
    if (category !== undefined) updateFields.category = category;
    if (isDone !== undefined) updateFields.isDone = isDone;
    if (isPinned !== undefined) updateFields.isPinned = isPinned;

    // ここが命！！ attachments が送られてきたら完全上書き！！
    if (attachments !== undefined) {
      updateFields.attachments = attachments;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "更新する内容がありません" });
    }

    const updatedMemo = await Memo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateFields,
      { new: true }
    );

    if (!updatedMemo) {
      return res.status(404).json({ message: "メモが見つかりません" });
    }

    res.json(updatedMemo);
  } catch (err) {
    console.error("メモ更新エラー:", err);
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
      { new: true }
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
      { new: true }
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
// ゴミ箱にあるメモを「完全に削除」（復元不可）
// =======================================
router.delete("/:id/permanent", verifyToken, async (req, res) => {
  try {
    const deletedMemo = await Memo.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
      isDeleted: true, // ゴミ箱にあるものだけを完全削除可能
    });

    if (!deletedMemo) {
      return res.status(404).json({
        message:
          "メモが見つかりません（または既に削除済み、またはゴミ箱にありません）",
      });
    }

    res.json({ message: "メモを完全に削除しました。" });
  } catch (err) {
    console.error("完全削除エラー:", err);
    res.status(500).json({ message: "完全に削除できませんでした。" });
  }
});

module.exports = router;
