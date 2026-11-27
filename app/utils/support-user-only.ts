/**
 * 作品への推しは、フリーコイン・プレミアムコインとも終了した。推しはユーザーへの推し（プロフィール・作品ページの「作者を推す」）だけ。
 * API は作品付きの推し（workId 付き・作品のコメントの推し）を 403 { code: "SUPPORT_USER_ONLY" } で断る
 * （作品のコメントの推しは GraphQL のエラー文で返る）
 */

export const SUPPORT_USER_ONLY_CODE = "SUPPORT_USER_ONLY"

/** API の日本語のエラー文の一部（GraphQL を通るとコードが落ちて文だけ届く） */
const SUPPORT_USER_ONLY_MESSAGE_PART = "作品への推しは終了しました"

/**
 * API・GraphQL のエラーが「作品への推しは終了（推しはユーザーへの推しだけ）」か
 */
export function isSupportUserOnlyError(error: {
  code?: string | null
  message?: string | null
}) {
  if (error.code === SUPPORT_USER_ONLY_CODE) return true
  const message = error.message ?? ""
  return (
    message.includes(SUPPORT_USER_ONLY_CODE) ||
    message.includes(SUPPORT_USER_ONLY_MESSAGE_PART)
  )
}
