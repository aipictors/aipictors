import {
  boolean,
  nullable,
  number,
  object,
  optional,
  picklist,
  string,
} from "valibot"

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
  /**
   * 生成履歴から選んだ画像の nanoid（生成履歴の「投稿済み」の印に使う）
   */
  generationNanoid: optional(nullable(string())),
  /**
   * 投稿画面でかけたモザイク（元の画像・範囲・種類・濃さ）。content はかけた後の画像
   */
  mosaic: optional(
    nullable(
      object({
        source: string(),
        mask: string(),
        style: picklist(["mosaic", "black", "white", "blur"]),
        strength: number(),
        isAuto: boolean(),
      }),
    ),
  ),
})
