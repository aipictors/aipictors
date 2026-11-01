/**
 * 生成画面のお知らせ（KV の generation-notice に置く JSON）
 *
 * - maintenance: 生成を止めている。生成ボタンを押しても送らず、お知らせだけ出す
 * - unstable: 作業中で不安定。押したときに一度だけ確認を出し、そのまま生成もできる
 * - changed: 仕組みを変えた直後。以前と違う結果になることがある旨を一度だけ出す
 */

export const GENERATION_NOTICE_KV_KEY = "generation-notice"

export type GenerationNoticeKind = "maintenance" | "unstable" | "changed"

export type GenerationNotice = {
  /** 変えるたびに新しくする（同じ id は一度確認したら出さない） */
  id: string
  kind: GenerationNoticeKind
  /** 省略時は kind ごとの文言 */
  title?: string
  message?: string
  /** 表示する期間（ISO 8601、省略可） */
  startsAt?: string
  endsAt?: string
  /** 詳しいお知らせなどへのリンク */
  linkUrl?: string
  linkLabel?: string
}

const KINDS: GenerationNoticeKind[] = ["maintenance", "unstable", "changed"]

const optionalString = (value: unknown) =>
  typeof value === "string" && value.length > 0 ? value : undefined

export const parseGenerationNotice = (
  raw: string | null,
): GenerationNotice | null => {
  if (!raw) return null
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return null
  }
  if (!value || typeof value !== "object") return null
  const v = value as Record<string, unknown>
  if (typeof v.id !== "string" || v.id.length === 0) return null
  if (!KINDS.includes(v.kind as GenerationNoticeKind)) return null
  const linkUrl = optionalString(v.linkUrl)
  return {
    id: v.id,
    kind: v.kind as GenerationNoticeKind,
    title: optionalString(v.title),
    message: optionalString(v.message),
    startsAt: optionalString(v.startsAt),
    endsAt: optionalString(v.endsAt),
    // 自サイトか https のリンクだけ
    linkUrl:
      linkUrl && (linkUrl.startsWith("/") || linkUrl.startsWith("https://"))
        ? linkUrl
        : undefined,
    linkLabel: optionalString(v.linkLabel),
  }
}

/** 確認済みのお知らせ id（端末ごと） */
export const GENERATION_NOTICE_ACK_STORAGE_KEY = "generation.notice.ackId"
