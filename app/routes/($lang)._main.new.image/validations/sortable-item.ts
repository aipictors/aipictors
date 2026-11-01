import { object, number, nullable, string, optional, boolean } from "valibot"

/**
 * ドラッグ可能なアイテムの型を定義
 */
export const vSortableItem = object({
  id: number(),
  /**
   * 画像のURLなど
   */
  content: nullable(string()),
  /**
   * コンテンツが編集されたかどうか
   */
  isContentEdited: optional(boolean()),
  /**
   * アップロードしたファイルの名前（並べ替えの目印。投稿には含めない）
   */
  fileName: optional(nullable(string())),
})
