/**
 * プレミアムコイン（購入したコイン）での推しは、作品を通さないユーザーへの推し（プロフィールの推すボタン）だけ。
 * 作品からの推し（作品の推すボタン・コメントの推し）は、オリジナル作品でも二次創作でもフリーコインだけ。
 * API は断るとき 403 { code: "PREMIUM_SUPPORT_USER_ONLY" } を返す（作品のコメントの推しは GraphQL のエラー文で返る）。
 * 前の「作品からはオリジナル作品だけ」のときのコード PREMIUM_SUPPORT_ORIGINAL_ONLY も同じ扱いにする
 */

export const PREMIUM_SUPPORT_USER_ONLY_CODE = "PREMIUM_SUPPORT_USER_ONLY"

/** 前のルール（作品からはオリジナル作品だけ）のときのコード */
export const PREMIUM_SUPPORT_ORIGINAL_ONLY_CODE =
  "PREMIUM_SUPPORT_ORIGINAL_ONLY"

const PREMIUM_SUPPORT_REJECTED_CODES = [
  PREMIUM_SUPPORT_USER_ONLY_CODE,
  PREMIUM_SUPPORT_ORIGINAL_ONLY_CODE,
]

/**
 * API の日本語のエラー文の一部（GraphQL を通るとコードが落ちて文だけ届く）。
 * 新しい文「…作品ではなくユーザー（プロフィール）への推しだけ…」と前の文「…オリジナル作品…だけ」の両方
 */
const PREMIUM_SUPPORT_REJECTED_MESSAGE_PARTS = [
  "ユーザー（プロフィール）",
  "オリジナル作品",
]

/**
 * プレミアムコインで推せるか。作品を通さないユーザーへの推しだけ可、作品からの推しはいつも不可
 */
export function canSupportWithPremium(target: { workId?: string | null }) {
  return !target.workId
}

/**
 * API・GraphQL のエラーが「プレミアムはユーザーへの推しだけ」（前の「オリジナル作品だけ」を含む）か
 */
export function isPremiumSupportUserOnlyError(error: {
  code?: string | null
  message?: string | null
}) {
  if (error.code && PREMIUM_SUPPORT_REJECTED_CODES.includes(error.code)) {
    return true
  }
  const message = error.message ?? ""
  if (PREMIUM_SUPPORT_REJECTED_CODES.some((code) => message.includes(code))) {
    return true
  }
  return (
    message.includes("プレミアムコイン") &&
    PREMIUM_SUPPORT_REJECTED_MESSAGE_PARTS.some((part) =>
      message.includes(part),
    )
  )
}
