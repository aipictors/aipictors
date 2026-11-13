import { gql, useQuery } from "@apollo/client/index"
import type { MetaFunction } from "@remix-run/cloudflare"
import { getAuth, getIdToken } from "firebase/auth"
import { BarChart3, ChevronDown } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Alert, AlertDescription } from "~/components/ui/alert"
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
  countryName,
  formatCount,
  formatPercent,
  formatYen,
  mergeCounts,
  monthlyRevenue,
  PLAN_LABELS,
  type ProfitAndLoss,
  type RankedItem,
  SECTION_LABELS,
  SOURCE_LABELS,
  sumBy,
  type UsersMonth,
} from "./analytics-data"

const TITLE = "分析"
const DESCRIPTION =
  "収支（売上と Cloudflare・RunPod・Google・xAI・OpenAI の費用）、利用者（登録・ログインした人・日本と海外）、サブスク・コイン・Stripe の売上、生成数、ページ表示と流入元を日別に見られます。数字は毎日 00:30 に前日分を保存しています。"

const RANGES = [30, 90, 180] as const

const CARD =
  "rounded-2xl border-white/10 bg-white/5 text-slate-100 shadow-none sm:rounded-[28px]"

/** ページ内の移動先（上の帯のボタンと見出し） */
const SECTIONS = [
  { id: "pnl", label: "収支" },
  { id: "users", label: "利用者" },
  { id: "members", label: "会員" },
  { id: "sales", label: "売上" },
  { id: "generations", label: "生成" },
  { id: "traffic", label: "アクセス" },
  { id: "daily", label: "日別" },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"]

/** 2026-11-13 → 11/13（金） */
const shortDay = (day: string) =>
  `${day.slice(5).replace("-", "/")}（${WEEKDAYS[new Date(`${day}T00:00:00Z`).getUTCDay()]}）`

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
  japan: "#f472b6",
  overseas: "#38bdf8",
  dau: "#4ade80",
  wau: "#fbbf24",
  mau: "#a78bfa",
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
      <div className="space-y-5 sm:space-y-6">
        {/* 期間と見たい所へ移動するボタン。スクロールしても上に残す */}
        <div className="-mx-3 sticky top-0 z-20 flex items-center gap-2 overflow-x-auto border-white/10 border-b bg-[#141c2e]/95 px-3 py-2 backdrop-blur [scrollbar-width:none] sm:mx-0 sm:rounded-2xl sm:border [&::-webkit-scrollbar]:hidden">
          <div className="flex shrink-0 rounded-full bg-white/10 p-0.5">
            {RANGES.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={value === range}
                onClick={() => setRange(value)}
                className={`rounded-full px-3 py-1.5 font-medium text-xs transition ${
                  value === range
                    ? "bg-white text-slate-900"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {value}日
              </button>
            ))}
          </div>
          <span className="h-5 w-px shrink-0 bg-white/15" />
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() =>
                document
                  .getElementById(`analytics-${section.id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-slate-200 text-xs transition hover:bg-white/10 active:bg-white/20"
            >
              {section.label}
            </button>
          ))}
          {isLoading && (
            <span className="shrink-0 text-slate-400 text-xs">
              読み込み中...
            </span>
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
    <div className="space-y-8 sm:space-y-10">
      <Section id="pnl">
        <ProfitSection pnl={props.data.pnl ?? null} days={days} />
      </Section>

      <Section id="users">
        <UsersSection
          days={days}
          previous={hasPrevious ? previous : []}
          months={props.data.months ?? []}
        />
      </Section>

      <Section id="members">
        <KpiGrid>
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
            label={`新規・終了（${days.length} 日）`}
            value={`+${totals.started} / -${totals.ended}`}
            detail={`差し引き ${totals.started - totals.ended >= 0 ? "+" : ""}${totals.started - totals.ended} 人`}
          />
        </KpiGrid>
        <ChartGrid>
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
                  values: days.map(
                    (d) => d.subscriptions?.active.STANDARD ?? null,
                  ),
                },
                {
                  label: PLAN_LABELS.PREMIUM,
                  color: COLORS.premium,
                  values: days.map(
                    (d) => d.subscriptions?.active.PREMIUM ?? null,
                  ),
                },
              ]}
              format={(value) => `${formatCount(value)} 人`}
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
        </ChartGrid>
      </Section>

      <Section id="sales">
        <KpiGrid>
          <Kpi
            label={`Stripe 売上（${days.length} 日）`}
            value={formatYen(totals.gross)}
            detail={`手数料引き後 ${formatYen(totals.net)}・返金 ${formatYen(totals.refunds)}`}
            change={
              hasPrevious
                ? changeRate(totals.gross, previousTotals.gross)
                : null
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
        </KpiGrid>
        <ChartGrid>
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
        </ChartGrid>
      </Section>

      <Section id="generations">
        <KpiGrid>
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
        </KpiGrid>
        <ChartGrid>
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
        </ChartGrid>
      </Section>

      <Section id="traffic">
        <KpiGrid>
          <Kpi
            label={`ページ表示（${days.length} 日）`}
            value={formatCount(totals.pv)}
            detail={
              totals.pv > 0
                ? `外からの訪問 ${formatCount(totals.landings)}`
                : "2026/11/06 から計測（翌日の 00:30 に前日分が入ります）"
            }
            change={
              hasPrevious ? changeRate(totals.pv, previousTotals.pv) : null
            }
          />
          <Kpi
            label={`Cloudflare 訪問者（${days.length} 日の平均）`}
            value={`${formatCount(totals.cfUniques / days.length)} / 日`}
            detail="ボットを含む参考値"
          />
        </KpiGrid>
        <ChartGrid>
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
        </ChartGrid>
      </Section>

      <Section id="daily">
        <DailyTable days={days} />
      </Section>

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

/** 見出しつきのまとまり。上の帯のボタンから飛んでくる */
function Section(props: { id: SectionId; children: React.ReactNode }) {
  const label = SECTIONS.find((section) => section.id === props.id)?.label
  return (
    <section
      id={`analytics-${props.id}`}
      className="scroll-mt-16 space-y-3 sm:space-y-4"
    >
      <h2 className="flex items-center gap-2 font-bold text-base sm:text-lg">
        <span className="h-4 w-1 rounded-full bg-cyan-300" />
        {label}
      </h2>
      {props.children}
    </section>
  )
}

/** スマホでも 2 列で並べて、縦に長くなりすぎないようにする（最後に 1 枚余ったら横いっぱいに） */
function KpiGrid(props: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4 [&>*:last-child:nth-child(odd)]:col-span-2 xl:[&>*:last-child:nth-child(odd)]:col-span-1">
      {props.children}
    </div>
  )
}

function ChartGrid(props: { children: React.ReactNode }) {
  return (
    <div className="grid gap-3 sm:gap-6 xl:grid-cols-2">{props.children}</div>
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

/** 2026-11 → 26/11 */
const shortMonth = (month: string) => month.slice(2).replace("-", "/")

const overseas = (totals: { total: number; jp: number } | null | undefined) =>
  totals ? totals.total - totals.jp : null

/**
 * 利用者: 登録者、ログインした人（DAU / WAU / MAU）、投稿やいいねをした人、日本と海外
 * 登録者とログインはサイト本体の DB、日本と海外は計測（/api/pv）を Cloudflare が国別に数えたもの
 */
function UsersSection(props: {
  days: AnalyticsDay[]
  previous: AnalyticsDay[]
  months: UsersMonth[]
}) {
  const { days, months } = props
  const labels = days.map((day) => day.day)
  const latest = [...days].reverse().find((day) => day.users)
  const latestLogin = [...days].reverse().find((day) => day.users?.login)
  const login = latestLogin?.users?.login ?? null
  const registered = sumBy(days, (d) => d.users?.registered.new)
  const previousRegistered = sumBy(
    props.previous,
    (d) => d.users?.registered.new,
  )
  const pvTotal = sumBy(days, (d) => d.cloudflare?.pv.byCountry?.total)
  const pvJp = sumBy(days, (d) => d.cloudflare?.pv.byCountry?.jp)
  const visitorDays = days.filter((day) => day.cloudflare?.visitors)
  const latestVisitors = visitorDays.at(-1)?.cloudflare?.visitors ?? null
  const monthLabels = months.map((month) => month.month)

  if (!latest?.users) {
    return (
      <Card className={CARD}>
        <CardContent className="py-8 text-slate-400 text-sm">
          まだ利用者の数字がありません。毎日 00:30 に前日分が入ります。
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <KpiGrid>
        <Kpi
          label="登録者（累計）"
          value={`${formatCount(latest.users.registered.total)} 人`}
          detail={`${days.length} 日で +${formatCount(registered)} 人（1 日平均 ${formatCount(registered / days.length)} 人）。退会を除く`}
          change={
            props.previous.length > 0
              ? changeRate(registered, previousRegistered)
              : null
          }
        />
        <Kpi
          label={
            latestLogin
              ? `ログインした人（${shortDay(latestLogin.day)}）`
              : "ログインした人"
          }
          value={login ? `${formatCount(login.dau)} 人` : "-"}
          detail={
            login
              ? `7 日 ${formatCount(login.wau)} 人・30 日 ${formatCount(login.mau)} 人`
              : "2026/11/13 から記録"
          }
        />
        <Kpi
          label="月間アクティブ（30 日にログインした人）"
          value={login ? `${formatCount(login.mau)} 人` : "-"}
          detail={
            login
              ? `登録者の ${formatPercent(login.mau, latest.users.registered.total)}。毎日来る割合（1 日 ÷ 30 日）${formatPercent(login.dau, login.mau)}`
              : undefined
          }
        />
        <Kpi
          label={
            latestVisitors
              ? "訪問者（最新の日・ブラウザ数）"
              : `日本と海外（ページ表示・${days.length} 日）`
          }
          value={
            latestVisitors
              ? `${formatCount(latestVisitors.total)} 人`
              : pvTotal > 0
                ? `日本 ${formatPercent(pvJp, pvTotal)}`
                : "-"
          }
          detail={
            latestVisitors
              ? `日本 ${formatCount(latestVisitors.jp)}（${formatPercent(latestVisitors.jp, latestVisitors.total)}）・海外 ${formatCount(latestVisitors.total - latestVisitors.jp)}`
              : pvTotal > 0
                ? `海外 ${formatPercent(pvTotal - pvJp, pvTotal)}。ブラウザで開いた表示`
                : "2026/11/06 から計測"
          }
        />
      </KpiGrid>
      <ChartGrid>
        <ChartCard
          title="ログインした人（日別）"
          description="ログインしてサイトかアプリを開いた人。1 日（DAU）・その日までの 7 日（WAU）・30 日（MAU）。2026/11/13 から記録"
        >
          <AnalyticsChart
            labels={labels}
            series={[
              {
                label: "30 日",
                color: COLORS.mau,
                values: days.map((d) => d.users?.login?.mau ?? null),
              },
              {
                label: "7 日",
                color: COLORS.wau,
                values: days.map((d) => d.users?.login?.wau ?? null),
              },
              {
                label: "1 日",
                color: COLORS.dau,
                values: days.map((d) => d.users?.login?.dau ?? null),
              },
            ]}
            format={(value) => `${formatCount(value)} 人`}
          />
        </ChartCard>
        <ChartCard
          title="動いた人（日別）"
          description="投稿した人・いいねした人・生成した人。見るだけの人は入りません"
        >
          <AnalyticsChart
            labels={labels}
            series={[
              {
                label: "いいねした人",
                color: COLORS.premium,
                values: days.map((d) => d.users?.likers ?? null),
              },
              {
                label: "投稿した人",
                color: COLORS.pv,
                values: days.map((d) => d.users?.posters ?? null),
              },
              {
                label: "生成した人",
                color: COLORS.generations,
                values: days.map((d) => d.generations?.users ?? null),
              },
            ]}
            format={(value) => `${formatCount(value)} 人`}
          />
        </ChartCard>
        <ChartCard title="新規登録（日別）">
          <AnalyticsChart
            type="bar"
            labels={labels}
            series={[
              {
                label: "新規登録",
                color: COLORS.users,
                values: days.map((d) => d.users?.registered.new ?? null),
              },
            ]}
            format={(value) => `${formatCount(value)} 人`}
          />
        </ChartCard>
        <ChartCard
          title="日本と海外のページ表示（日別）"
          description="ブラウザで開いた人の表示を国で分けたもの（2026/11/06 から）。海外には自動で開くプログラムが一部混ざります"
        >
          <AnalyticsChart
            type="bar"
            stacked
            labels={labels}
            series={[
              {
                label: "日本",
                color: COLORS.japan,
                values: days.map((d) => d.cloudflare?.pv.byCountry?.jp ?? null),
              },
              {
                label: "海外",
                color: COLORS.overseas,
                values: days.map((d) => overseas(d.cloudflare?.pv.byCountry)),
              },
            ]}
          />
        </ChartCard>
        {visitorDays.length > 0 && (
          <ChartCard
            title="訪問者（日別・日本と海外）"
            description="その日にサイトを開いたブラウザの数（ログインしていない人も含む）。同じ人でもスマホと PC は別に数えます"
          >
            <AnalyticsChart
              type="bar"
              stacked
              labels={labels}
              series={[
                {
                  label: "日本",
                  color: COLORS.japan,
                  values: days.map((d) => d.cloudflare?.visitors?.jp ?? null),
                },
                {
                  label: "海外",
                  color: COLORS.overseas,
                  values: days.map((d) => overseas(d.cloudflare?.visitors)),
                },
              ]}
              format={(value) => `${formatCount(value)} 人`}
            />
          </ChartCard>
        )}
        {visitorDays.length > 0 && (
          <ChartCard
            title="訪問者の内訳（日別）"
            description="ログイン中の人と、初めて来た人（このブラウザで初めて開いた）"
          >
            <AnalyticsChart
              labels={labels}
              series={[
                {
                  label: "訪問者",
                  color: COLORS.cfPageViews,
                  values: days.map(
                    (d) => d.cloudflare?.visitors?.total ?? null,
                  ),
                },
                {
                  label: "ログイン中",
                  color: COLORS.dau,
                  values: days.map(
                    (d) => d.cloudflare?.visitors?.loggedIn.total ?? null,
                  ),
                },
                {
                  label: "初めて",
                  color: COLORS.landing,
                  values: days.map(
                    (d) => d.cloudflare?.visitors?.newcomers.total ?? null,
                  ),
                },
              ]}
              format={(value) => `${formatCount(value)} 人`}
            />
          </ChartCard>
        )}
        <RankingCard
          title={
            visitorDays.length > 0
              ? "国（訪問者）"
              : "国（ブラウザで開いた表示）"
          }
          description="サイトの計測を国で分けたもの。下の「国（Cloudflare）」と違い、ボットはほぼ入りません"
          items={mergeCounts(
            visitorDays.length > 0 ? visitorDays : days,
            (d) =>
              visitorDays.length > 0
                ? d.cloudflare?.visitors?.countries
                : d.cloudflare?.pv.byCountry?.countries,
          ).map((item) => ({ ...item, name: countryName(item.name) }))}
        />
      </ChartGrid>
      {months.length > 0 && (
        <>
          <h3 className="pt-2 font-bold text-slate-300 text-sm">
            サービス開始からの推移（月別。今月は途中までの数字）
          </h3>
          <ChartGrid>
            <ChartCard
              title="登録者（累計）"
              description="月の終わりの人数。退会を除く"
            >
              <AnalyticsChart
                labels={monthLabels}
                formatLabel={shortMonth}
                series={[
                  {
                    label: "登録者",
                    color: COLORS.users,
                    values: months.map((month) => month.registered.total),
                  },
                ]}
                format={(value) => `${formatCount(value)} 人`}
              />
            </ChartCard>
            <ChartCard title="新規登録（月別）">
              <AnalyticsChart
                type="bar"
                labels={monthLabels}
                formatLabel={shortMonth}
                series={[
                  {
                    label: "新規登録",
                    color: COLORS.users,
                    values: months.map((month) => month.registered.new),
                  },
                ]}
                format={(value) => `${formatCount(value)} 人`}
              />
            </ChartCard>
            <ChartCard
              title="動いた人（月別）"
              description="その月に投稿かいいねをした人。見るだけの人・生成だけの人は入りません（ログインの記録は 2026/11 からなので、長い推移はこの数字で見ます）"
            >
              <AnalyticsChart
                labels={monthLabels}
                formatLabel={shortMonth}
                series={[
                  {
                    label: "投稿かいいね",
                    color: COLORS.mau,
                    values: months.map((month) => month.active),
                  },
                  {
                    label: "いいねした人",
                    color: COLORS.premium,
                    values: months.map((month) => month.likers),
                  },
                  {
                    label: "投稿した人",
                    color: COLORS.pv,
                    values: months.map((month) => month.posters),
                  },
                ]}
                format={(value) => `${formatCount(value)} 人`}
              />
            </ChartCard>
            <ChartCard title="投稿数・いいね数（月別）">
              <AnalyticsChart
                labels={monthLabels}
                formatLabel={shortMonth}
                series={[
                  {
                    label: "いいね",
                    color: COLORS.premium,
                    values: months.map((month) => month.likes),
                  },
                  {
                    label: "投稿",
                    color: COLORS.pv,
                    values: months.map((month) => month.posts),
                  },
                ]}
              />
            </ChartCard>
          </ChartGrid>
        </>
      )}
    </div>
  )
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
    <div className="space-y-3 sm:space-y-4">
      {pnl ? (
        <KpiGrid>
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
            wide
          />
          <Card className={`${CARD} col-span-2 xl:col-span-1`}>
            <CardContent className="space-y-1.5 px-4 py-4 text-sm sm:px-6 sm:py-5">
              <p className="text-slate-400 text-xs">今月の費用の内訳</p>
              {COST_KEYS.map((key) => {
                const value = pnl.month.costs[key] ?? 0
                return (
                  <div key={key} className="space-y-0.5">
                    <div className="flex justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span
                          className="inline-block size-2 shrink-0 rounded-full"
                          style={{ background: COLORS[key] }}
                        />
                        {COST_LABELS[key]}
                      </span>
                      <span className="tabular-nums">{formatYen(value)}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10">
                      <div
                        className="h-1 rounded-full"
                        style={{
                          background: COLORS[key],
                          width: `${pnl.month.costTotal > 0 ? Math.min(100, (value / pnl.month.costTotal) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
              <p className="pt-1 text-slate-500 text-xs">
                1 ドル {pnl.today.fxUsdJpy.toFixed(1)} 円
                {pnl.month.daysWithCosts < pnl.month.storedDays &&
                  `・費用は ${pnl.month.storedDays - pnl.month.daysWithCosts} 日分が未集計`}
              </p>
            </CardContent>
          </Card>
        </KpiGrid>
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
        <ChartGrid>
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
        </ChartGrid>
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
  /** スマホで 2 列分の幅を使う（説明が長いもの） */
  wide?: boolean
}) {
  return (
    <Card className={`${CARD} ${props.wide ? "col-span-2 xl:col-span-1" : ""}`}>
      <CardContent className="space-y-1 px-3.5 py-3.5 sm:px-6 sm:py-5">
        <p className="text-[11px] text-slate-400 leading-snug sm:text-xs">
          {props.label}
        </p>
        <p
          className={`font-bold text-xl tabular-nums leading-tight sm:text-2xl ${props.valueClassName ?? ""}`}
        >
          {props.value}
        </p>
        {props.change !== undefined && props.change !== null && (
          <p
            className={`text-[11px] sm:text-xs ${props.change >= 0 ? "text-emerald-300" : "text-rose-300"}`}
          >
            {props.change >= 0 ? "▲" : "▼"} 前の期間から{" "}
            {props.change >= 0 ? "+" : ""}
            {(props.change * 100).toFixed(1)}%
          </p>
        )}
        {props.detail && (
          <p className="text-[11px] text-slate-400 leading-snug sm:text-xs">
            {props.detail}
          </p>
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
    <Card className={`${CARD} min-w-0`}>
      <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
        <CardTitle className="text-sm sm:text-base">{props.title}</CardTitle>
        {props.description && (
          <CardDescription className="text-slate-400 text-xs sm:text-sm">
            {props.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-3 pb-4 sm:px-6 sm:pb-6">
        {props.children}
      </CardContent>
    </Card>
  )
}

/** スマホで最初に出す件数（残りはボタンで開く） */
const RANKING_COLLAPSED = 5

function RankingCard(props: {
  title: string
  description?: string
  items: RankedItem[]
  labels?: Record<string, string>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const total = props.items.reduce((sum, item) => sum + item.count, 0)
  const items = props.items.slice(0, 12)
  return (
    <ChartCard title={props.title} description={props.description}>
      {items.length === 0 ? (
        <p className="text-slate-400 text-sm">まだ数字がありません。</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.name}
              className={`space-y-1 ${index >= RANKING_COLLAPSED && !isOpen ? "hidden sm:block" : ""}`}
            >
              <div className="flex justify-between gap-2 text-sm">
                <span className="truncate">
                  {props.labels?.[item.name] ?? item.name}
                </span>
                <span className="shrink-0 text-slate-300 tabular-nums">
                  {formatCount(item.count)}
                  <span className="ml-1 text-slate-400 text-xs">
                    {total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%
                  </span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-1.5 rounded-full bg-sky-400"
                  style={{
                    width: `${total > 0 ? (item.count / items[0].count) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
          {items.length > RANKING_COLLAPSED && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full rounded-full border border-white/10 py-2 text-slate-300 text-xs active:bg-white/10 sm:hidden"
            >
              {isOpen
                ? "閉じる"
                : `残り ${items.length - RANKING_COLLAPSED} 件を見る`}
            </button>
          )}
        </div>
      )}
    </ChartCard>
  )
}

/** スマホで最初に出す日数（残りはボタンで開く） */
const DAILY_COLLAPSED = 10

function DailyTable(props: { days: AnalyticsDay[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const rows = [...props.days]
    .reverse()
    .slice(0, 31)
    .map((day) => ({
      day,
      active: day.subscriptions
        ? day.subscriptions.active.LITE +
          day.subscriptions.active.STANDARD +
          day.subscriptions.active.PREMIUM
        : null,
      started: day.subscriptions
        ? day.subscriptions.started.LITE +
          day.subscriptions.started.STANDARD +
          day.subscriptions.started.PREMIUM
        : null,
      profit: day.costs && day.stripe ? day.stripe.net - day.costs.jpy : null,
    }))
  return (
    <ChartCard title="日別の数字（直近 31 日）">
      {/* スマホ: 1 日 1 行。押すと残りの数字が開く */}
      <div className="sm:hidden">
        <div className="grid grid-cols-[1fr_5rem_3rem_3.5rem_1rem] gap-x-2 px-1 pb-1 text-right text-[11px] text-slate-400">
          <span className="text-left">日付</span>
          <span>Stripe 売上</span>
          <span>会員</span>
          <span>生成</span>
          <span />
        </div>
        {rows.slice(0, isOpen ? rows.length : DAILY_COLLAPSED).map((row) => (
          <details
            key={row.day.day}
            className="group border-white/10 border-t text-xs"
          >
            <summary className="grid cursor-pointer list-none grid-cols-[1fr_5rem_3rem_3.5rem_1rem] items-center gap-x-2 px-1 py-2.5 text-right tabular-nums [&::-webkit-details-marker]:hidden">
              <span className="text-left">{shortDay(row.day.day)}</span>
              <span>
                {row.day.stripe ? formatYen(row.day.stripe.gross) : "-"}
              </span>
              <span>{row.active ?? "-"}</span>
              <span>
                {row.day.generations
                  ? formatCount(row.day.generations.results)
                  : "-"}
              </span>
              <ChevronDown className="size-3.5 text-slate-500 transition group-open:rotate-180" />
            </summary>
            <dl className="mb-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-white/5 px-3 py-2 tabular-nums">
              {(
                [
                  ["収支", row.profit === null ? "-" : signedYen(row.profit)],
                  ["費用", row.day.costs ? formatYen(row.day.costs.jpy) : "-"],
                  [
                    "手数料引き後",
                    row.day.stripe ? formatYen(row.day.stripe.net) : "-",
                  ],
                  [
                    "コイン",
                    row.day.coins ? formatYen(row.day.coins.yen) : "-",
                  ],
                  ["新規", row.started ?? "-"],
                  ["終了", row.day.subscriptions?.ended ?? "-"],
                  [
                    "ページ表示",
                    row.day.cloudflare?.pv.total
                      ? formatCount(row.day.cloudflare.pv.total)
                      : "-",
                  ],
                  [
                    "外から",
                    row.day.cloudflare?.pv.total
                      ? formatCount(row.day.cloudflare.pv.landings)
                      : "-",
                  ],
                  [
                    "CF 訪問者",
                    row.day.cloudflare
                      ? formatCount(row.day.cloudflare.uniques)
                      : "-",
                  ],
                  [
                    "ログインした人",
                    row.day.users?.login
                      ? formatCount(row.day.users.login.dau)
                      : "-",
                  ],
                  [
                    "新規登録",
                    row.day.users
                      ? formatCount(row.day.users.registered.new)
                      : "-",
                  ],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-slate-400">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </details>
        ))}
        {rows.length > DAILY_COLLAPSED && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="mt-2 w-full rounded-full border border-white/10 py-2 text-slate-300 text-xs active:bg-white/10"
          >
            {isOpen
              ? "閉じる"
              : `残り ${rows.length - DAILY_COLLAPSED} 日を見る`}
          </button>
        )}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[1020px] text-right text-xs tabular-nums">
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
              <th className="font-normal">ログイン</th>
              <th className="font-normal">新規登録</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ day, active, started }) => (
              <tr key={day.day} className="border-white/10 border-t">
                <td className="py-1.5 text-left">{day.day}</td>
                <td>{active ?? "-"}</td>
                <td>{started ?? "-"}</td>
                <td>{day.subscriptions?.ended ?? "-"}</td>
                <td>{day.stripe ? formatYen(day.stripe.gross) : "-"}</td>
                <td>{day.stripe ? formatYen(day.stripe.net) : "-"}</td>
                <td>{day.coins ? formatYen(day.coins.yen) : "-"}</td>
                <td>
                  {day.generations ? formatCount(day.generations.results) : "-"}
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
                <td>
                  {day.users?.login ? formatCount(day.users.login.dau) : "-"}
                </td>
                <td>
                  {day.users ? formatCount(day.users.registered.new) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  )
}
