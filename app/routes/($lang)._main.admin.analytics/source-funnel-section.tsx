import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { SOURCE_LABELS } from "./analytics-data"

const CARD =
  "rounded-2xl border-white/10 bg-white/5 text-slate-100 shadow-none sm:rounded-[28px]"

/** aipictors-api の event_source_funnel_daily を期間で足したもの（/internal/analytics/events?kind=sources） */
export type SourceFunnelRow = {
  referrer: string
  device: string
  step: number
  step_name: string
  sessions: number
  users: number
  days: number
}

/** 段階（step 1〜6）。順番は問わず、いちばん先まで進んだ段階とそれより前を数えている */
const STEPS = [
  { step: 1, label: "来た", detail: "最初のページを開いた" },
  {
    step: 2,
    label: "2 ページ目以降も見た・操作した",
    detail: "直帰しなかった",
  },
  {
    step: 3,
    label: "課金の案内を見た",
    detail: "コイン不足・プランの案内・プランのページ",
  },
  {
    step: 4,
    label: "プランを選びに進んだ",
    detail: "案内・お試しを押した、プランのページを開いた",
  },
  { step: 5, label: "決済を始めた", detail: "Stripe へ（コインの購入は除く）" },
  { step: 6, label: "サブスク加入", detail: "有料プラン・前払い・お試し開始" },
] as const

const KINDS = [
  { step: 91, label: "有料プラン" },
  { step: 92, label: "前払いパス" },
  { step: 93, label: "お試し開始" },
] as const

const DEVICES = [
  { id: "all", label: "すべて" },
  { id: "mobile", label: "スマホ" },
  { id: "desktop", label: "PC" },
  { id: "tablet", label: "タブレット" },
] as const

type DeviceId = (typeof DEVICES)[number]["id"]

const LABELS: Record<string, string> = {
  ...SOURCE_LABELS,
  internal: "サイト内（30 分あけて続きから・別タブ）",
}

/** 流入元ごとの段階の数（steps[step] = セッション数） */
type SourceFunnel = { referrer: string; steps: Map<number, number> }

/** 1% 未満は小数 2 桁（加入率など小さい数を 0.1% に丸めて見分けがつかなくならないように） */
const toPercent = (value: number, base: number) => {
  if (base <= 0) return "-"
  const rate = (value / base) * 100
  return `${rate.toFixed(rate > 0 && rate < 1 ? 2 : 1)}%`
}

/** 数が小さいほど赤く、大きいほど緑に寄せる（前の段階からの通過率） */
const rateColor = (value: number, base: number) => {
  if (base === 0) return "text-slate-500"
  const rate = value / base
  if (rate >= 0.5) return "text-emerald-300"
  if (rate >= 0.2) return "text-lime-300"
  if (rate >= 0.05) return "text-amber-300"
  return "text-rose-300"
}

function collect(rows: SourceFunnelRow[], device: DeviceId) {
  const map = new Map<string, Map<number, number>>()
  for (const row of rows) {
    if (device !== "all" && row.device !== device) continue
    const steps = map.get(row.referrer) ?? new Map<number, number>()
    steps.set(
      row.step,
      (steps.get(row.step) ?? 0) + (Number(row.sessions) || 0),
    )
    map.set(row.referrer, steps)
  }
  const sources: SourceFunnel[] = [...map.entries()]
    .map(([referrer, steps]) => ({ referrer, steps }))
    .filter((source) => (source.steps.get(1) ?? 0) > 0)
    // 外からの流入を先に、サイト内・不明は最後に
    .sort((a, b) => {
      const tail = (r: string) => (r === "internal" || r === "unknown" ? 1 : 0)
      return (
        tail(a.referrer) - tail(b.referrer) ||
        (b.steps.get(1) ?? 0) - (a.steps.get(1) ?? 0)
      )
    })
  const total = new Map<number, number>()
  for (const source of sources) {
    for (const [step, n] of source.steps) {
      total.set(step, (total.get(step) ?? 0) + n)
    }
  }
  return { sources, total }
}

/**
 * 流入元ごとの、来てからサブスクに加入するまでの到達と離脱（自前の計測・セッション単位）
 * 中身は aipictors-api の lib/event-log.ts（SOURCE_FUNNEL_STEPS）
 */
export function SourceFunnelSection(props: {
  rows: SourceFunnelRow[] | null | undefined
}) {
  const [device, setDevice] = useState<DeviceId>("all")
  const rows = props.rows ?? []
  const days = rows.reduce(
    (max, row) => Math.max(max, Number(row.days) || 0),
    0,
  )

  if (rows.length === 0) {
    return (
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="text-base">流入元 → サブスク加入</CardTitle>
          <CardDescription className="text-slate-400">
            2026-11-27 から記録しています。翌日 00:30 に前日分がまとまります
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const { sources, total } = collect(rows, device)

  return (
    <Card className={CARD}>
      <CardHeader className="space-y-3">
        <div className="space-y-1">
          <CardTitle className="text-base">流入元 → サブスク加入</CardTitle>
          <CardDescription className="text-slate-400">
            自前の計測（{days}{" "}
            日分）。どこから来たセッションが、どの段階まで進んだか。 ↓ の %
            は前の段階から進んだ割合、右の % は来た数に対する割合。
            段階は順番を問わず、いちばん先まで進んだところまでを数えます（セッションはタブごと・30
            分あくと別。日をまたいで後日加入した人はその日のセッションに付きます）
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEVICES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDevice(item.id)}
              className={`rounded-full border px-3 py-1 text-xs ${
                device === item.id
                  ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                  : "border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sources.length === 0 ? (
          <p className="text-slate-400 text-sm">
            この端末の記録はまだありません
          </p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <FunnelCard title="全体" steps={total} highlight />
              {sources.map((source) => (
                <FunnelCard
                  key={source.referrer}
                  title={LABELS[source.referrer] ?? source.referrer}
                  steps={source.steps}
                />
              ))}
            </div>
            <CompareTable sources={sources} total={total} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** 1 つの流入元の縦のファネル。段階のあいだに ↓ 通過率（離脱数） */
function FunnelCard(props: {
  title: string
  steps: Map<number, number>
  highlight?: boolean
}) {
  const first = props.steps.get(1) ?? 0
  const subscribed = props.steps.get(6) ?? 0
  const kinds = KINDS.map((kind) => ({
    ...kind,
    n: props.steps.get(kind.step) ?? 0,
  })).filter((kind) => kind.n > 0)
  return (
    <div
      className={`space-y-1 rounded-2xl border p-3 text-sm sm:p-4 ${
        props.highlight
          ? "border-cyan-300/40 bg-cyan-300/5"
          : "border-white/10 bg-black/10"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-bold">{props.title}</p>
        <p className="text-slate-400 text-xs tabular-nums">
          加入率{" "}
          <span className="font-bold text-cyan-200">
            {toPercent(subscribed, first)}
          </span>
        </p>
      </div>
      {STEPS.map((step, index) => {
        const n = props.steps.get(step.step) ?? 0
        const previous =
          index === 0 ? n : (props.steps.get(STEPS[index - 1].step) ?? 0)
        const width = first > 0 ? Math.max(2, (n / first) * 100) : 0
        return (
          <div key={step.step}>
            {index > 0 && (
              <div className="flex items-center gap-2 py-0.5 pl-3 text-xs tabular-nums">
                <span className="text-slate-500">↓</span>
                <span className={`font-bold ${rateColor(n, previous)}`}>
                  {toPercent(n, previous)}
                </span>
                {previous - n > 0 && (
                  <span className="text-slate-500">
                    （離脱 {(previous - n).toLocaleString()}）
                  </span>
                )}
              </div>
            )}
            <div className="relative overflow-hidden rounded-lg bg-white/5">
              <div
                className={`absolute inset-y-0 left-0 ${
                  step.step === 6 ? "bg-cyan-400/35" : "bg-sky-400/20"
                }`}
                style={{ width: `${width}%` }}
              />
              <div className="relative flex items-center justify-between gap-2 px-2.5 py-1.5">
                <span className="min-w-0">
                  <span className="block truncate text-slate-100">
                    {step.label}
                  </span>
                  <span className="block truncate text-[11px] text-slate-400">
                    {step.detail}
                  </span>
                </span>
                <span className="shrink-0 text-right tabular-nums">
                  <span className="block font-bold">{n.toLocaleString()}</span>
                  <span className="block text-[11px] text-slate-400">
                    {index === 0 ? "100%" : toPercent(n, first)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )
      })}
      {kinds.length > 0 && (
        <p className="pt-1 text-slate-400 text-xs">
          内訳: {kinds.map((kind) => `${kind.label} ${kind.n}`).join(" / ")}
        </p>
      )}
    </div>
  )
}

/** 流入元を並べて比べる表（段階ごとの数と、前の段階からの通過率） */
function CompareTable(props: {
  sources: SourceFunnel[]
  total: Map<number, number>
}) {
  const lines = [
    { referrer: "全体", steps: props.total, isTotal: true },
    ...props.sources.map((source) => ({ ...source, isTotal: false })),
  ]
  return (
    <div className="space-y-1 text-sm">
      <p className="font-bold">流入元ごとの比較</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="text-slate-400 text-xs">
              <th className="py-1 text-left font-normal">流入元</th>
              {STEPS.map((step) => (
                <th key={step.step} className="py-1 text-right font-normal">
                  {step.label}
                </th>
              ))}
              <th className="py-1 text-right font-normal">加入率</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const first = line.steps.get(1) ?? 0
              return (
                <tr
                  key={line.referrer}
                  className={`border-white/5 border-t ${line.isTotal ? "font-bold" : ""}`}
                >
                  <td className="py-1 text-slate-300">
                    {line.isTotal
                      ? line.referrer
                      : (LABELS[line.referrer] ?? line.referrer)}
                  </td>
                  {STEPS.map((step, index) => {
                    const n = line.steps.get(step.step) ?? 0
                    const previous =
                      index === 0
                        ? n
                        : (line.steps.get(STEPS[index - 1].step) ?? 0)
                    return (
                      <td
                        key={step.step}
                        className="py-1 text-right tabular-nums"
                      >
                        {n.toLocaleString()}
                        {index > 0 && (
                          <span
                            className={`block font-normal text-[11px] ${rateColor(n, previous)}`}
                          >
                            {toPercent(n, previous)}
                          </span>
                        )}
                      </td>
                    )
                  })}
                  <td className="py-1 text-right text-cyan-200 tabular-nums">
                    {toPercent(line.steps.get(6) ?? 0, first)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
