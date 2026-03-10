// src/hooks/utils/uploadFile.ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase"; // エイリアスが使えていない場合は相対パスに変更
import type { Attachment } from "@/types/api";

/**
 * 単一ファイルをFirebase Storageにアップロードし、公開URLを返す
 *
 * @param file - アップロード対象のFileオブジェクト
 * @param folder - 保存先フォルダ（例: "memos", "avatars"）デフォルト "uploads"
 * @param prefix - ファイル名先頭に付与する任意の文字列（例: memoId_）
 * @returns ダウンロード可能な公開URL
 * @throws Error アップロード失敗時
 */
export async function uploadFile(
  file: File,
  folder: string = "uploads",
  prefix: string = ""
): Promise<string> {
  if (!file) {
    throw new Error("ファイルが指定されていません");
  }

  const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const pathSegments = [folder];
  if (prefix) pathSegments.push(prefix);
  pathSegments.push(safeFileName);

  const storagePath = pathSegments.join("/");
  const storageRef = ref(storage, storagePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error: unknown) {
    console.error("Firebase Storage アップロードエラー:", error);
    const message =
      error instanceof Error ? error.message : "ファイルアップロードに失敗しました";
    throw new Error(message);
  }
}

/**
 * 複数ファイルを並列でアップロードし、Attachment[] を返す
 * MemoForm などのフォームで一括処理する際に便利
 *
 * @param files - アップロードするFile配列
 * @param folder - 保存先フォルダ
 * @param prefix - 共通プレフィックス（例: memoId）
 * @returns Attachment型の配列（url, name, type を含む）
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: string = "uploads",
  prefix: string = ""
): Promise<Attachment[]> {
  if (files.length === 0) return [];

  const promises = files.map(async (file) => {
    const url = await uploadFile(file, folder, prefix);
    return {
      url,
      name: file.name,
      type: file.type,
      // size: file.size,               // 必要なら追加
      // uploadedAt: new Date().toISOString(), // クライアント側で付与する場合
    } satisfies Attachment;
  });

  return Promise.all(promises);
}