/**
 * プレミアムコインの推しはオリジナル作品（オリジナル系のタグ付き）への推しだけ。
 * 作品を通さない推し（プロフィールの推すボタン）はフリーコインだけ。
 * API は断るとき 403 { code: "PREMIUM_SUPPORT_ORIGINAL_ONLY" } を返す（作品のコメントの推しは GraphQL のエラー文で返る）
 */
import { isOriginalWork } from "~/utils/original-work-tags"

export const PREMIUM_SUPPORT_ORIGINAL_ONLY_CODE =
  "PREMIUM_SUPPORT_ORIGINAL_ONLY"

/** API の日本語のエラー文（GraphQL を通るとコードが落ちて文だけ届く） */
const PREMIUM_SUPPORT_ORIGINAL_ONLY_MESSAGE_PART = "オリジナル作品"

/**
 * プレミアムコインで推せるか。作品の推しでオリジナル系のタグが付いているときだけ
 */
export function canSupportWithPremium(work: {
  workId?: string | null
  tagNames?: readonly string[] | null
}) {
  if (!work.workId) return false
  return isOriginalWork(work.tagNames)
}

/**
 * API・GraphQL のエラーが「プレミアムはオリジナル作品だけ」か
 */
export function isPremiumSupportOriginalOnlyError(error: {
  code?: string | null
  message?: string | null
}) {
  if (error.code === PREMIUM_SUPPORT_ORIGINAL_ONLY_CODE) return true
  const message = error.message ?? ""
  return (
    message.includes(PREMIUM_SUPPORT_ORIGINAL_ONLY_CODE) ||
    (message.includes("プレミアムコイン") &&
      message.includes(PREMIUM_SUPPORT_ORIGINAL_ONLY_MESSAGE_PART))
  )
}
