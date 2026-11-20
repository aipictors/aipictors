import { gql, useQuery } from "@apollo/client/index"
import type { MetaFunction } from "@remix-run/cloudflare"
import { getAuth, getIdToken } from "firebase/auth"
import { RefreshCw, Wallet } from "lucide-react"
import { useCallback, useContext, useEffect, useState } from "react"
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
import { Link } from "~/lib/app/locale-router"
import { AnalyticsChart } from "~/routes/($lang)._main.admin.analytics/analytics-chart"
import {
  COST_KEYS,
  COST_LABELS,
  type CostKey,
  formatYen,
} from "~/routes/($lang)._main.admin.analytics/analytics-data"
import { createMeta } from "~/utils/create-meta"

const TITLE = "維持費の内訳"
const DESCRIPTION =
  "今の構成で 1 か月動かしたときの維持費。RunPod は今ある GPU サーバーの時間単価 × 1 日の稼働時間、ほかのサービスは直近 7 日の実額の平均 × 30 日です。"

const CARD =
  "rounded-2xl border-white/10 bg-white/5 text-slate-100 shadow-none sm:rounded-[28px]"

const COLORS: Record<CostKey, string> = {
  runpod: "#f472b6",
  cloudflare: "#f97316",
  google: "#60a5fa",
  openai: "#a3e635",
  xai: "#e2e8f0",
}

/** Cloudflare の細目の名前 */
const CLOUDFLARE_PARTS: Record<string, string> = {
  workers: "Workers（実行）",
  r2Storage: "R2 保存",
  r2Ops: "R2 操作",
  d1: "D1",
  plans: "契約（Pro・Workers Paid・Stream）",
  stream: "Stream",
  durableObjects: "Durable Objects",
  kv: "KV",
}

/** RunPod の残りがこの時間を切ったら赤くする */
const LOW_RUNWAY_HOURS = 24

type RunpodPod = {
  id: string
  name: string
  role: "free" | "paid" | "night" | "other"
  roleLabel: string
  status: string
  gpu: string | null
  costPerHr: number
  hoursPerDay: number
  startedAt: string | null
  monthlyUsd: number
}

type CostBreakdown = {
  at: number
  fxUsdJpy: number
  nightHoursPerDay: number
  runpod: {
    balance: number
    spendPerHr: number
    runwayHours: number | null
    pods: RunpodPod[]
    volumes: { id: string; name: string; sizeGb: number }[]
    storage: { perHr: number; monthlyUsd: number }
    monthlyUsd: number
    monthlyJpy: number
  } | null
  recent: {
    days: number
    from: string | null
    to: string | null
    services: Record<
      Exclude<CostKey, "runpod">,
      {
        dailyJpy: number
        monthlyJpy: number
        detail: { name: string; monthlyJpy: number }[]
      }
    >
  }
  monthlyJpy: Record<CostKey, number> & {
    runpodFromRecent: number
    total: number
  }
  daily: { day: string; jpy: number; items: Record<CostKey, number> }[]
  errors: string[]
}

const viewerQuery = gql`
  query AdminCostsViewer {
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
      enTitle: "Admin Costs",
      description: DESCRIPTION,
      enDescription: "Monthly running costs by service and GPU server.",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )

const formatUsd = (value: number) => `$${value.toFixed(2)}`

const shortDay = (day: string) => day.slice(5).replace("-", "/")

export default function AdminCostsPage() {
  const authContext = useContext(AuthContext)
  const [data, setData] = useState<CostBreakdown | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })
  const hasPermission = Boolean(viewerData?.viewer?.isModerator)

  const load = useCallback(async (fresh: boolean) => {
    setIsLoading(true)
    setError(null)
    try {
      const currentUser = getAuth().currentUser
      if (!currentUser) throw new Error("ログイン情報を確認できませんでした。")
      const idToken = await getIdToken(currentUser)
      const response = await fetch(
        `/api/admin/costs${fresh ? "?fresh=1" : ""}`,
        { headers: { Authorization: `Bearer ${idToken}` } },
      )
      const body = (await response.json()) as {
        error: string | null
        data: CostBreakdown | null
      }
      if (!response.ok || !body.data)
        throw new Error(body.error ?? "読み込めませんでした。")
      setData(body.data)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "読み込めませんでした。",
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authContext.isLoading || authContext.isNotLoggedIn || !hasPermission)
      return
    load(false)
  }, [authContext.isLoading, authContext.isNotLoggedIn, hasPermission, load])

  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell title={TITLE} description={DESCRIPTION} icon={Wallet}>
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
      <AdminPageShell title={TITLE} description={DESCRIPTION} icon={Wallet}>
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
    <AdminPageShell title={TITLE} description={DESCRIPTION} icon={Wallet}>
      <div className="space-y-5 sm:space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-slate-400 text-xs">
          {data && (
            <span>
              {new Date(data.at * 1000).toLocaleString("ja-JP", {
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              時点・1 ドル {data.fxUsdJpy.toFixed(1)} 円
            </span>
          )}
          <button
            type="button"
            onClick={() => load(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw
              className={`size-3 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "読み込み中..." : "最新にする"}
          </button>
          <Link
            to="/admin/analytics"
            className="rounded-full border border-white/10 px-3 py-1.5 text-slate-200 transition hover:bg-white/10"
          >
            収支・分析へ
          </Link>
        </div>
        {error && (
          <Alert className={CARD}>
            <AlertDescription className="text-rose-300">
              {error}
            </AlertDescription>
          </Alert>
        )}
        {data && <CostsBody data={data} />}
      </div>
    </AdminPageShell>
  )
}

function CostsBody(props: { data: CostBreakdown }) {
  const { data } = props
  const { runpod, monthlyJpy, recent } = data
  const total = monthlyJpy.total
  const lowRunway =
    runpod?.runwayHours != null && runpod.runwayHours < LOW_RUNWAY_HOURS
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
        <Kpi
          label="月の維持費（見込み）"
          value={formatYen(total)}
          detail={`1 日 ${formatYen(total / 30)}`}
        />
        <Kpi
          label="うち RunPod（生成 GPU）"
          value={formatYen(monthlyJpy.runpod)}
          detail={
            runpod
              ? `月 ${formatUsd(runpod.monthlyUsd)}・直近 7 日の実績ペースは ${formatYen(monthlyJpy.runpodFromRecent)}`
              : "今の構成を読めなかったので直近 7 日の平均"
          }
        />
        <Kpi
          label="RunPod の残高"
          value={runpod ? formatUsd(runpod.balance) : "-"}
          detail={
            runpod?.runwayHours != null
              ? `今のペース（${formatUsd(runpod.spendPerHr)}/時）であと約 ${runpod.runwayHours} 時間${lowRunway ? "。チャージが必要です" : ""}`
              : undefined
          }
          valueClassName={lowRunway ? "text-rose-300" : undefined}
        />
        <Kpi
          label="ほかのサービス"
          value={formatYen(total - monthlyJpy.runpod)}
          detail={
            recent.from && recent.to
              ? `${shortDay(recent.from)}〜${shortDay(recent.to)} の ${recent.days} 日の平均 × 30`
              : "日別の費用がまだありません"
          }
        />
      </div>

      {data.errors.length > 0 && (
        <p className="text-amber-300 text-xs">
          取れなかったもの: {data.errors.join(" / ")}
        </p>
      )}

      <Card className={CARD}>
        <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
          <CardTitle className="text-sm sm:text-base">
            サービス別（月額）
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pb-4 text-sm sm:px-6 sm:pb-6">
          {COST_KEYS.map((key) => (
            <ShareRow
              key={key}
              label={COST_LABELS[key]}
              color={COLORS[key]}
              value={monthlyJpy[key] ?? 0}
              total={total}
            />
          ))}
        </CardContent>
      </Card>

      {runpod && (
        <RunpodCard
          runpod={runpod}
          fx={data.fxUsdJpy}
          nightHours={data.nightHoursPerDay}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <DetailCard
          title="Cloudflare の内訳"
          color={COLORS.cloudflare}
          total={recent.services.cloudflare.monthlyJpy}
          items={recent.services.cloudflare.detail.map((item) => ({
            ...item,
            name: CLOUDFLARE_PARTS[item.name] ?? item.name,
          }))}
        />
        <DetailCard
          title="Google（Gemini）の内訳"
          color={COLORS.google}
          total={recent.services.google.monthlyJpy}
          items={recent.services.google.detail}
        />
        <div className="space-y-4">
          <DetailCard
            title="xAI（Grok）の内訳"
            color={COLORS.xai}
            total={recent.services.xai.monthlyJpy}
            items={recent.services.xai.detail}
          />
          <DetailCard
            title="OpenAI の内訳"
            color={COLORS.openai}
            total={recent.services.openai.monthlyJpy}
            items={recent.services.openai.detail}
          />
        </div>
      </div>

      {data.daily.length > 0 && (
        <Card className={`${CARD} min-w-0`}>
          <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
            <CardTitle className="text-sm sm:text-base">
              費用の実績（日別・直近 30 日）
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              毎日 00:30
              に前日分を保存した実額。構成を変えた日より前は古い構成の金額です
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-4 sm:px-6 sm:pb-6">
            <AnalyticsChart
              type="bar"
              stacked
              labels={data.daily.map((day) => day.day)}
              series={COST_KEYS.map((key) => ({
                label: COST_LABELS[key],
                color: COLORS[key],
                values: data.daily.map((day) => day.items[key] ?? 0),
              }))}
              format={formatYen}
            />
          </CardContent>
        </Card>
      )}

      <p className="text-slate-500 text-xs leading-relaxed">
        RunPod は今ある Pod の時間単価から出しています（常時の台は 24
        時間、夜の台は {data.nightHoursPerDay} 時間、止めている台は
        0）。保存領域と止めた Pod のディスクは、今の消費額から動いている Pod
        の分を引いた残りです。Cloudflare は使用量 ×
        定価（無料枠を日割りで引く）＋契約の日割り、ほかは各社の請求の実額です。Stripe
        の手数料・ドメイン・Apple などの年額は入っていません。
      </p>
    </div>
  )
}

function RunpodCard(props: {
  runpod: NonNullable<CostBreakdown["runpod"]>
  fx: number
  nightHours: number
}) {
  const { runpod, fx } = props
  const volumeGb = runpod.volumes.reduce(
    (sum, volume) => sum + volume.sizeGb,
    0,
  )
  return (
    <Card className={CARD}>
      <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
        <CardTitle className="text-sm sm:text-base">
          RunPod（生成 GPU サーバー）の今の構成
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs sm:text-sm">
          今の消費 {formatUsd(runpod.spendPerHr)}/時・月{" "}
          {formatUsd(runpod.monthlyUsd)}（{formatYen(runpod.monthlyJpy)}）
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-4 sm:px-6 sm:pb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-slate-400 text-xs">
              <tr className="border-white/10 border-b">
                <th className="px-2 py-2 font-normal">役割</th>
                <th className="px-2 py-2 font-normal">GPU</th>
                <th className="px-2 py-2 font-normal">状態</th>
                <th className="px-2 py-2 text-right font-normal">時間単価</th>
                <th className="px-2 py-2 text-right font-normal">1 日</th>
                <th className="px-2 py-2 text-right font-normal">月額</th>
              </tr>
            </thead>
            <tbody>
              {runpod.pods.map((pod) => (
                <tr
                  key={pod.id}
                  className={`border-white/5 border-b ${pod.monthlyUsd === 0 ? "text-slate-500" : ""}`}
                >
                  <td className="px-2 py-2">
                    <div>{pod.roleLabel}</div>
                    <div className="text-[11px] text-slate-500">{pod.name}</div>
                  </td>
                  <td className="px-2 py-2">{pod.gpu ?? "-"}</td>
                  <td className="px-2 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        pod.status === "RUNNING"
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {pod.status === "RUNNING" ? "稼働中" : "停止"}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {formatUsd(pod.costPerHr)}/時
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {pod.hoursPerDay} 時間
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {formatYen(pod.monthlyUsd * fx)}
                    <div className="text-[11px] text-slate-500">
                      {formatUsd(pod.monthlyUsd)}
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="border-white/5 border-b">
                <td className="px-2 py-2">
                  <div>保存領域・止めた Pod のディスク</div>
                  <div className="text-[11px] text-slate-500">
                    ネットワークボリューム {volumeGb}GB ほか
                  </div>
                </td>
                <td className="px-2 py-2">-</td>
                <td className="px-2 py-2">-</td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatUsd(runpod.storage.perHr)}/時
                </td>
                <td className="px-2 py-2 text-right tabular-nums">24 時間</td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatYen(runpod.storage.monthlyUsd * fx)}
                  <div className="text-[11px] text-slate-500">
                    {formatUsd(runpod.storage.monthlyUsd)}
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={5}
                  className="px-2 pt-2 text-right text-slate-400 text-xs"
                >
                  合計
                </td>
                <td className="px-2 pt-2 text-right font-bold tabular-nums">
                  {formatYen(runpod.monthlyJpy)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function DetailCard(props: {
  title: string
  color: string
  total: number
  items: { name: string; monthlyJpy: number }[]
}) {
  return (
    <Card className={CARD}>
      <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
        <CardTitle className="flex items-baseline justify-between gap-2 text-sm sm:text-base">
          <span>{props.title}</span>
          <span className="tabular-nums">{formatYen(props.total)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4 text-sm sm:px-6 sm:pb-6">
        {props.items.length === 0 ? (
          <p className="text-slate-500 text-xs">細目なし</p>
        ) : (
          props.items.map((item) => (
            <ShareRow
              key={item.name}
              label={item.name}
              color={props.color}
              value={item.monthlyJpy}
              total={props.total}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

function ShareRow(props: {
  label: string
  color: string
  value: number
  total: number
}) {
  const ratio = props.total > 0 ? Math.min(1, props.value / props.total) : 0
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1.5 text-slate-300">
          <span
            className="inline-block size-2 shrink-0 rounded-full"
            style={{ background: props.color }}
          />
          <span className="truncate" title={props.label}>
            {props.label}
          </span>
        </span>
        <span className="shrink-0 tabular-nums">
          {formatYen(props.value)}
          <span className="ml-1.5 text-slate-500 text-xs">
            {Math.round(ratio * 100)}%
          </span>
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/10">
        <div
          className="h-1 rounded-full"
          style={{ background: props.color, width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  )
}

function Kpi(props: {
  label: string
  value: string
  detail?: string
  valueClassName?: string
}) {
  return (
    <Card className={CARD}>
      <CardContent className="space-y-1 px-3.5 py-3.5 sm:px-6 sm:py-5">
        <p className="text-[11px] text-slate-400 leading-snug sm:text-xs">
          {props.label}
        </p>
        <p
          className={`font-bold text-xl tabular-nums leading-tight sm:text-2xl ${props.valueClassName ?? ""}`}
        >
          {props.value}
        </p>
        {props.detail && (
          <p className="text-[11px] text-slate-400 leading-snug sm:text-xs">
            {props.detail}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
