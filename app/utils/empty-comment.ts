/**
 * 本文もスタンプも推しもないコメント（一覧に出さない）。
 * 作品ページのコメント欄は推しを読まない（作品への推しは終了し、過去の推し付きコメントも本文だけで出す）ので、
 * 推しだけで送られた過去のコメントは中身のない行として出さない
 */
export function isEmptyComment(comment: {
  text?: string | null
  sticker?: unknown
  stampId?: number | null
  support?: { totalPt: number } | null
}) {
  if ((comment.text ?? "").trim().length > 0) return false
  if (comment.sticker) return false
  if (typeof comment.stampId === "number" && comment.stampId > 0) return false
  return (comment.support?.totalPt ?? 0) <= 0
}
