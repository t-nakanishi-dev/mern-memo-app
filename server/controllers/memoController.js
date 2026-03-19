// server/controllers/memoController.js

// =======================================
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
