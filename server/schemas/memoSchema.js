// server/schemas/memoSchema.js
const { z } = require("zod");

/**
 * メモ作成用スキーマ
 * - title/content は必須
 * - category は任意
 * - attachments は配列（任意）
 */
const memoCreateSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "内容は必須です"),
  category: z.string().optional(),
  attachments: z.array(z.any()).optional(),
});

module.exports = {
  memoCreateSchema,
};
