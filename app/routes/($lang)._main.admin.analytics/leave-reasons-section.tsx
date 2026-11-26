import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  type LeaveSurveyKind,
  leaveSurveyLabel,
  leaveSurveyReasons,
} from "~/utils/leave-survey"

const CARD =
  "rounded-2xl border-white/10 bg-white/5 text-slate-100 shadow-none sm:rounded-[28px]"

type LeaveStats = {
  total: number
  withDetails: number
  summary: {
    reason: string
    count: number
    avgMonths: number | null
    outcomes?: Record<string, number>
  }[]
  choices: { reason: string; group: string; key: string; count: number }[]
  texts: {
    reason: string
    note: string | null
    text: string | null
    improvement: string | null
    source: string | null
    created_at: number
    pass_type?: string | null
    months?: number | null
    outcome?: string | null
  }[]
}

export type LeaveReasonsResponse = {
  days: number
  subscription: LeaveStats
  account: LeaveStats
}

const OUTCOME_LABELS: Record<string, string> = {
  withdraw: "退会",
  pause: "一時停止",
}

const PLAN_LABELS: Record<string, string> = {
  LITE: "ライト",
  STANDARD: "スタンダード",
  PREMIUM: "プレミアム",
}

const dateText = (seconds: number) =>
  new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
  }).format(new Date(seconds * 1000))

/**
 * 解約・退会の理由（/internal/analytics/leave-reasons）。
 * 理由ごとの人数、理由を開くと追加質問の答えの人数、自由記述の新しいもの
 */
export function LeaveReasonsSection(props: {
  data: LeaveReasonsResponse | null | undefined
}) {
  if (!props.data) {
    return (
      <Card className={CARD}>
        <CardContent className="py-6 text-slate-400 text-sm">
          解約・退会の理由を読み込めませんでした。
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="grid gap-3 sm:gap-6 xl:grid-cols-2">
      <LeaveStatsCard
        kind="subscription"
        title="サブスクの解約理由"
        description={`直近 ${props.data.days} 日。追加質問は 11/27 から（それまでの回答は理由だけ）`}
        stats={props.data.subscription}
      />
      <LeaveStatsCard
        kind="account"
        title="退会・一時停止の理由"
        description={`直近 ${props.data.days} 日。退会か一時停止かは人数の右に出します`}
        stats={props.data.account}
      />
    </div>
  )
}

function LeaveStatsCard(props: {
  kind: LeaveSurveyKind
  title: string
  description: string
  stats: LeaveStats
}) {
  const [openReason, setOpenReason] = useState<string | null>(null)
  const [showAllTexts, setShowAllTexts] = useState(false)
  const { stats } = props
  const max = stats.summary[0]?.count ?? 0
  const texts = showAllTexts ? stats.texts : stats.texts.slice(0, 8)

  return (
    <Card className={`${CARD} min-w-0`}>
      <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
        <CardTitle className="text-sm sm:text-base">
          {props.title}
          <span className="ml-2 font-normal text-slate-400 text-xs">
            {stats.total} 人（追加質問の回答 {stats.withDetails} 人）
          </span>
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs sm:text-sm">
          {props.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-3 pb-4 sm:px-6 sm:pb-6">
        {stats.summary.length === 0 ? (
          <p className="text-slate-400 text-sm">まだ回答がありません。</p>
        ) : (
          <div className="space-y-2">
            {stats.summary.map((item) => {
              const isOpen = openReason === item.reason
              const choices = stats.choices.filter(
                (choice) => choice.reason === item.reason,
              )
              const groups = leaveSurveyReasons(props.kind).find(
                (reason) => reason.value === item.reason,
              )?.groups
              return (
                <div key={item.reason} className="space-y-1">
                  <button
                    type="button"
                    className="flex w-full justify-between gap-2 text-left text-sm"
                    onClick={() => setOpenReason(isOpen ? null : item.reason)}
                  >
                    <span className="truncate">
                      {isOpen ? "▾ " : "▸ "}
                      {leaveSurveyLabel(props.kind, item.reason)}
                    </span>
                    <span className="shrink-0 text-slate-300 tabular-nums">
                      {item.count} 人
                      {item.outcomes && (
                        <span className="ml-1 text-slate-400 text-xs">
                          {Object.entries(item.outcomes)
                            .map(
                              ([key, count]) =>
                                `${OUTCOME_LABELS[key] ?? key} ${count}`,
                            )
                            .join("・")}
                        </span>
                      )}
                      {item.avgMonths !== null && (
                        <span className="ml-1 text-slate-400 text-xs">
                          平均 {item.avgMonths} か月
                        </span>
                      )}
                    </span>
                  </button>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-1.5 rounded-full bg-rose-400"
                      style={{
                        width: `${max > 0 ? (item.count / max) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  {isOpen && (
                    <div className="space-y-2 rounded-xl bg-white/5 p-3">
                      {choices.length === 0 && (
                        <p className="text-slate-400 text-xs">
                          追加質問の回答はまだありません。
                        </p>
                      )}
                      {(groups ?? []).map((group) => {
                        const rows = choices.filter(
                          (choice) => choice.group === group.id,
                        )
                        if (rows.length === 0) return null
                        return (
                          <div key={group.id} className="space-y-1">
                            <p className="text-slate-400 text-xs">
                              {group.question[0]}
                            </p>
                            {rows.map((row) => (
                              <div
                                key={row.key}
                                className="flex justify-between gap-2 text-xs"
                              >
                                <span>
                                  {leaveSurveyLabel(
                                    props.kind,
                                    row.reason,
                                    row.group,
                                    row.key,
                                  )}
                                </span>
                                <span className="text-slate-300 tabular-nums">
                                  {row.count}
                                </span>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {stats.texts.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium text-slate-300 text-xs">
              自由記述（新しい順）
            </p>
            {texts.map((item, index) => (
              <div
                key={`${item.created_at}-${index}`}
                className="space-y-1 rounded-xl bg-white/5 p-3 text-xs"
              >
                <p className="text-slate-400">
                  {dateText(item.created_at)}・
                  {leaveSurveyLabel(props.kind, item.reason)}
                  {item.pass_type
                    ? `・${PLAN_LABELS[item.pass_type] ?? item.pass_type}`
                    : ""}
                  {item.outcome
                    ? `・${OUTCOME_LABELS[item.outcome] ?? item.outcome}`
                    : ""}
                  {item.source ? `・${item.source}` : ""}
                </p>
                {(item.text || item.note) && (
                  <p className="whitespace-pre-wrap">
                    {item.text ?? item.note}
                  </p>
                )}
                {item.improvement && (
                  <p className="whitespace-pre-wrap text-emerald-200">
                    改善: {item.improvement}
                  </p>
                )}
              </div>
            ))}
            {stats.texts.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllTexts(!showAllTexts)}
                className="w-full rounded-full border border-white/10 py-2 text-slate-300 text-xs active:bg-white/10"
              >
                {showAllTexts
                  ? "閉じる"
                  : `残り ${stats.texts.length - 8} 件を見る`}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
