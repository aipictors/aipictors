import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import type { UserAvatarFramePresentation } from "~/utils/user-avatar-frame"

// コメント
export type Comment = {
  id: string
  text: string
  createdAt: number
  isLiked: boolean
  isMuted: boolean
  isSensitive?: boolean
  likesCount: number
  isWorkOwnerLiked: boolean
  user: {
    id: string
    name: string
    isOfficial?: boolean
    isModerator?: boolean
    iconUrl: string
    avatarFrame?: UserAvatarFramePresentation | null
  }
  sticker: {
    image: {
      downloadURL: string
    }
  }
  support?: {
    freeCoinAmount: number
    premiumCoinAmount: number
    totalPt: number
  } | null
}

// 返信コメント
export type ReplyComment = {
  replyTargetId: string
  id: string
  text: string
  createdAt: number
  isLiked: boolean
  isMuted: boolean
  isSensitive?: boolean
  likesCount: number
  isWorkOwnerLiked: boolean
  user: {
    id: string
    name: string
    isOfficial?: boolean
    isModerator?: boolean
    iconUrl: string
    avatarFrame?: UserAvatarFramePresentation | null
  }
  sticker: {
    image: {
      downloadURL: string
    }
  }
}

export type CommentSupportDraft = {
  freeCoinAmount: number
  premiumCoinAmount: number
  totalPt: number
}

export type PremiumConfirmResponse = {
  error: string | null
  data: {
    reflected: boolean
    created: boolean
    totalCoins?: number
    paymentStatus?: string | null
  } | null
}

/**
 * 推しコインのボタンで足す量。よく使われるのは 10〜100pt くらい（プレミアムは 1 枚 10pt）
 * 以前は 100/500/1000 でスマホでは入力が面倒、桁を間違えて多く送ってしまうことがあった
 */
export const SUPPORT_FREE_COIN_STEPS = [10, 30, 50, 100] as const
export const SUPPORT_PREMIUM_COIN_STEPS = [1, 3, 5, 10] as const

/** これ以上の pt を送るときは確認する（桁の間違いを防ぐ） */
export const SUPPORT_CONFIRM_THRESHOLD_PT = 1000

export const calculateCommentSupportDraft = (
  freeCoinAmount: number,
  premiumCoinAmount: number,
  freeCoinBalance: number,
  premiumCoinBalance: number,
) => {
  if (!Number.isInteger(freeCoinAmount) || freeCoinAmount < 0) return null
  if (!Number.isInteger(premiumCoinAmount) || premiumCoinAmount < 0) return null
  if (
    freeCoinAmount > freeCoinBalance ||
    premiumCoinAmount > premiumCoinBalance
  ) {
    return null
  }

  const totalCoins = freeCoinAmount + premiumCoinAmount

  if (totalCoins <= 0) {
    return null
  }

  return {
    freeCoinAmount,
    premiumCoinAmount,
    totalPt: freeCoinAmount + premiumCoinAmount * 10,
  } satisfies CommentSupportDraft
}

// 日本時間の日付を計算する関数
export const getJSTDate = () => {
  const date = new Date()
  const utcOffset = date.getTimezoneOffset() * 60000 // 分単位のオフセットをミリ秒に変換
  const jstOffset = 9 * 60 * 60 * 1000 // JSTはUTC+9
  const jstDate = new Date(date.getTime() + utcOffset + jstOffset)
  return jstDate
}

/** 決済から戻ったときの URL のパラメータを消す */
export const clearPremiumCheckoutSearchParams = () => {
  if (typeof window === "undefined") {
    return
  }

  const nextUrl = new URL(window.location.href)
  nextUrl.searchParams.delete("checkout")
  nextUrl.searchParams.delete("session_id")
  window.history.replaceState(
    window.history.state,
    "",
    `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`,
  )
}

/** コインの残高を取る。取れなければ null */
export const fetchCoinSummary = async () => {
  const headers = await getViewerRequestHeaders({
    includeJsonContentType: true,
  })
  const res = await fetch("/api/coins/summary", {
    method: "GET",
    headers,
  })

  const json = (await res.json()) as {
    error?: string
    data?: {
      freeBalance?: number
      premiumBalance?: number
    }
  }

  if (!res.ok || json.error || !json.data) {
    return null
  }

  return {
    freeBalance: json.data.freeBalance ?? 0,
    premiumBalance: json.data.premiumBalance ?? 0,
  }
}
