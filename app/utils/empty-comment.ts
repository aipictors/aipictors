/**
 * 本文もスタンプも推しもないコメント（一覧に出さない）。
 * 作品へのプレミアムの推し（作品からはプレミアムで推せない）はサーバーが support を null で返すので、
 * 推しだけで送られたコメントは中身のない行になる
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
