import type { CommentAchievementBadge } from "~/components/achievements/comment-achievement-chip"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"

/**
 * ミニゲーム「ぴくたーちゃんラン」のチャットとランキングの通信（/api/pictor-run/:op）
 */

export type PictorRunUser = {
  id: string
  name: string
  login: string | null
  iconUrl: string | null
  badge: CommentAchievementBadge | null
}

export type PictorRunMention = { userId: string; name: string }

export type PictorRunMessage = {
  id: string
  user: PictorRunUser
  body: string
  stickerId: string | null
  stickerUrl: string | null
  replyTo: {
    id: string
    userId: string | null
    name: string | null
    excerpt: string | null
  } | null
  mentions: PictorRunMention[]
  /** "discord" = Discord のチャンネルで書かれたもの */
  source?: string | null
  createdAt: number
}

export type PictorRunRankingPeriod = "week" | "all"

export type PictorRunRanking = {
  items: { rank: number; user: PictorRunUser; score: number; coins: number }[]
  me: { rank: number; score: number } | null
}

export class PictorRunApiError extends Error {
  code: string
  constructor(code: string) {
    super(code)
    this.code = code
  }
}

const call = async <T>(
  op: string,
  body: Record<string, unknown>,
  auth: "required" | "optional",
): Promise<T> => {
  let headers: Record<string, string> = { "content-type": "application/json" }
  try {
    headers = await getViewerRequestHeaders({ includeJsonContentType: true })
  } catch (error) {
    if (auth === "required") throw new PictorRunApiError("login_required")
    void error
  }
  const response = await fetch(`/api/pictor-run/${op}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  const json = (await response.json().catch(() => null)) as {
    error?: string | null
    data?: T
  } | null
  if (!response.ok || !json || json.error || json.data === undefined) {
    throw new PictorRunApiError(json?.error ?? "network")
  }
  return json.data
}

export const fetchPictorRunMessages = (props: { afterId?: string }) =>
  call<{ messages: PictorRunMessage[]; deletedIds: string[] }>(
    "messages",
    { afterId: props.afterId },
    "optional",
  )

export const postPictorRunMessage = (props: {
  body: string
  stickerId?: string
  stickerUrl?: string
  replyToId?: string
  mentions: PictorRunMention[]
}) => call<{ message: PictorRunMessage }>("post", props, "required")

export const deletePictorRunMessage = (messageId: string) =>
  call<{ deleted: boolean }>("delete", { messageId }, "required")

export const submitPictorRunScore = (props: {
  score: number
  coins: number
  durationMs: number
}) =>
  call<{ best: number; isNewBest: boolean; rank: number }>(
    "score",
    props,
    "required",
  )

export const fetchPictorRunRanking = (period: PictorRunRankingPeriod) =>
  call<PictorRunRanking>("ranking", { period }, "optional")

/**
 * 背景の額ぶちに飾る、新しく投稿された作品の画像
 */
export type PictorRunArtwork = {
  id: string
  imageUrl: string
  title: string
  likesCount: number
  userId: string
  userName: string
}

export const fetchPictorRunArtworks = async (): Promise<PictorRunArtwork[]> => {
  const response = await fetch("/api/pictor-run/works")
  const json = (await response.json().catch(() => null)) as {
    data?: { works?: Partial<PictorRunArtwork>[] }
  } | null
  return (json?.data?.works ?? []).flatMap((work) =>
    work.id && work.imageUrl
      ? [
          {
            id: work.id,
            imageUrl: work.imageUrl,
            title: work.title ?? "",
            likesCount: work.likesCount ?? 0,
            userId: work.userId ?? "",
            userName: work.userName ?? "",
          },
        ]
      : [],
  )
}
