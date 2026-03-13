// server/utils/deleteStorageFiles.js

const { bucket } = require("./firebaseAdmin");

async function deleteStorageFiles(paths = []) {
  if (!paths.length) return;

  const promises = paths.map(async (path) => {
    try {
      await bucket.file(path).delete();
    } catch (err) {
      console.error("Storage削除失敗:", path, err.message);
    }
  });

  await Promise.all(promises);
}

module.exports = deleteStorageFiles;
