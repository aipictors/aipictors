import { gql, useQuery } from "@apollo/client/index"
import type { MetaFunction } from "@remix-run/cloudflare"
import { getAuth, getIdToken } from "firebase/auth"
import { BarChart3 } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { AuthContext } from "~/contexts/auth-context"
import { createMeta } from "~/utils/create-meta"
import { AnalyticsChart } from "./analytics-chart"
import {
  type AnalyticsDay,
  type AnalyticsResponse,
  COST_KEYS,
  COST_LABELS,
  changeRate,
  formatCount,
  formatYen,
  mergeCounts,
  monthlyRevenue,
  PLAN_LABELS,
  type ProfitAndLoss,
  type RankedItem,
  SECTION_LABELS,
  SOURCE_LABELS,
  sumBy,
} from "./analytics-data"

const TITLE = "分析"
const DESCRIPTION =
  "収支（売上と Cloudflare・RunPod・Google・xAI・OpenAI の費用）、サブスク・コイン・Stripe の売上、生成数、ページ表示と流入元を日別に見られます。数字は毎日 00:30 に前日分を保存しています。"

const RANGES = [30, 90, 180] as const

const CARD =
  "rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none"

const COLORS = {
  lite: "#38bdf8",
  standard: "#a78bfa",
  premium: "#f472b6",
  gross: "#34d399",
  net: "#22d3ee",
  coins: "#fbbf24",
  pv: "#60a5fa",
  landing: "#f97316",
  cfPageViews: "#94a3b8",
  generations: "#c084fc",
  users: "#4ade80",
  runpod: "#f472b6",
  cloudflare: "#f97316",
  google: "#60a5fa",
  openai: "#a3e635",
  xai: "#e2e8f0",
  profit: "#34d399",
}

const viewerQuery = gql`
  query AdminAnalyticsViewer {
    viewer {
      id
      isModerator
    }
  }
`

export const meta: MetaFunction = (props) =>
  createMeta(
    {
      title: TITLE,
      enTitle: "Admin Analytics",
      description: DESCRIPTION,
      enDescription:
        "Daily subscriptions, coin sales, Stripe revenue, generations, page views and traffic sources.",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )

export default function AdminAnalyticsPage() {
  const authContext = useContext(AuthContext)
  const [range, setRange] = useState<(typeof RANGES)[number]>(90)
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })
  const hasPermission = Boolean(viewerData?.viewer?.isModerator)

  useEffect(() => {
    if (authContext.isLoading || authContext.isNotLoggedIn || !hasPermission)
      return
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const currentUser = getAuth().currentUser
        if (!currentUser)
          throw new Error("ログイン情報を確認できませんでした。")
        const idToken = await getIdToken(currentUser)
        // 前の期間と比べるので 2 倍の日数を読む
        const response = await fetch(`/api/admin/analytics?days=${range * 2}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        })
        const body = (await response.json()) as {
          error: string | null
          data: AnalyticsResponse | null
        }
        if (!response.ok || !body.data)
          throw new Error(body.error ?? "読み込めませんでした。")
        if (!cancelled) setData(body.data)
      } catch (loadError) {
        if (!cancelled)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "読み込めませんでした。",
          )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [authContext.isLoading, authContext.isNotLoggedIn, hasPermission, range])

  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell title={TITLE} description={DESCRIPTION} icon={BarChart3}>
        <Card className={CARD}>
          <CardContent className="py-8 text-slate-400 text-sm">
            読み込み中...
          </CardContent>
        </Card>
      </AdminPageShell>
    )
  }

  if (authContext.isNotLoggedIn || !hasPermission) {
    return (
      <AdminPageShell title={TITLE} description={DESCRIPTION} icon={BarChart3}>
        <Alert className={CARD}>
          <AlertDescription className="text-slate-300">
            {authContext.isNotLoggedIn
              ? "このページにアクセスするにはログインが必要です。"
              : "このページはモデレーターのみ利用できます。"}
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell title={TITLE} description={DESCRIPTION} icon={BarChart3}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={value === range ? "default" : "secondary"}
              onClick={() => setRange(value)}
            >
              {value} 日
            </Button>
          ))}
          {isLoading && (
            <span className="text-slate-400 text-sm">読み込み中...</span>
          )}
        </div>
        {error && (
          <Alert className={CARD}>
            <AlertDescription className="text-rose-300">
              {error}
            </AlertDescription>
          </Alert>
        )}
        {data && <AnalyticsBody data={data} range={range} />}
      </div>
    </AdminPageShell>
  )
}

function AnalyticsBody(props: { data: AnalyticsResponse; range: number }) {
  const { current, days: allDays } = props.data
  const days = allDays.slice(-props.range)
  const previous = allDays.slice(-props.range * 2, -props.range)
  const labels = days.map((day) => day.day)
  const latestErrors = allDays.at(-1)?.errors ?? []

  const totals = useMemo(() => summarize(days), [days])
  const previousTotals = useMemo(() => summarize(previous), [previous])

  if (days.length === 0) {
    return (
      <Card className={CARD}>
        <CardContent className="py-8 text-slate-400 text-sm">
          まだ日別の数字がありません。毎日 00:30 に前日分が入ります。
        </CardContent>
      </Card>
    )
  }

  const currentTotal =
    current.subscriptions.LITE +
    current.subscriptions.STANDARD +
    current.subscriptions.PREMIUM
  const hasPrevious = previous.length >= props.range * 0.8

  return (
    <div className="space-y-6">
      <ProfitSection pnl={props.data.pnl ?? null} days={days} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="有効会員（今）"
          value={`${formatCount(currentTotal)} 人`}
          detail={`ライト ${current.subscriptions.LITE}・スタンダード ${current.subscriptions.STANDARD}・プレミアム ${current.subscriptions.PREMIUM}`}
        />
        <Kpi
          label="月額の見込み（今の会員数）"
          value={formatYen(monthlyRevenue(current.subscriptions))}
          detail="Web の料金で計算（App Store 分も同じ額で見積もり）"
        />
        <Kpi
          label={`Stripe 売上（${days.length} 日）`}
          value={formatYen(totals.gross)}
          detail={`手数料引き後 ${formatYen(totals.net)}・返金 ${formatYen(totals.refunds)}`}
          change={
            hasPrevious ? changeRate(totals.gross, previousTotals.gross) : null
          }
        />
        <Kpi
          label={`コイン売上（${days.length} 日）`}
          value={formatYen(totals.coinYen)}
          detail={`${formatCount(totals.coinOrders)} 件・返金 ${totals.coinRefunded} 件`}
          change={
            hasPrevious
              ? changeRate(totals.coinYen, previousTotals.coinYen)
              : null
          }
        />
        <Kpi
          label={`新規・終了（${days.length} 日）`}
          value={`+${totals.started} / -${totals.ended}`}
          detail={`差し引き ${totals.started - totals.ended >= 0 ? "+" : ""}${totals.started - totals.ended} 人`}
        />
        <Kpi
          label={`ページ表示（${days.length} 日）`}
          value={formatCount(totals.pv)}
          detail={
            totals.pv > 0
              ? `外からの訪問 ${formatCount(totals.landings)}`
              : "2026/11/06 から計測（翌日の 00:30 に前日分が入ります）"
          }
          change={hasPrevious ? changeRate(totals.pv, previousTotals.pv) : null}
        />
        <Kpi
          label={`生成数（${days.length} 日）`}
          value={formatCount(totals.generations)}
          detail={`1 日平均 ${formatCount(totals.generations / days.length)} 枚`}
          change={
            hasPrevious
              ? changeRate(totals.generations, previousTotals.generations)
              : null
          }
        />
        <Kpi
          label={`Cloudflare 訪問者（${days.length} 日の平均）`}
          value={`${formatCount(totals.cfUniques / days.length)} / 日`}
          detail="ボットを含む参考値"
        />
      </div>

      <ChartCard title="有効会員（プラン別・日の終わり）">
        <AnalyticsChart
          labels={labels}
          stacked
          series={[
            {
              label: PLAN_LABELS.LITE,
              color: COLORS.lite,
              values: days.map((d) => d.subscriptions?.active.LITE ?? null),
            },
            {
              label: PLAN_LABELS.STANDARD,
              color: COLORS.standard,
              values: days.map((d) => d.subscriptions?.active.STANDARD ?? null),
            },
            {
              label: PLAN_LABELS.PREMIUM,
              color: COLORS.premium,
              values: days.map((d) => d.subscriptions?.active.PREMIUM ?? null),
            },
          ]}
          format={(value) => `${formatCount(value)} 人`}
        />
      </ChartCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Stripe 売上（日別）"
          description="サブスクとコインの合計。App Store の売上は入りません"
        >
          <AnalyticsChart
            type="bar"
            labels={labels}
            series={[
              {
                label: "売上",
                color: COLORS.gross,
                values: days.map((d) => d.stripe?.gross ?? null),
              },
            ]}
            format={formatYen}
          />
        </ChartCard>
        <ChartCard title="コイン売上（日別）">
          <AnalyticsChart
            type="bar"
            labels={labels}
            series={[
              {
                label: "コイン",
                color: COLORS.coins,
                values: days.map((d) => d.coins?.yen ?? null),
              },
            ]}
            format={formatYen}
          />
        </ChartCard>
        <ChartCard title="新規・終了（日別）">
          <AnalyticsChart
            type="bar"
            labels={labels}
            series={[
              {
                label: "新規",
                color: COLORS.users,
                values: days.map((d) =>
                  d.subscriptions
                    ? d.subscriptions.started.LITE +
                      d.subscriptions.started.STANDARD +
                      d.subscriptions.started.PREMIUM
                    : null,
                ),
              },
              {
                label: "終了",
                color: COLORS.premium,
                values: days.map((d) => d.subscriptions?.ended ?? null),
              },
            ]}
            format={(value) => `${formatCount(value)} 人`}
          />
        </ChartCard>
        <ChartCard title="生成数（日別）">
          <AnalyticsChart
            labels={labels}
            series={[
              {
                label: "生成枚数",
                color: COLORS.generations,
                values: days.map((d) => d.generations?.results ?? null),
              },
              {
                label: "生成した人",
                color: COLORS.users,
                values: days.map((d) => d.generations?.users ?? null),
              },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="ページ表示（日別）"
          description="ブラウザで開いた人の表示（サイトの計測）。Cloudflare のページビューはボットを含む参考値"
        >
          <AnalyticsChart
            labels={labels}
            series={[
              {
                label: "ページ表示",
                color: COLORS.pv,
                values: days.map((d) =>
                  d.cloudflare?.pv.total ? d.cloudflare.pv.total : null,
                ),
              },
              {
                label: "外からの訪問",
                color: COLORS.landing,
                values: days.map((d) =>
                  d.cloudflare?.pv.total ? d.cloudflare.pv.landings : null,
                ),
              },
              {
                label: "Cloudflare ページビュー",
                color: COLORS.cfPageViews,
                values: days.map((d) => d.cloudflare?.pageViews ?? null),
              },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="Cloudflare 訪問者（日別）"
          description="IP 単位のユニーク数。ボットを含む参考値"
        >
          <AnalyticsChart
            labels={labels}
            series={[
              {
                label: "訪問者",
                color: COLORS.cfPageViews,
                values: days.map((d) => d.cloudflare?.uniques ?? null),
              },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RankingCard
          title="流入元（外からの訪問）"
          description="サイトの計測。どこから来て最初のページを開いたか"
          items={mergeCounts(days, (d) => d.cloudflare?.pv.bySource)}
          labels={SOURCE_LABELS}
        />
        <RankingCard
          title="見られているページの種類"
          description="サイトの計測（サイト内の移動も含む）"
          items={mergeCounts(days, (d) => d.cloudflare?.pv.bySection)}
          labels={SECTION_LABELS}
        />
        <RankingCard
          title="参照元のサイト（Cloudflare）"
          description="HTML を開いたときの参照元。(なし) は直接やボットが多い"
          items={mergeCounts(days, (d) => d.cloudflare?.referers)}
        />
        <RankingCard
          title="国（Cloudflare）"
          description="HTML を開いた数。海外はボットが多い"
          items={mergeCounts(days, (d) => d.cloudflare?.countries)}
        />
      </div>

      <DailyTable days={days} />

      {latestErrors.length > 0 && (
        <Alert className={CARD}>
          <AlertDescription className="text-amber-300">
            最新の日に取れなかった数字があります: {latestErrors.join(" / ")}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function summarize(days: AnalyticsDay[]) {
  return {
    gross: sumBy(days, (d) => d.stripe?.gross),
    net: sumBy(days, (d) => d.stripe?.net),
    refunds: sumBy(days, (d) => d.stripe?.refunds),
    coinYen: sumBy(days, (d) => d.coins?.yen),
    coinOrders: sumBy(days, (d) => d.coins?.orders),
    coinRefunded: sumBy(days, (d) => d.coins?.refunded),
    started: sumBy(days, (d) =>
      d.subscriptions
        ? d.subscriptions.started.LITE +
          d.subscriptions.started.STANDARD +
          d.subscriptions.started.PREMIUM
        : 0,
    ),
    ended: sumBy(days, (d) => d.subscriptions?.ended),
    pv: sumBy(days, (d) => d.cloudflare?.pv.total),
    landings: sumBy(days, (d) => d.cloudflare?.pv.landings),
    generations: sumBy(days, (d) => d.generations?.results),
    cfUniques: sumBy(days, (d) => d.cloudflare?.uniques),
  }
}

const signedYen = (value: number) =>
  `${value < 0 ? "-" : value > 0 ? "+" : ""}${formatYen(Math.abs(value))}`

const profitClass = (value: number) =>
  value >= 0 ? "text-emerald-300" : "text-rose-300"

/**
 * 収支: 売上（Stripe の手数料・返金を引いた入金）から各サービスの実際の費用を引く
 * 今日の分と今月の分はページを開いたときに aipictors-api が各社の API に聞く（10 分キャッシュ）
 */
function ProfitSection(props: {
  pnl: ProfitAndLoss | null
  days: AnalyticsDay[]
}) {
  const costDays = props.days.filter((day) => day.costs)
  const labels = costDays.map((day) => day.day)
  const { pnl } = props
  const updatedAt = pnl
    ? new Date(pnl.at * 1000).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null
  return (
    <div className="space-y-4">
      {pnl ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            label={`今日の収支（${updatedAt} 時点）`}
            value={signedYen(pnl.today.profit)}
            detail={`売上 ${formatYen(pnl.today.revenue)} − 費用 ${formatYen(pnl.today.costTotal)}`}
            valueClassName={profitClass(pnl.today.profit)}
          />
          <Kpi
            label={`今月の収支（${pnl.month.from.slice(5).replace("-", "/")} から）`}
            value={signedYen(pnl.month.profit)}
            detail={`売上 ${formatYen(pnl.month.revenue)} − 費用 ${formatYen(pnl.month.costTotal)}`}
            valueClassName={profitClass(pnl.month.profit)}
          />
          <Kpi
            label="月末の見込み"
            value={
              pnl.month.projectedProfit === null
                ? "-"
                : signedYen(pnl.month.projectedProfit)
            }
            detail={`今月の ${pnl.month.elapsedDays.toFixed(1)} 日分を ${pnl.month.daysInMonth} 日に伸ばした値${
              pnl.recent?.monthlyProfit != null
                ? `。直近 ${pnl.recent.days} 日のペースなら月 ${signedYen(pnl.recent.monthlyProfit)}`
                : ""
            }`}
            valueClassName={
              pnl.month.projectedProfit === null
                ? undefined
                : profitClass(pnl.month.projectedProfit)
            }
          />
          <Card className={CARD}>
            <CardContent className="space-y-1 py-5 text-sm">
              <p className="text-slate-400 text-xs">今月の費用の内訳</p>
              {COST_KEYS.map((key) => (
                <div key={key} className="flex justify-between gap-2">
                  <span className="text-slate-300">{COST_LABELS[key]}</span>
                  <span>{formatYen(pnl.month.costs[key] ?? 0)}</span>
                </div>
              ))}
              <p className="pt-1 text-slate-500 text-xs">
                1 ドル {pnl.today.fxUsdJpy.toFixed(1)} 円
                {pnl.month.daysWithCosts < pnl.month.storedDays &&
                  `・費用は ${pnl.month.storedDays - pnl.month.daysWithCosts} 日分が未集計`}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert className={CARD}>
          <AlertDescription className="text-slate-300">
            今日・今月の収支を読み込めませんでした（各社の請求 API
            の応答待ちか失敗）。日別の数字は下に出ています。
          </AlertDescription>
        </Alert>
      )}
      {pnl && pnl.today.errors.length > 0 && (
        <p className="text-amber-300 text-xs">
          取れなかった費用: {pnl.today.errors.join(" / ")}
        </p>
      )}
      {costDays.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="収支（日別）"
            description="売上（Stripe の入金。手数料・返金を引いた額）から費用を引いた額。App Store・Google Play の売上は入りません"
          >
            <AnalyticsChart
              type="bar"
              labels={labels}
              series={[
                {
                  label: "収支",
                  color: COLORS.profit,
                  negativeColor: "#fb7185",
                  values: costDays.map(
                    (d) => (d.stripe?.net ?? 0) - (d.costs?.jpy ?? 0),
                  ),
                },
              ]}
              format={signedYen}
            />
          </ChartCard>
          <ChartCard
            title="費用（日別・サービス別）"
            description="RunPod・OpenAI・Google・xAI は請求の実額、Cloudflare は使用量 × 定価（無料枠を日割りで引く）＋契約の日割り"
          >
            <AnalyticsChart
              type="bar"
              stacked
              labels={labels}
              series={COST_KEYS.map((key) => ({
                label: COST_LABELS[key],
                color: COLORS[key],
                values: costDays.map((d) => d.costs?.items?.[key]?.jpy ?? 0),
              }))}
              format={formatYen}
            />
          </ChartCard>
        </div>
      )}
    </div>
  )
}

function Kpi(props: {
  label: string
  value: string
  detail?: string
  change?: number | null
  valueClassName?: string
}) {
  return (
    <Card className={CARD}>
      <CardContent className="space-y-1 py-5">
        <p className="text-slate-400 text-xs">{props.label}</p>
        <p className={`font-bold text-2xl ${props.valueClassName ?? ""}`}>
          {props.value}
        </p>
        {props.change !== undefined && props.change !== null && (
          <p
            className={`text-xs ${props.change >= 0 ? "text-emerald-300" : "text-rose-300"}`}
          >
            前の期間から {props.change >= 0 ? "+" : ""}
            {(props.change * 100).toFixed(1)}%
          </p>
        )}
        {props.detail && (
          <p className="text-slate-400 text-xs">{props.detail}</p>
        )}
      </CardContent>
    </Card>
  )
}

function ChartCard(props: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className={CARD}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{props.title}</CardTitle>
        {props.description && (
          <CardDescription className="text-slate-400">
            {props.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{props.children}</CardContent>
    </Card>
  )
}

function RankingCard(props: {
  title: string
  description?: string
  items: RankedItem[]
  labels?: Record<string, string>
}) {
  const total = props.items.reduce((sum, item) => sum + item.count, 0)
  return (
    <ChartCard title={props.title} description={props.description}>
      {props.items.length === 0 ? (
        <p className="text-slate-400 text-sm">まだ数字がありません。</p>
      ) : (
        <div className="space-y-2">
          {props.items.slice(0, 12).map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between gap-2 text-sm">
                <span className="truncate">
                  {props.labels?.[item.name] ?? item.name}
                </span>
                <span className="shrink-0 text-slate-300">
                  {formatCount(item.count)}（
                  {total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%）
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-1.5 rounded-full bg-sky-400"
                  style={{
                    width: `${total > 0 ? (item.count / props.items[0].count) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  )
}

function DailyTable(props: { days: AnalyticsDay[] }) {
  const rows = [...props.days].reverse().slice(0, 31)
  return (
    <ChartCard title="日別の数字（直近 31 日）">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-right text-xs">
          <thead className="text-slate-400">
            <tr>
              <th className="py-2 text-left font-normal">日付</th>
              <th className="font-normal">有効会員</th>
              <th className="font-normal">新規</th>
              <th className="font-normal">終了</th>
              <th className="font-normal">Stripe 売上</th>
              <th className="font-normal">手数料引き後</th>
              <th className="font-normal">コイン</th>
              <th className="font-normal">生成</th>
              <th className="font-normal">ページ表示</th>
              <th className="font-normal">外から</th>
              <th className="font-normal">CF 訪問者</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((day) => {
              const active = day.subscriptions
                ? day.subscriptions.active.LITE +
                  day.subscriptions.active.STANDARD +
                  day.subscriptions.active.PREMIUM
                : null
              const started = day.subscriptions
                ? day.subscriptions.started.LITE +
                  day.subscriptions.started.STANDARD +
                  day.subscriptions.started.PREMIUM
                : null
              return (
                <tr key={day.day} className="border-white/10 border-t">
                  <td className="py-1.5 text-left">{day.day}</td>
                  <td>{active ?? "-"}</td>
                  <td>{started ?? "-"}</td>
                  <td>{day.subscriptions?.ended ?? "-"}</td>
                  <td>{day.stripe ? formatYen(day.stripe.gross) : "-"}</td>
                  <td>{day.stripe ? formatYen(day.stripe.net) : "-"}</td>
                  <td>{day.coins ? formatYen(day.coins.yen) : "-"}</td>
                  <td>
                    {day.generations
                      ? formatCount(day.generations.results)
                      : "-"}
                  </td>
                  <td>
                    {day.cloudflare?.pv.total
                      ? formatCount(day.cloudflare.pv.total)
                      : "-"}
                  </td>
                  <td>
                    {day.cloudflare?.pv.total
                      ? formatCount(day.cloudflare.pv.landings)
                      : "-"}
                  </td>
                  <td>
                    {day.cloudflare ? formatCount(day.cloudflare.uniques) : "-"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </ChartCard>
  )
}
