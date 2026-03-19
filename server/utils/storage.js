// server/utils/storage.js

const { bucket } = require("./firebaseAdmin");

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

module.exports = { deleteAttachmentsFromStorage };