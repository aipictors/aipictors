import type { FragmentOf } from "gql.tada"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import type { WorkCommentFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-fragment"
import type { CoinSummarySupportTarget } from "~/utils/fetch-coin-summary-shared"

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
 * 推しコインのボタンで足す量。フリーはよく使われる 10〜100 枚くらい。
 * プレミアムは少額の 1〜10 枚（−/＋ と入力で色の区切り 500・1,000・3,000 枚も選べる）
 */
export const SUPPORT_FREE_COIN_STEPS = [10, 20, 30, 50, 100] as const
export const SUPPORT_PREMIUM_COIN_STEPS = [1, 2, 3, 5, 10] as const

/**
 * これ以上の枚数を送るときは確認する（桁の間違いを防ぐ）。
 * プレミアムのよく使う 100・500 枚で毎回は聞かず、1,000 枚から
 */
export const SUPPORT_CONFIRM_THRESHOLD_FREE = 1000
export const SUPPORT_CONFIRM_THRESHOLD_PREMIUM = 1000

export const needsSupportConfirm = (draft: CommentSupportDraft) =>
  draft.freeCoinAmount >= SUPPORT_CONFIRM_THRESHOLD_FREE ||
  draft.premiumCoinAmount >= SUPPORT_CONFIRM_THRESHOLD_PREMIUM

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
/**
 * 送信直後の仮表示のうち、一覧に届いたものと非表示にしたものを除く
 */
export const excludeShownComments = <T extends { id: string }>(
  comments: T[],
  loadedCommentIds: string[],
  hiddenCommentIds: string[],
): T[] => {
  const excludedIds = new Set([...loadedCommentIds, ...hiddenCommentIds])
  return comments.filter((comment) => !excludedIds.has(comment.id))
}

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

/** コインの残高を取る。取れなければ null。supportTargetUserId を渡すと推す相手の状態も同じ応答で受け取る */
export const fetchCoinSummary = async (supportTargetUserId?: string | null) => {
  const headers = await getViewerRequestHeaders({
    includeJsonContentType: true,
  })
  const url = supportTargetUserId
    ? `/api/coins/summary?supportTo=${encodeURIComponent(supportTargetUserId)}`
    : "/api/coins/summary"
  const res = await fetch(url, {
    method: "GET",
    headers,
  })

  const json = (await res.json()) as {
    error?: string
    data?: {
      freeBalance?: number
      premiumBalance?: number
      supportTarget?: CoinSummarySupportTarget
    }
  }

  if (!res.ok || json.error || !json.data) {
    return null
  }

  return {
    freeBalance: json.data.freeBalance ?? 0,
    premiumBalance: json.data.premiumBalance ?? 0,
    supportTarget: json.data.supportTarget ?? null,
  }
}
