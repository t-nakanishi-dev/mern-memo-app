// server/middleware/validateAttachments.js

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

function validateAttachments(req, res, next) {
  try {
    const attachments = req.body.attachments;

    // attachmentsなしはOK
    if (!attachments) return next();

    if (!Array.isArray(attachments)) {
      return res.status(400).json({
        message: "attachmentsは配列である必要があります",
      });
    }

    // ファイル数制限
    if (attachments.length > MAX_FILES) {
      return res.status(400).json({
        message: `添付ファイルは最大${MAX_FILES}件までです`,
      });
    }

    for (const file of attachments) {
      if (!file) continue;

      // 🔥 ① 既存ファイルはスキップ
      if (file._id) continue;

      // 🔥 ② 新規ファイルのみチェック

      // MIMEチェック
      if (!ALLOWED_TYPES.includes(file.type)) {
        return res.status(400).json({
          message: `許可されていないファイル形式です: ${file.name}`,
        });
      }

      // サイズチェック
      if (typeof file.size !== "number") {
        return res.status(400).json({
          message: `ファイルサイズが不正です: ${file.name}`,
        });
      }

      if (file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          message: `ファイルサイズは5MB以内にしてください: ${file.name}`,
        });
      }
    }

    next();
  } catch (err) {
    console.error("Attachment validation error:", err);

    res.status(500).json({
      message: "ファイル検証中にエラーが発生しました",
    });
  }
}

module.exports = validateAttachments;
