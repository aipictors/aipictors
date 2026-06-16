import { Link } from "@remix-run/react"
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { CoinIcon } from "~/components/coin-icon"
import { useTranslation } from "~/hooks/use-translation"
import {
  getViewerRequestHeaders,
  hasViewerRequestSession,
} from "~/lib/viewer-request-headers"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type SupportUserSummary = {
  id: string
  login: string | null
  name: string | null
  iconUrl: string | null
}

type SupportHistoryItem = {
  senderUser: SupportUserSummary
  recipientUser: SupportUserSummary
  coinType: "FREE" | "PREMIUM"
  coinAmount: number
  ptAmount: number
  createdAt: number
}

type SupportHistoryResponse = {
  error: string | null
  data: {
    items: SupportHistoryItem[]
  } | null
}

type SupportSummaryData = {
  weeklySentCoinAmount: number
  weeklyReceivedCoinAmount: number
  cumulativeSentCoins: number
  cumulativeReceivedCoins: number
}

type SupportSummaryResponse = {
  error: string | null
  data: SupportSummaryData | null
}

const jstDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

const formatDateTime = (unix: number) =>
  jstDateTimeFormatter.format(new Date(unix * 1000)).replace(/\//g, "/")

const toUserPath = (user: SupportUserSummary) =>
  `/users/${user.login ?? user.id}`

export function HomeRecentSupportHistory() {
  const t = useTranslation()
  const [items, setItems] = useState<SupportHistoryItem[]>([])
  const [summary, setSummary] = useState<SupportSummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!hasViewerRequestSession()) {
        setItems([])
        setSummary(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const headers = await getViewerRequestHeaders({
          includeJsonContentType: true,
        })

        // 最新の推し履歴を取得
        const historyRes = await fetch("/api/coins/support/recent?limit=3", {
          method: "GET",
          headers,
        })

        const historyJson = (await historyRes.json()) as SupportHistoryResponse
        if (historyRes.ok && !historyJson.error && historyJson.data) {
          setItems(Array.isArray(historyJson.data.items) ? historyJson.data.items : [])
        } else {
          setItems([])
        }

        // コイン付与サマリーを取得
        const summaryRes = await fetch("/api/coins/support/summary", {
          method: "GET",
          headers,
        })

        const summaryJson = (await summaryRes.json()) as SupportSummaryResponse
        if (summaryRes.ok && !summaryJson.error && summaryJson.data) {
          setSummary(summaryJson.data)
        } else {
          setSummary(null)
        }
      } catch {
        setItems([])
        setSummary(null)
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  if (isLoading || (items.length === 0 && !summary)) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* 最新の推し履歴 */}
      {items.length > 0 && (
        <div className="rounded-lg border bg-card px-3 py-2">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="font-semibold text-xs">
              {t("最新の推し", "Latest support")}
            </p>
          </div>

          <div className="space-y-1">
            {items.map((item, index) => (
              <div
                key={`${item.createdAt}-${item.senderUser.id}-${index}`}
                className="flex items-center justify-between rounded-md border px-2 py-1"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <Link
                    to={toUserPath(item.senderUser)}
                    className="transition-opacity hover:opacity-80"
                    title={
                      item.senderUser.name ??
                      item.senderUser.login ??
                      item.senderUser.id
                    }
                  >
                    <Avatar className="size-6">
                      {item.senderUser.iconUrl && (
                        <AvatarImage
                          src={withIconUrlFallback(item.senderUser.iconUrl)}
                          alt={
                            item.senderUser.name ??
                            item.senderUser.login ??
                            item.senderUser.id
                          }
                        />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {(
                          item.senderUser.name ??
                          item.senderUser.login ??
                          "U"
                        ).slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <ArrowRight className="size-3 text-muted-foreground" />

                  <Link
                    to={toUserPath(item.recipientUser)}
                    className="transition-opacity hover:opacity-80"
                    title={
                      item.recipientUser.name ??
                      item.recipientUser.login ??
                      item.recipientUser.id
                    }
                  >
                    <Avatar className="size-6">
                      {item.recipientUser.iconUrl && (
                        <AvatarImage
                          src={withIconUrlFallback(item.recipientUser.iconUrl)}
                          alt={
                            item.recipientUser.name ??
                            item.recipientUser.login ??
                            item.recipientUser.id
                          }
                        />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {(
                          item.recipientUser.name ??
                          item.recipientUser.login ??
                          "U"
                        ).slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </div>

                <Link
                  to={toUserPath(item.recipientUser)}
                  className="ml-2 min-w-0 flex-1 truncate text-right text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="mr-2 font-semibold text-foreground">
                    {item.ptAmount.toLocaleString()}pt
                  </span>
                  <span>{formatDateTime(item.createdAt)}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* コイン付与履歴サマリー */}
      {summary && (
        <div className="rounded-lg border bg-card px-3 py-2">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="font-semibold text-xs">
              {t("コイン付与状況", "Coin activity")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* 送信 */}
            <div className="rounded-md border px-2 py-1">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <TrendingUp className="size-3" />
                <span>{t("送信", "Sent")}</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className="font-semibold text-sm">
                  {summary.weeklySentCoinAmount.toLocaleString()}
                </span>
                <CoinIcon className="size-3" />
              </div>
              <div className="text-[10px] text-muted-foreground">
                {t("週", "this week")}
              </div>
            </div>

            {/* 受信 */}
            <div className="rounded-md border px-2 py-1">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <TrendingDown className="size-3" />
                <span>{t("受信", "Received")}</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className="font-semibold text-sm">
                  {summary.weeklyReceivedCoinAmount.toLocaleString()}
                </span>
                <CoinIcon className="size-3" />
              </div>
              <div className="text-[10px] text-muted-foreground">
                {t("週", "this week")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
