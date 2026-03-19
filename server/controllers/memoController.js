// server/controllers/memoController.js

// =======================================
// GET /api/memos?page=1&limit=12
// メモ一覧を取得（削除されていないもののみ）
// =======================================

const Memo = require("../models/Memo");

exports.getMemos = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 12;

  try {
    const memos = await Memo.find({ userId: req.user.userId, isDeleted: false })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Memo.countDocuments({
      userId: req.user.userId,
      isDeleted: false,
    });

    res.json({ memos, total });
  } catch (err) {
    console.error("メモ取得エラー:", err);
    res.status(500).json({ message: "メモの取得に失敗しました。" });
  }
};

// =======================================
// POST /api/memos
// =======================================
exports.createMemo = async (req, res) => {
  try {
    if (typeof req.body.attachments === "string") {
      try {
        req.body.attachments = JSON.parse(req.body.attachments);
      } catch (e) {
        console.error("attachments parse error:", e);
      }
    }

    const parsed = memoCreateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "入力値が不正です",
        errors: parsed.error.flatten(),
      });
    }

    const { title, content, category, attachments } = parsed.data;

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
};
