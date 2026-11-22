import { RequestsApiError } from "~/lib/requests-api"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"

/**
 * 募集リクエスト（コンペ型）の API（/api/open-requests）。
 * 依頼者が報酬（購入したプレミアムコイン）を出して募集 → 誰でも画像で提案 → 依頼者が 1 件を採用。
 * 締切までに採用がなければ、いいねが一番多い提案を自動で採用（提案がなければ全額返却）
 */

export type OpenRequestStatus =
  | "OPEN"
  | "AWARDED"
  | "AUTO_AWARDED"
  | "ADMIN_AWARDED"
  | "EXPIRED"
  | "CANCELED"
  | "ADMIN_CANCELED"

export type OpenRequestComment = {
  id: string
  proposalId: string
  userId: string
  body: string
  createdAt: number
}

export type OpenRequestProposal = {
  id: string
  requestId: string
  userId: string
  imageUrls: string[]
  workId: string | null
  message: string
  status: "ACTIVE" | "WITHDRAWN" | "HIDDEN"
  likeCount: number
  commentCount: number
  isAwarded: boolean
  isLikedByMe: boolean
  createdAt: number
  comments: OpenRequestComment[]
}

export type OpenRequest = {
  id: string
  requesterUserId: string
  isMine: boolean
  title: string
  body: string
  referenceImageUrls: string[]
  isR18: boolean
  rewardCoins: number
  status: OpenRequestStatus
  deadlineAt: number
  showcaseAllowed: boolean
  awardedProposalId: string | null
  awardedUserId: string | null
  awardedAt: number | null
  proposalCount: number
  isHidden: boolean
  closedAt: number | null
  createdAt: number
  updatedAt: number
  /** 一覧だけ: 採用された提案、なければいいねの多い提案の画像（3 枚まで） */
  previewImageUrls?: string[]
  /** 詳細だけ */
  proposals?: OpenRequestProposal[]
  myProposalCount?: number
  settlement?: {
    feeCoins: number
    earnedCoins: number
    premiumCoins: number
  } | null
}

export type OpenRequestConfig = {
  enabled: boolean
  feePpm: number
  minCoins: number
  maxCoins: number
  deadlineMinDays: number
  deadlineMaxDays: number
  deadlineDefaultDays: number
  proposalsPerUser: number
  /** ログインしているとき: 報酬に使えるプレミアムコイン（購入した分）と、出している募集の数 */
  account: { paidPremiumBalance: number; openCount: number } | null
}

export type OpenRequestShowcaseItem = {
  requestId: string
  title: string
  rewardCoins: number
  awardedAt: number
  isR18: boolean
  proposalId: string
  imageUrls: string[]
  workId: string | null
}

const parse = async <T>(response: Response): Promise<T> => {
  const json = (await response.json().catch(() => null)) as {
    error: string | null
    data: T
  } | null
  if (!response.ok || !json || json.error) {
    throw new RequestsApiError(
      json?.error ?? `HTTP_${response.status}`,
      response.status,
    )
  }
  return json.data
}

export const openRequestsGet = async <T>(
  params: Record<string, string | number | boolean | null | undefined>,
): Promise<T> => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue
    search.set(key, String(value))
  }
  const headers = await getViewerRequestHeaders().catch(() => ({}))
  return parse<T>(
    await fetch(`/api/open-requests?${search.toString()}`, { headers }),
  )
}

export const openRequestsPost = async <T>(
  body: Record<string, unknown>,
): Promise<T> => {
  const headers = await getViewerRequestHeaders({
    includeJsonContentType: true,
  })
  return parse<T>(
    await fetch("/api/open-requests", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }),
  )
}

/** エラーの文言（isEnglish で英語） */
export const openRequestErrorMessage = (error: unknown, isEnglish = false) => {
  const code = error instanceof RequestsApiError ? error.code : ""
  const messages: Record<string, { ja: string; en: string }> = {
    INSUFFICIENT_COINS: {
      ja: "購入したプレミアムコインが足りません",
      en: "Not enough purchased premium coins",
    },
    INVALID_REWARD: {
      ja: "報酬は 100〜100,000 コインで指定してください",
      en: "The reward must be between 100 and 100,000 coins",
    },
    TITLE_REQUIRED: {
      ja: "タイトルを入れてください",
      en: "Please enter a title",
    },
    BODY_REQUIRED: {
      ja: "内容を書いてください",
      en: "Please write the details",
    },
    TOO_MANY_OPEN: {
      ja: "同時に出せる募集は 5 件までです",
      en: "You can have up to 5 open requests",
    },
    SELF_PROPOSAL: {
      ja: "自分の募集には提案できません",
      en: "You cannot submit to your own request",
    },
    TOO_MANY_PROPOSALS: {
      ja: "1 つの募集に提案できるのは 3 件までです",
      en: "You can submit up to 3 entries per request",
    },
    IMAGE_REQUIRED: {
      ja: "画像を選んでください",
      en: "Please select an image",
    },
    WORK_NOT_FOUND: {
      ja: "その作品は使えません（自分の公開中の作品だけ選べます）",
      en: "That work cannot be used (only your own public works)",
    },
    R18_NOT_ALLOWED: {
      ja: "全年齢の募集に R18 の作品は出せません",
      en: "R18 works cannot be submitted to an all-ages request",
    },
    CLOSED: { ja: "この募集は締め切られました", en: "This request is closed" },
    HAS_PROPOSALS: {
      ja: "提案が届いたあとは取り下げられません",
      en: "You cannot cancel after receiving entries",
    },
    SELF_LIKE: {
      ja: "自分の提案にはいいねできません",
      en: "You cannot like your own entry",
    },
    BLOCKED: {
      ja: "このユーザーには操作できません",
      en: "You cannot interact with this user",
    },
    TOO_MANY_COMMENTS: {
      ja: "この提案のコメントは上限に達しました",
      en: "This entry has reached the comment limit",
    },
    INVALID_STATE: {
      ja: "状態が変わりました。画面を更新してください",
      en: "The status has changed. Please reload the page",
    },
    REASON_REQUIRED: {
      ja: "理由を書いてください",
      en: "Please enter a reason",
    },
    DISABLED: {
      ja: "募集リクエストはいま停止中です",
      en: "Open requests are currently paused",
    },
    NOT_FOUND: {
      ja: "この募集は見つかりませんでした",
      en: "This request could not be found",
    },
    Unauthorized: { ja: "ログインしてください", en: "Please log in" },
  }
  const pair = messages[code] ?? {
    ja: "うまくいきませんでした。時間をおいてお試しください",
    en: "Something went wrong. Please try again later",
  }
  return isEnglish ? pair.en : pair.ja
}

export const isOpenRequestAwarded = (status: OpenRequestStatus) =>
  status === "AWARDED" ||
  status === "AUTO_AWARDED" ||
  status === "ADMIN_AWARDED"

export const openRequestStatusLabel = (
  status: OpenRequestStatus,
  isEnglish = false,
) => {
  const labels: Record<OpenRequestStatus, { ja: string; en: string }> = {
    OPEN: { ja: "募集中", en: "Open" },
    AWARDED: { ja: "採用済み", en: "Awarded" },
    AUTO_AWARDED: { ja: "採用済み（自動）", en: "Awarded (auto)" },
    ADMIN_AWARDED: { ja: "採用済み", en: "Awarded" },
    EXPIRED: { ja: "終了（返却済み）", en: "Ended (refunded)" },
    CANCELED: { ja: "取り下げ", en: "Canceled" },
    ADMIN_CANCELED: { ja: "運営がキャンセル", en: "Canceled by admin" },
  }
  return isEnglish ? labels[status].en : labels[status].ja
}

/** 通知の requestId: マイナスなら募集リクエスト（/requests/open/:id） */
export const requestNotificationPath = (
  requestId: string | null | undefined,
) => {
  if (!requestId) return "/requests/manage"
  return requestId.startsWith("-")
    ? `/requests/open/${requestId.slice(1)}`
    : `/requests/${requestId}`
}

/** 作品の URL（/posts/123）か ID から作品の ID を取り出す */
export const parseWorkId = (value: string) => {
  const trimmed = value.trim()
  if (/^\d+$/.test(trimmed)) return trimmed
  const match = trimmed.match(/\/posts\/(\d+)/)
  return match ? match[1] : null
}
