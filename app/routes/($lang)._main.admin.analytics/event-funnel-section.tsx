import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import type { SourceFunnelRow } from "./source-funnel-section"

const CARD =
  "rounded-2xl border-white/10 bg-white/5 text-slate-100 shadow-none sm:rounded-[28px]"

type FunnelRow = {
  day: string
  funnel: string
  step: number
  step_name: string
  sessions: number
  users: number
}

type PageRow = {
  day: string
  page: string
  views: number
  sessions: number
  entries: number
  exits: number
  bounces: number
}

export type EventSummaryResponse = {
  funnels: FunnelRow[] | null
  pages: PageRow[] | null
  sources?: SourceFunnelRow[] | null
}

const FUNNEL_LABELS: Record<string, string> = {
  generate_to_paid: "生成 → 課金",
  coin_shortage: "コイン不足の案内 → 課金",
  upsell: "課金の案内（どこでも）→ 課金",
  plus_page: "プランのページ → 課金",
  visit_to_generate: "来た → 生成",
  signup: "来た → 登録 → 生成 → 投稿",
  post: "投稿画面 → 投稿",
}

const STEP_LABELS: Record<string, string> = {
  generation_view: "生成画面",
  generate: "生成した",
  upsell_view: "課金の案内を見た",
  upsell_click: "案内を押した",
  checkout: "決済を始めた",
  paid: "課金・お試し開始",
  shortage_view: "コイン不足の案内",
  shortage_click: "プラン・コイン・お試しを押した",
  plus_view: "プランのページ",
  visit: "来た",
  sign_up: "登録した",
  post: "投稿した",
  post_form_view: "投稿画面",
}

const PAGE_LABELS: Record<string, string> = {
  top: "トップ",
  post: "作品",
  r_post: "作品（R18）",
  r: "R18 の一覧",
  generation: "生成",
  search: "タグ・検索",
  ranking: "ランキング",
  plus: "プラン",
  event: "イベント・お題",
  model: "モデル",
  app: "投稿・設定など",
  other: "その他（ユーザーなど）",
}

const percent = (value: number, base: number) =>
  base > 0 ? `${((value / base) * 100).toFixed(1)}%` : "-"

/**
 * 操作の記録（自前の計測）のファネルと、ページの種類ごとの離脱（aipictors-api の event_funnel_daily・event_page_daily）
 * 詳しい分析は ~/Documents/aipictors-analytics/events.py
 */
export function EventFunnelSection(props: {
  data: EventSummaryResponse | undefined
}) {
  const funnels = props.data?.funnels ?? []
  const pages = props.data?.pages ?? []
  if (funnels.length === 0 && pages.length === 0) {
    return (
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="text-base">ファネル</CardTitle>
          <CardDescription className="text-slate-400">
            2026-11-27 から記録しています。翌日 00:30 に前日分がまとまります
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const byFunnel = new Map<string, Map<number, { name: string; n: number }>>()
  for (const row of funnels) {
    const steps = byFunnel.get(row.funnel) ?? new Map()
    const step = steps.get(row.step) ?? { name: row.step_name, n: 0 }
    step.n += Number(row.sessions) || 0
    steps.set(row.step, step)
    byFunnel.set(row.funnel, steps)
  }
  const days = new Set(funnels.map((row) => row.day))

  const byPage = new Map<
    string,
    { views: number; entries: number; exits: number; bounces: number }
  >()
  for (const row of pages) {
    const page = byPage.get(row.page) ?? {
      views: 0,
      entries: 0,
      exits: 0,
      bounces: 0,
    }
    page.views += Number(row.views) || 0
    page.entries += Number(row.entries) || 0
    page.exits += Number(row.exits) || 0
    page.bounces += Number(row.bounces) || 0
    byPage.set(row.page, page)
  }
  const pageRows = [...byPage.entries()].sort((a, b) => b[1].views - a[1].views)

  return (
    <Card className={CARD}>
      <CardHeader>
        <CardTitle className="text-base">ファネル</CardTitle>
        <CardDescription className="text-slate-400">
          自前の計測。その日のうちに順番どおり進んだセッション数の合計（
          {days.size} 日分）
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[...byFunnel.entries()].map(([funnel, steps]) => {
            const ordered = [...steps.entries()].sort((a, b) => a[0] - b[0])
            const first = ordered[0]?.[1].n ?? 0
            return (
              <div key={funnel} className="space-y-1 text-sm">
                <p className="font-bold">{FUNNEL_LABELS[funnel] ?? funnel}</p>
                <table className="w-full">
                  <tbody>
                    {ordered.map(([step, value], index) => (
                      <tr key={step} className="border-white/5 border-t">
                        <td className="py-1 text-slate-300">
                          {STEP_LABELS[value.name] ?? value.name}
                        </td>
                        <td className="py-1 text-right tabular-nums">
                          {value.n.toLocaleString()}
                        </td>
                        <td className="w-16 py-1 text-right text-slate-400 tabular-nums">
                          {index === 0
                            ? ""
                            : percent(value.n, ordered[index - 1]?.[1].n ?? 0)}
                        </td>
                        <td className="w-16 py-1 text-right text-slate-500 tabular-nums">
                          {index === 0 ? "" : percent(value.n, first)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
        {pageRows.length > 0 && (
          <div className="space-y-1 text-sm">
            <p className="font-bold">ページごとの離脱</p>
            <p className="text-slate-400 text-xs">
              出口 = そのページを最後に離れたセッション、直帰 = 1
              ページだけで離れたセッション
            </p>
            <table className="w-full">
              <thead>
                <tr className="text-slate-400 text-xs">
                  <th className="py-1 text-left font-normal">ページ</th>
                  <th className="py-1 text-right font-normal">表示</th>
                  <th className="py-1 text-right font-normal">入口</th>
                  <th className="py-1 text-right font-normal">出口</th>
                  <th className="py-1 text-right font-normal">離脱率</th>
                  <th className="py-1 text-right font-normal">直帰率</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(([page, value]) => (
                  <tr key={page} className="border-white/5 border-t">
                    <td className="py-1 text-slate-300">
                      {PAGE_LABELS[page] ?? page}
                    </td>
                    <td className="py-1 text-right tabular-nums">
                      {value.views.toLocaleString()}
                    </td>
                    <td className="py-1 text-right tabular-nums">
                      {value.entries.toLocaleString()}
                    </td>
                    <td className="py-1 text-right tabular-nums">
                      {value.exits.toLocaleString()}
                    </td>
                    <td className="py-1 text-right text-slate-400 tabular-nums">
                      {percent(value.exits, value.views)}
                    </td>
                    <td className="py-1 text-right text-slate-400 tabular-nums">
                      {percent(value.bounces, value.entries)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
