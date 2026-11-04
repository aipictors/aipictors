import type { FragmentOf } from "gql.tada"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import type { WorkCommentFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-fragment"

// 投稿直後に一覧へ足すコメント。サーバーが返した内容をそのまま使う
export type Comment = FragmentOf<typeof WorkCommentFragment>

// 投稿直後に一覧へ足す返信
export type ReplyComment = Comment & {
  replyTargetId: string
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
