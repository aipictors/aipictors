/**
 * ホームページ向け推し・貢献度ランキングセクション
 * - 公開 API (/api/coins/support/rankings/public) を使用（認証不要）
 * - 推しランキング・貢献度ランキングをそれぞれ上位 5 件表示
 * - 「もっと見る」で /coin-rankings へ遷移
 */
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
  freePtAmount: number
  premiumPtAmount: number
  transferCount: number
  iconUrl?: string | null
  userName?: string | null
  userLogin?: string | null
}

type ApiResponse = {
  error: string | null
  data: {
    kind: "received" | "sent"
    weekStartDate: string
    items: SupportRankingItem[]
    totalCount: number
    offset: number
    limit: number
  } | null
}

const formatNumber = (v: number) => v.toLocaleString()

const PREVIEW_LIMIT = 5

export function HomeSupportRankingSection() {
  const t = useTranslation()
  const [receivedItems, setReceivedItems] = useState<SupportRankingItem[]>([])
  const [sentItems, setSentItems] = useState<SupportRankingItem[]>([])
  const [weekStartDate, setWeekStartDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const [rRes, sRes] = await Promise.all([
          fetch(
            `/api/coins/support/rankings/public?kind=received&limit=${PREVIEW_LIMIT}`,
            { method: "GET" },
          ),
          fetch(
            `/api/coins/support/rankings/public?kind=sent&limit=${PREVIEW_LIMIT}`,
            { method: "GET" },
          ),
        ])
        const [rJson, sJson] = await Promise.all([
          rRes.json() as Promise<ApiResponse>,
          sRes.json() as Promise<ApiResponse>,
        ])
        if (rRes.ok && rJson.data) {
          setReceivedItems(rJson.data.items)
          setWeekStartDate(rJson.data.weekStartDate)
        }
        if (sRes.ok && sJson.data) {
          setSentItems(sJson.data.items)
        }
      } catch {
        // サイレントに失敗（ホーム全体には影響させない）
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  const weekLabel = weekStartDate
    ? new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(`${weekStartDate}T00:00:00+09:00`))
    : null

  // 両方空ならセクション自体を非表示
  if (!isLoading && receivedItems.length === 0 && sentItems.length === 0) {
    return null
  }

  const renderBreakdown = (row: SupportRankingItem) => (
    <div className="mt-1 flex flex-wrap gap-1">
      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
        {formatNumber(row.freePtAmount)} pt
        {t("（フリー）", " (Free)")}
      </span>
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
        {formatNumber(row.premiumPtAmount)} pt
        {t("（プレミアム）", " (Premium)")}
      </span>
    </div>
  )

  return (
    <div className="space-y-3">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <p className="font-semibold text-lg">
            {t("今週の推し・貢献度ランキング", "This week's Support rankings")}
          </p>
        </div>
        {weekLabel && (
          <p className="text-muted-foreground text-xs">{weekLabel}〜</p>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-muted" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-20 rounded bg-muted" />
                      <div className="h-3 w-14 rounded bg-muted" />
                    </div>
                    <div className="h-4 w-12 rounded bg-muted" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* 推しランキング */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base text-amber-500">
                <span>{t("推しランキング", "Received ranking")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {receivedItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t(
                    "今週はまだデータがありません。",
                    "No data yet this week.",
                  )}
                </p>
              ) : (
                receivedItems.map((row) => (
                  <Link
                    key={row.rank}
                    to={`/users/${row.userLogin ?? row.userId}`}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/30"
                  >
                    <SupportRankAvatar
                      rank={row.rank}
                      iconUrl={row.iconUrl}
                      name={row.userName ?? row.userLogin ?? row.userId}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-sm">
                        {row.userName || row.userLogin || row.userId}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatNumber(row.coinAmount)} coins
                      </p>
                      {renderBreakdown(row)}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-amber-500 text-sm">
                        {formatNumber(row.ptAmount)} pt
                      </p>
                    </div>
                  </Link>
                ))
              )}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mt-1 w-full text-muted-foreground text-sm"
              >
                <Link to="/coin-rankings?kind=received">
                  {t("もっと見る", "See more")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 貢献度ランキング */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-sky-500">
                {t("貢献度ランキング", "Contribution ranking")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sentItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t(
                    "今週はまだデータがありません。",
                    "No data yet this week.",
                  )}
                </p>
              ) : (
                sentItems.map((row) => (
                  <Link
                    key={row.rank}
                    to={`/users/${row.userLogin ?? row.userId}`}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/30"
                  >
                    <SupportRankAvatar
                      rank={row.rank}
                      iconUrl={row.iconUrl}
                      name={row.userName ?? row.userLogin ?? row.userId}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-sm">
                        {row.userName || row.userLogin || row.userId}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatNumber(row.coinAmount)} coins
                      </p>
                      {renderBreakdown(row)}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-sky-500 text-sm">
                        {formatNumber(row.ptAmount)} pt
                      </p>
                    </div>
                  </Link>
                ))
              )}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mt-1 w-full text-muted-foreground text-sm"
              >
                <Link to="/coin-rankings?kind=sent">
                  {t("もっと見る", "See more")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
