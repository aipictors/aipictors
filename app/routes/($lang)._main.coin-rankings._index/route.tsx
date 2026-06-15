/**
 * コイン推し・貢献度ランキング全体一覧ページ
 * /coin-rankings?kind=received|sent&weekStartDate=YYYY-MM-DD
 *
 * - 公開ページ（認証不要でランキング閲覧可）
 * - kind: received = 推しランキング / sent = 貢献度ランキング
 * - 月セレクタ → 週セレクタで期間を切り替え
 * - フレーム画像付き上位 3 位 + 丸バッジ 4 位以降
 */
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Link, useLoaderData, useSearchParams } from "@remix-run/react"
import { Trophy } from "lucide-react"
import { useMemo, useState } from "react"
import { SupportRankAvatar } from "~/components/support-rank-avatar"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { getServerEnvValue } from "~/lib/server/env.server"
import { createMeta } from "~/utils/create-meta"

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

type SupportRankingItem = {
  rank: number
  userId: string
  coinAmount: number
  ptAmount: number
  transferCount: number
  iconUrl?: string | null
  userName?: string | null
}

type RankingData = {
  kind: "received" | "sent"
  weekStartDate: string
  items: SupportRankingItem[]
  totalCount: number
  offset: number
  limit: number
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

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

const formatMonth = (ym: string) =>
  MONTH_FMT.format(new Date(`${ym}-01T00:00:00+09:00`))

const formatWeekRange = (weekStartDate: string) => {
  const start = new Date(`${weekStartDate}T00:00:00+09:00`)
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)
  return `${DATE_FMT.format(start)} 〜 ${DATE_FMT.format(end)}`
}

const groupByMonth = (dates: string[]): Map<string, string[]> => {
  const map = new Map<string, string[]>()
  for (const d of dates) {
    const ym = d.slice(0, 7)
    const list = map.get(ym) ?? []
    list.push(d)
    map.set(ym, list)
  }
  return map
}

const formatNumber = (v: number) => v.toLocaleString()

// ────────────────────────────────────────────────────────────────────
// Loader  (公開, 認証不要)
// ────────────────────────────────────────────────────────────────────

export const meta: MetaFunction = (props) =>
  createMeta(
    {
      title: "推し・貢献度ランキング",
      enTitle: "Support & Contribution Rankings",
      description:
        "週ごとのコイン支援ランキングです。推しランキング・貢献度ランキングを確認できます。",
      enDescription:
        "Weekly coin support rankings. See who received and contributed the most pt.",
      isIndex: true,
    },
    undefined,
    props.params.lang,
  )

const fetchFromBackend = async (
  context: unknown,
  params: Record<string, string>,
) => {
  const apiBaseUrl =
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  const internalToken = getServerEnvValue(
    context,
    "AIPICTORS_API_INTERNAL_TOKEN",
  )
  const cfId = getServerEnvValue(context, "AIPICTORS_API_CF_ACCESS_CLIENT_ID")
  const cfSecret = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_SECRET",
  )

  if (!internalToken) return null

  const qs = new URLSearchParams(params).toString()

  const res = await fetch(
    `${apiBaseUrl}/internal/coins/support/rankings?${qs}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${internalToken}`,
        "Content-Type": "application/json",
        ...(cfId && cfSecret
          ? { "CF-Access-Client-Id": cfId, "CF-Access-Client-Secret": cfSecret }
          : {}),
      },
    },
  )

  if (!res.ok) return null
  const json = (await res.json()) as {
    error: string | null
    data?: RankingData
  }
  return json.data ?? null
}

const fetchWeeksFromBackend = async (context: unknown): Promise<string[]> => {
  const apiBaseUrl =
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  const internalToken = getServerEnvValue(
    context,
    "AIPICTORS_API_INTERNAL_TOKEN",
  )
  const cfId = getServerEnvValue(context, "AIPICTORS_API_CF_ACCESS_CLIENT_ID")
  const cfSecret = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_SECRET",
  )

  if (!internalToken) return []

  const res = await fetch(
    `${apiBaseUrl}/internal/coins/support/weeks?limit=20`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${internalToken}`,
        "Content-Type": "application/json",
        ...(cfId && cfSecret
          ? { "CF-Access-Client-Id": cfId, "CF-Access-Client-Secret": cfSecret }
          : {}),
      },
    },
  )

  if (!res.ok) return []
  const json = (await res.json()) as {
    error: string | null
    data?: { weekStartDates: string[] }
  }
  return json.data?.weekStartDates ?? []
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const kind = url.searchParams.get("kind") === "sent" ? "sent" : "received"
  const weekStartDate = url.searchParams.get("weekStartDate") ?? undefined

  const [weeks, receivedData, sentData] = await Promise.all([
    fetchWeeksFromBackend(context).catch(() => [] as string[]),
    fetchFromBackend(context, {
      kind: "received",
      limit: "100",
      ...(weekStartDate ? { weekStartDate } : {}),
    }).catch(() => null),
    fetchFromBackend(context, {
      kind: "sent",
      limit: "100",
      ...(weekStartDate ? { weekStartDate } : {}),
    }).catch(() => null),
  ])

  const currentWeekStartDate =
    weekStartDate ??
    receivedData?.weekStartDate ??
    sentData?.weekStartDate ??
    null

  // weeks に current が含まれていなければ先頭に追加
  const allWeeks =
    currentWeekStartDate && !weeks.includes(currentWeekStartDate)
      ? [currentWeekStartDate, ...weeks]
      : weeks

  return json({
    kind,
    weekStartDate: currentWeekStartDate,
    weeks: allWeeks,
    receivedData,
    sentData,
  })
}

// ────────────────────────────────────────────────────────────────────
// Page component
// ────────────────────────────────────────────────────────────────────

export default function CoinRankingsPage() {
  const data = useLoaderData<typeof loader>()
  const [_searchParams, setSearchParams] = useSearchParams()

  const { weeks, receivedData, sentData } = data

  // クライアント側での週切り替え（フルリロードせずパラメータ変更）
  const [selectedWeekStartDate, setSelectedWeekStartDate] = useState<string>(
    data.weekStartDate ?? weeks[0] ?? "",
  )
  const [activeKind, setActiveKind] = useState<"received" | "sent">(data.kind)

  const handleWeekChange = (ws: string) => {
    setSelectedWeekStartDate(ws)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("weekStartDate", ws)
      return next
    })
  }

  const handleKindChange = (kind: "received" | "sent") => {
    setActiveKind(kind)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("kind", kind)
      return next
    })
  }

  const monthGroups = useMemo(() => groupByMonth(weeks), [weeks])
  const monthKeys = useMemo(() => Array.from(monthGroups.keys()), [monthGroups])
  const selectedMonth =
    selectedWeekStartDate.slice(0, 7) || (monthKeys[0] ?? "")
  const weeksInSelectedMonth = monthGroups.get(selectedMonth) ?? []

  const handleMonthChange = (ym: string) => {
    const w = monthGroups.get(ym)?.[0]
    if (w) handleWeekChange(w)
  }

  const receivedItems = receivedData?.items ?? []
  const sentItems = sentData?.items ?? []

  const displayItems = activeKind === "received" ? receivedItems : sentItems
  const colorClass =
    activeKind === "received" ? "text-amber-500" : "text-sky-500"
  const rankingTitle =
    activeKind === "received" ? "推しランキング" : "貢献度ランキング"

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ページヘッダー */}
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 font-bold text-2xl">
          <Trophy className="h-6 w-6 text-amber-500" />
          推し・貢献度ランキング
        </h1>
        <p className="text-muted-foreground text-sm">
          フリーコイン 1pt / プレミアムコイン 10pt として週間集計しています。
        </p>
      </div>

      {/* 種別タブ */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={activeKind === "received" ? "default" : "outline"}
          onClick={() => handleKindChange("received")}
        >
          推しランキング
        </Button>
        <Button
          size="sm"
          variant={activeKind === "sent" ? "default" : "outline"}
          onClick={() => handleKindChange("sent")}
        >
          貢献度ランキング
        </Button>
      </div>

      {/* 月・週セレクタ */}
      {monthKeys.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="h-8 w-36 text-sm">
              <SelectValue />
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
                onClick={() => handleWeekChange(ws)}
              >
                {formatWeekRange(ws)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* ランキング本体 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg ${colorClass}`}>
            {rankingTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {displayItems.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground text-sm">
              この週はまだデータがありません。
            </p>
          ) : (
            <div className="space-y-2">
              {/* 1〜3位: 大きめアバター・横幅広めに */}
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                {displayItems.slice(0, 3).map((row) => (
                  <div
                    key={row.rank}
                    className="flex flex-col items-center gap-2 rounded-xl border bg-muted/30 p-4 text-center"
                  >
                    <SupportRankAvatar
                      rank={row.rank}
                      iconUrl={row.iconUrl}
                      name={row.userName}
                      size="lg"
                    />
                    <p className="mt-1 truncate font-semibold text-sm">
                      {row.userName || row.userId.slice(0, 14)}…
                    </p>
                    <p className={`font-bold text-xl ${colorClass}`}>
                      {formatNumber(row.ptAmount)} pt
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatNumber(row.coinAmount)} coins ·{" "}
                      {formatNumber(row.transferCount)} transfers
                    </p>
                  </div>
                ))}
              </div>

              {/* 4位以降 */}
              {displayItems.slice(3).map((row) => (
                <div
                  key={row.rank}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2"
                >
                  <SupportRankAvatar
                    rank={row.rank}
                    iconUrl={row.iconUrl}
                    name={row.userName}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-sm">
                      {row.userName || row.userId.slice(0, 14)}…
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatNumber(row.coinAmount)} coins ·{" "}
                      {formatNumber(row.transferCount)} transfers
                    </p>
                  </div>
                  <p className={`shrink-0 font-bold text-sm ${colorClass}`}>
                    {formatNumber(row.ptAmount)} pt
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-muted-foreground text-xs">
        <Link to="/settings/points" className="hover:underline">
          自分の推し・貢献度 pt を確認する
        </Link>
      </p>
    </div>
  )
}
