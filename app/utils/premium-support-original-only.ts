/**
 * 作品への推しのプレミアムコインはオリジナル作品だけ（運営の判定があればそれ、未判定ならオリジナル系のタグ付き）。
 * 作品を通さない、ユーザーへの推し（プロフィールの推すボタン）はどんな作品を投稿している人にもプレミアムで推せる。
 * API は断るとき 403 { code: "PREMIUM_SUPPORT_ORIGINAL_ONLY" } を返す（作品のコメントの推しは GraphQL のエラー文で返る）
 */
import type { WorkOriginalJudgment } from "~/lib/work-original-judgment"
import { isOriginalWork } from "~/utils/original-work-tags"

export const PREMIUM_SUPPORT_ORIGINAL_ONLY_CODE =
  "PREMIUM_SUPPORT_ORIGINAL_ONLY"

/** API の日本語のエラー文（GraphQL を通るとコードが落ちて文だけ届く） */
const PREMIUM_SUPPORT_ORIGINAL_ONLY_MESSAGE_PART = "オリジナル作品"

/**
 * プレミアムコインで推せるか。作品を通さないユーザーへの推しはいつも可、
 * 作品の推しは運営の判定（originalJudgment）に従い、未判定ならオリジナル系のタグが付いているときだけ
 */
export function canSupportWithPremium(work: {
  workId?: string | null
  tagNames?: readonly string[] | null
  originalJudgment?: WorkOriginalJudgment | null
}) {
  if (!work.workId) return true
  if (work.originalJudgment === "ORIGINAL") return true
  if (work.originalJudgment === "FAN_WORK") return false
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
