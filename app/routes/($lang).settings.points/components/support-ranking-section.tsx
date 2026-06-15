import { Link } from "@remix-run/react"
import { Award } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { SupportRankAvatar } from "~/components/support-rank-avatar"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import {
  getDevLoginUserId,
  getViewerRequestHeaders,
} from "~/lib/viewer-request-headers"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"

export type SupportRankingItem = {
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

type SupportRankingData = {
  kind: "received" | "sent"
  weekStartDate: string
  items: SupportRankingItem[]
  totalCount: number
  offset: number
  limit: number
}

type SupportRankingResponse = {
  error: string | null
  data: SupportRankingData | null
}

type SupportSummaryResponse = {
  error: string | null
  data: {
    userId: string
    weekStartDate: string
    cumulativeSentPt: number
    cumulativeReceivedPt: number
    cumulativeSentCoins: number
    cumulativeReceivedCoins: number
    weeklySentPt: number
    weeklyReceivedPt: number
    weeklySentCoinAmount: number
    weeklyReceivedCoinAmount: number
    weeklySentTransferCount: number
    weeklyReceivedTransferCount: number
    weeklySentRank: number | null
    weeklyReceivedRank: number | null
    availableWeekStartDates: string[]
  } | null
}

const normalizeRankingData = (
  data: SupportRankingData,
): SupportRankingData => ({
  ...data,
  weekStartDate: normalizeWeekStartDate(data.weekStartDate) ?? "",
  items: Array.isArray(data.items) ? data.items : [],
})

const normalizeSummaryData = (
  data: SupportSummaryResponse["data"],
): SupportSummaryResponse["data"] => {
  if (!data) return null

  const normalizedWeekStartDate = normalizeWeekStartDate(data.weekStartDate)

  return {
    ...data,
    weekStartDate: normalizedWeekStartDate ?? "",
    availableWeekStartDates: Array.isArray(data.availableWeekStartDates)
      ? data.availableWeekStartDates
          .map(normalizeWeekStartDate)
          .filter((value): value is string => value !== null)
      : [],
  }
}

const MONTH_FMT = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
})
const DATE_FMT = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "2-digit",
  day: "2-digit",
})

const isValidYearMonth = (value: string) => {
  if (!/^\d{4}-\d{2}$/.test(value)) return false
  return !Number.isNaN(new Date(`${value}-01T00:00:00+09:00`).getTime())
}

const isValidWeekStartDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return !Number.isNaN(new Date(`${value}T00:00:00+09:00`).getTime())
}

const normalizeWeekStartDate = (value: string | null | undefined) => {
  if (typeof value !== "string") return null

  const normalized = value.trim().slice(0, 10)
  return isValidWeekStartDate(normalized) ? normalized : null
}

const formatMonth = (yearMonth: string) =>
  isValidYearMonth(yearMonth)
    ? MONTH_FMT.format(new Date(`${yearMonth}-01T00:00:00+09:00`))
    : yearMonth

const formatWeekRange = (weekStartDate: string) => {
  if (!isValidWeekStartDate(weekStartDate)) {
    return weekStartDate
  }

  const start = new Date(`${weekStartDate}T00:00:00+09:00`)
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)
  return `${DATE_FMT.format(start)} - ${DATE_FMT.format(end)}`
}

const groupByMonth = (dates: string[]): Map<string, string[]> => {
  const map = new Map<string, string[]>()
  for (const d of dates) {
    if (!isValidWeekStartDate(d)) continue

    const ym = d.slice(0, 7)
    const list = map.get(ym) ?? []
    list.push(d)
    map.set(ym, list)
  }
  return map
}

const formatNumber = (v: number) => v.toLocaleString()
const formatRank = (rank: number | null) => (rank === null ? "-" : `#${rank}`)

export function SupportRankingSection() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const [summary, setSummary] = useState<SupportSummaryResponse["data"]>(null)
  const [receivedRanking, setReceivedRanking] =
    useState<SupportRankingData | null>(null)
  const [sentRanking, setSentRanking] = useState<SupportRankingData | null>(
    null,
  )
  const [selectedWeekStartDate, setSelectedWeekStartDate] = useState<
    string | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)

  const withAuthHeader = async () => {
    try {
      return await getViewerRequestHeaders({ includeJsonContentType: true })
    } catch {
      throw new Error(t("ログインが必要です", "Login required"))
    }
  }

  const loadRankings = async (weekStartDate: string) => {
    const headers = await withAuthHeader()
    const [receivedRes, sentRes] = await Promise.all([
      fetch(
        `/api/coins/support/rankings?kind=received&weekStartDate=${encodeURIComponent(weekStartDate)}&limit=50`,
        { method: "GET", headers },
      ),
      fetch(
        `/api/coins/support/rankings?kind=sent&weekStartDate=${encodeURIComponent(weekStartDate)}&limit=50`,
        { method: "GET", headers },
      ),
    ])
    const [r, s] = await Promise.all([
      receivedRes.json() as Promise<SupportRankingResponse>,
      sentRes.json() as Promise<SupportRankingResponse>,
    ])
    if (!receivedRes.ok || r.error || !r.data) {
      throw new Error(
        r.error ??
          t(
            "推しランキングの読み込みに失敗しました",
            "Failed to load received rankings",
          ),
      )
    }
    if (!sentRes.ok || s.error || !s.data) {
      throw new Error(
        s.error ??
          t(
            "貢献度ランキングの読み込みに失敗しました",
            "Failed to load sent rankings",
          ),
      )
    }
    setReceivedRanking(normalizeRankingData(r.data))
    setSentRanking(normalizeRankingData(s.data))
  }

  const loadSummary = async () => {
    if (authContext.isLoading || authContext.isNotLoggedIn) return
    try {
      setIsLoading(true)
      const headers = await withAuthHeader()
      const viewerUserId = authContext.userId ?? getDevLoginUserId()
      if (!viewerUserId)
        throw new Error(t("ログインが必要です", "Login required"))
      const res = await fetch(
        `/api/coins/support/summary/${encodeURIComponent(viewerUserId)}`,
        { method: "GET", headers },
      )
      const json = (await res.json()) as SupportSummaryResponse
      if (!res.ok || json.error || !json.data) {
        throw new Error(
          json.error ??
            t("集計の読み込みに失敗しました", "Failed to load summary"),
        )
      }
      const normalizedSummary = normalizeSummaryData(json.data)
      setSummary(normalizedSummary)
      const nextCandidate = selectedWeekStartDate ?? normalizedSummary?.weekStartDate
      const next = nextCandidate && isValidWeekStartDate(nextCandidate)
        ? nextCandidate
        : (normalizedSummary?.availableWeekStartDates[0] ?? null)
      if (!next) {
        setReceivedRanking({
          kind: "received",
          weekStartDate: "",
          items: [],
          totalCount: 0,
          offset: 0,
          limit: 0,
        })
        setSentRanking({
          kind: "sent",
          weekStartDate: "",
          items: [],
          totalCount: 0,
          offset: 0,
          limit: 0,
        })
        return
      }
      setSelectedWeekStartDate(next)
      await loadRankings(next)
    } catch (e) {
      if (e instanceof Error) toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext.isLoading, authContext.isNotLoggedIn])

  const handleWeekChange = async (weekStartDate: string) => {
    try {
      setSelectedWeekStartDate(weekStartDate)
      setIsLoading(true)
      await loadRankings(weekStartDate)
    } catch (e) {
      if (e instanceof Error) toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const weekStartDates = summary?.availableWeekStartDates ?? []
  const monthGroups = useMemo(
    () => groupByMonth(weekStartDates),
    [weekStartDates],
  )
  const monthKeys = useMemo(() => Array.from(monthGroups.keys()), [monthGroups])
  const selectedMonth = selectedWeekStartDate
    ? selectedWeekStartDate.slice(0, 7)
    : (monthKeys[0] ?? null)
  const weeksInSelectedMonth = selectedMonth
    ? (monthGroups.get(selectedMonth) ?? [])
    : []

  const handleMonthChange = (ym: string) => {
    const weeks = monthGroups.get(ym) ?? []
    if (weeks.length > 0) void handleWeekChange(weeks[0])
  }

  const selectedReceived = receivedRanking?.items ?? []
  const selectedSent = sentRanking?.items ?? []

  if (authContext.isLoading) {
    return (
      <div className="rounded-xl border p-5">
        <p className="text-muted-foreground text-sm">
          {t("読み込み中...", "Loading...")}
        </p>
      </div>
    )
  }

  if (authContext.isNotLoggedIn) {
    return (
      <div className="rounded-xl border p-5">
        <p className="text-muted-foreground text-sm">
          {t(
            "ログイン後に貢献度ランキングを確認できます。",
            "Login to view contribution rankings.",
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2 font-semibold text-lg">
            <Award className="h-5 w-5 shrink-0 text-emerald-500" />
            <span>
              {t("推しポイント・貢献度", "Support & Contribution Points")}
            </span>
          </p>
          <p className="mt-1 text-muted-foreground text-sm">
            {t(
              "フリーコイン 1ポイント / プレミアムコイン 10ポイント、週間集計。",
              "Free: 1pt per coin / Premium: 10pt per coin, weekly aggregation.",
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadSummary()}
          disabled={isLoading}
        >
          {isLoading ? t("更新中...", "Refreshing...") : t("更新", "Refresh")}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t("累計貢献 pt", "Cumulative contribution pt"),
            value: summary?.cumulativeSentPt ?? 0,
            rank: null as number | null,
          },
          {
            label: t("累計受取 pt", "Cumulative received pt"),
            value: summary?.cumulativeReceivedPt ?? 0,
            rank: null as number | null,
          },
          {
            label: t("週間貢献 pt", "Weekly contribution pt"),
            value: summary?.weeklySentPt ?? 0,
            rank: summary?.weeklySentRank ?? null,
          },
          {
            label: t("週間受取 pt", "Weekly received pt"),
            value: summary?.weeklyReceivedPt ?? 0,
            rank: summary?.weeklyReceivedRank ?? null,
          },
        ].map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-xs text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="font-bold text-2xl">{formatNumber(card.value)}</p>
              {card.rank !== undefined && (
                <p className="text-muted-foreground text-xs">
                  {t("順位", "Rank")}: {formatRank(card.rank)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {monthKeys.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedMonth ?? ""} onValueChange={handleMonthChange}>
            <SelectTrigger className="h-8 w-36 text-sm">
              <SelectValue placeholder={t("月を選択", "Select month")} />
            </SelectTrigger>
            <SelectContent>
              {monthKeys.map((ym) => (
                <SelectItem key={ym} value={ym}>
                  {formatMonth(ym)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2">
            {weeksInSelectedMonth.map((ws) => (
              <Button
                key={ws}
                type="button"
                size="sm"
                variant={selectedWeekStartDate === ws ? "default" : "outline"}
                onClick={() => void handleWeekChange(ws)}
                disabled={isLoading}
              >
                {formatWeekRange(ws)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <RankingCard
          title={t("推しランキング", "Support ranking")}
          colorClass="text-purple-500"
          items={selectedReceived}
          emptyText={t(
            "推しランキングはまだありません。",
            "No support rankings yet.",
          )}
          moreHref="/coin-rankings?kind=received"
          moreLabel={t("もっと見る", "View more")}
        />
        <RankingCard
          title={t("貢献度ランキング", "Contribution ranking")}
          colorClass="text-amber-500"
          items={selectedSent}
          emptyText={t(
            "貢献度ランキングはまだありません。",
            "No contribution rankings yet.",
          )}
          moreHref="/coin-rankings?kind=sent"
          moreLabel={t("もっと見る", "View more")}
        />
      </div>
    </div>
  )
}

type RankingCardProps = {
  title: string
  colorClass: string
  items: SupportRankingItem[]
  emptyText: string
  moreHref?: string
  moreLabel?: string
  limit?: number
}

export function RankingCard({
  title,
  colorClass,
  items,
  emptyText,
  moreHref,
  moreLabel,
  limit,
}: RankingCardProps) {
  const displayItems = limit ? items.slice(0, limit) : items
  const formatBreakdown = (row: SupportRankingItem) => {
    const parts = []

    if (row.freePtAmount > 0) {
      parts.push(`${formatNumber(row.freePtAmount)} pt（フリー）`)
    }

    if (row.premiumPtAmount > 0) {
      parts.push(`${formatNumber(row.premiumPtAmount)} pt（プレミアム）`)
    }

    return parts.join(" + ")
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={`text-base ${colorClass}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayItems.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyText}</p>
        ) : (
          displayItems.map((row) => (
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
                  @{row.userLogin ?? row.userId}
                </p>
              </div>
              <div className="text-right">
                <p className="shrink-0 font-bold text-sm">
                  {formatNumber(row.ptAmount)} pt
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {formatBreakdown(row)}
                </p>
              </div>
            </Link>
          ))
        )}
        {moreHref && items.length > 0 && (
          <Link
            to={moreHref}
            className="mt-2 block text-center text-muted-foreground text-sm hover:underline"
          >
            {moreLabel ?? t("もっと見る", "View more")}
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
