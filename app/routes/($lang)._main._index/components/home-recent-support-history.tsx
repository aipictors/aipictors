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
  isAnonymous: boolean
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

const toUserLabel = (
  user: SupportUserSummary,
  fallback = "",
) => user.name ?? user.login ?? user.id ?? fallback

export function HomeRecentSupportHistory() {
  const t = useTranslation()
  const [items, setItems] = useState<SupportHistoryItem[]>([])
  // SSR 時から読み込み中として領域を確保し、取得後のレイアウトシフトを防ぐ
  const [isLoading, setIsLoading] = useState(true)

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

  // 1 行（高さ固定）で横に並べる。以前は 3 行の枠だった
  return (
    <div className="flex h-8 items-center gap-2 overflow-hidden text-xs">
      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-[11px] text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
        {t("最新の推し", "Latest support")}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {!isLoading && items.length === 0 && (
          <span className="text-muted-foreground">
            {t("推し履歴なし", "No support history")}
          </span>
        )}
        {items.slice(0, 6).map((item, index) => (
          <span
            key={`${item.createdAt}-${item.senderUser.id}-${index}`}
            className="inline-flex shrink-0 items-center gap-1 text-muted-foreground"
          >
            {item.isAnonymous ? (
              <span>{t("匿名", "Anonymous")}</span>
            ) : (
              <Link
                to={toUserPath(item.senderUser)}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Avatar className="size-4">
                  <AvatarImage
                    src={withIconUrlFallback(item.senderUser.iconUrl)}
                    alt=""
                  />
                  <AvatarFallback />
                </Avatar>
                <span className="max-w-24 truncate">
                  {toUserLabel(item.senderUser)}
                </span>
              </Link>
            )}
            <span aria-hidden="true">→</span>
            <Link
              to={toUserPath(item.recipientUser)}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <Avatar className="size-4">
                <AvatarImage
                  src={withIconUrlFallback(item.recipientUser.iconUrl)}
                  alt=""
                />
                <AvatarFallback />
              </Avatar>
              <span className="max-w-24 truncate">
                {toUserLabel(item.recipientUser)}
              </span>
            </Link>
            <span className="font-medium text-foreground tabular-nums">
              {item.ptAmount.toLocaleString()}pt
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
