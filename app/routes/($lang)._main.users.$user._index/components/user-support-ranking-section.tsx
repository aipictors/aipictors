import { Link } from "@remix-run/react"
import { Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import { SupportRankAvatar } from "~/components/support-rank-avatar"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"

type SupportRankingItem = {
  rank: number
  userId: string
  coinAmount: number
  ptAmount: number
  transferCount: number
  iconUrl?: string | null
  userName?: string | null
}

type ApiResponse = {
  error: string | null
  data: {
    kind: "sent"
    weekStartDate: string
    items: SupportRankingItem[]
    totalCount: number
    offset: number
    limit: number
  } | null
}

const formatNumber = (value: number) => value.toLocaleString()

export function UserSupportRankingSection(props: {
  targetUserId: string
  targetUserLogin: string
  limit?: number
}) {
  const t = useTranslation()
  const limit = props.limit ?? 5
  const [items, setItems] = useState<SupportRankingItem[]>([])
  const [weekStartDate, setWeekStartDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/coins/support/rankings/public?kind=sent&recipientUserId=${encodeURIComponent(props.targetUserId)}&limit=${limit}`,
          { method: "GET" },
        )
        const json = (await response.json()) as ApiResponse
        if (!response.ok || json.error || !json.data) {
          setItems([])
          return
        }
        setItems(json.data.items)
        setWeekStartDate(json.data.weekStartDate)
      } catch {
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [limit, props.targetUserId])

  const weekLabel = weekStartDate
    ? new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(`${weekStartDate}T00:00:00+09:00`))
    : null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-sky-500" />
              <span>
                {t(
                  "このユーザーへの貢献度ランキング",
                  "Contribution ranking for this user",
                )}
              </span>
            </CardTitle>
            <p className="mt-1 text-muted-foreground text-sm">
              {t(
                "フリーコイン 1pt / プレミアムコイン 10pt で換算しています。",
                "Calculated as 1pt per free coin and 10pt per premium coin.",
              )}
            </p>
          </div>
          {weekLabel && (
            <p className="text-muted-foreground text-xs">{weekLabel}〜</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          [0, 1, 2].map((index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg border px-3 py-2 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t(
              "まだこのユーザーへの貢献データはありません。",
              "No contribution data for this user yet.",
            )}
          </p>
        ) : (
          items.map((row) => (
            <div
              key={`${row.rank}-${row.userId}`}
              className="flex items-center gap-3 rounded-lg border px-3 py-2"
            >
              <SupportRankAvatar
                rank={row.rank}
                iconUrl={row.iconUrl}
                name={row.userName ?? row.userId}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-sm">
                  {row.userName || row.userId}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatNumber(row.coinAmount)} coin / {row.transferCount}
                  {t(" 回", " transfers")}
                </p>
              </div>
              <p className="shrink-0 font-bold text-sky-500 text-sm">
                {formatNumber(row.ptAmount)} pt
              </p>
            </div>
          ))
        )}

        <Button asChild variant="ghost" size="sm" className="mt-1 w-full text-muted-foreground text-sm">
          <Link to={`/users/${props.targetUserLogin}/supports`}>
            {t("もっと見る", "See more")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}