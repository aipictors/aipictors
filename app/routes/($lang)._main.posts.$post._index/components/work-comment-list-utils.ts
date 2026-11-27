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

export type PremiumConfirmResponse = {
  error: string | null
  data: {
    reflected: boolean
    created: boolean
    totalCoins?: number
    paymentStatus?: string | null
  } | null
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
