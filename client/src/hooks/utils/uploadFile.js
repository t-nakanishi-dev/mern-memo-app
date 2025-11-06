// src/hooks/utils/uploadFile.js

// Firebase Storage の操作に必要な関数をインポート
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ストレージインスタンスをインポート（firebase.js で初期化済み）
import { storage } from "../../firebase";

/**
 * Firebase Storage にファイルをアップロードしてダウンロード URL を返す関数
 *
 * @param {File} file - ブラウザで選択された File オブジェクト
 * @param {string} [folder="uploads"] - ストレージ内の保存先フォルダ名（デフォルト uploads）
 * @returns {Promise<string>} - アップロード完了後のダウンロード URL
 */
export const uploadFile = async (file, folder = "uploads") => {
  // ユニークなファイル名を生成（現在のタイムスタンプ + 元のファイル名）
  const fileName = `${Date.now()}_${file.name}`;

  // Storage 内の参照（どのフォルダのどの名前で保存するか）を作成
  const storageRef = ref(storage, `${folder}/${fileName}`);

  // 実際にファイルを Firebase Storage にアップロード
  await uploadBytes(storageRef, file);

  // アップロード完了後に、そのファイルのダウンロード URL を取得
  const downloadURL = await getDownloadURL(storageRef);

  // ダウンロード URL を呼び出し元に返す
  return downloadURL;
};
