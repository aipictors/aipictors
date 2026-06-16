import { Link } from "@remix-run/react"
import { useEffect, useState } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar"
import { useTranslation } from "~/hooks/use-translation"
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

const toUserPath = (user: SupportUserSummary) =>
  `/users/${user.login ?? user.id}`

const toUserLabel = (user: SupportUserSummary) =>
  user.name ?? user.login ?? user.id

export function HomeRecentSupportHistory() {
  const t = useTranslation()
  const [items, setItems] = useState<SupportHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)

        // 最新の推し履歴を取得
        const historyRes = await fetch("/api/coins/support/recent?limit=3", {
          method: "GET",
        })

        const historyJson = (await historyRes.json()) as SupportHistoryResponse
        if (historyRes.ok && !historyJson.error && historyJson.data) {
          setItems(Array.isArray(historyJson.data.items) ? historyJson.data.items : [])
        } else {
          console.warn("History API error:", historyJson.error, "Status:", historyRes.status)
          setItems([])
        }
      } catch (e) {
        console.error("Support history fetch error:", e)
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  if (isLoading) {
    return null
  }

  // データがない場合でも、常にコンテナは表示する
  return (
    <div className="space-y-1">
      {/* 最新の推し履歴 */}
      <div className="rounded border bg-card px-2 py-1">
        <div className="mb-0.5 flex items-center justify-between gap-1">
          <p className="text-[11px] font-normal text-muted-foreground">
            {t("最新の推し", "Latest support")}
          </p>
        </div>

        {items.length > 0 ? (
          <div className="space-y-0.5">
            {items.slice(0, 3).map((item, index) => (
              <div
                key={`${item.createdAt}-${item.senderUser.id}-${index}`}
                className="grid max-w-[28rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 text-[10px]"
              >
                <div className="min-w-0 flex items-center gap-1 truncate">
                  <Link
                    to={toUserPath(item.senderUser)}
                    className="shrink-0 transition-opacity hover:opacity-70"
                    title={toUserLabel(item.senderUser)}
                  >
                    <Avatar className="size-4">
                      <AvatarImage
                        src={withIconUrlFallback(item.senderUser.iconUrl)}
                        alt={toUserLabel(item.senderUser)}
                      />
                      <AvatarFallback />
                    </Avatar>
                  </Link>
                  <Link
                    to={toUserPath(item.senderUser)}
                    className="truncate transition-opacity hover:opacity-70 text-muted-foreground"
                    title={toUserLabel(item.senderUser)}
                  >
                    {toUserLabel(item.senderUser)}
                  </Link>
                  <span className="shrink-0 text-muted-foreground">→</span>
                  <Link
                    to={toUserPath(item.recipientUser)}
                    className="shrink-0 transition-opacity hover:opacity-70"
                    title={toUserLabel(item.recipientUser)}
                  >
                    <Avatar className="size-4">
                      <AvatarImage
                        src={withIconUrlFallback(item.recipientUser.iconUrl)}
                        alt={toUserLabel(item.recipientUser)}
                      />
                      <AvatarFallback />
                    </Avatar>
                  </Link>
                  <Link
                    to={toUserPath(item.recipientUser)}
                    className="truncate transition-opacity hover:opacity-70 text-muted-foreground"
                    title={toUserLabel(item.recipientUser)}
                  >
                    {toUserLabel(item.recipientUser)}
                  </Link>
                </div>

                <span className="font-medium text-foreground whitespace-nowrap text-right">
                  {item.ptAmount.toLocaleString()}pt
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground py-0.5">
            {t("推し履歴なし", "No support history")}
          </p>
        )}
      </div>
    </div>
  )
}
