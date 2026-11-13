import { useEffect, useState } from "react"
import {
  fetchPictorRunRanking,
  type PictorRunRanking,
  type PictorRunRankingPeriod,
} from "~/components/pictor-run/pictor-run-api"
import {
  PictorRunAvatar,
  PictorRunUserName,
} from "~/components/pictor-run/pictor-run-user"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = Readonly<{
  viewerId: string | null
  /** スコアを送るたびに変わる値（変わったら読み直す） */
  refreshKey: number
}>

const MEDALS = ["🥇", "🥈", "🥉"]

/**
 * スコアランキング（今週 / これまで）
 */
export function PictorRunRankingPanel(props: Props): React.ReactNode {
  const t = useTranslation()
  const [period, setPeriod] = useState<PictorRunRankingPeriod>("week")
  const [ranking, setRanking] = useState<PictorRunRanking | null>(null)
  const [isFailed, setIsFailed] = useState(false)

  // スコアを送ったとき・ログインが変わったときにも読み直す
  useEffect(() => {
    let cancelled = false
    setIsFailed(false)
    fetchPictorRunRanking(period)
      .then((data) => {
        if (!cancelled) setRanking(data)
      })
      .catch(() => {
        if (!cancelled) setIsFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [period, props.refreshKey, props.viewerId])

  const periods: { value: PictorRunRankingPeriod; label: string }[] = [
    { value: "week", label: t("今週", "This week") },
    { value: "all", label: t("これまで", "All time") },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex gap-1 px-3 pt-2 pb-2">
        {periods.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={period === item.value}
            onClick={() => {
              setRanking(null)
              setPeriod(item.value)
            }}
            className={cn(
              "h-9 flex-1 cursor-pointer rounded-full font-bold text-sm transition-colors",
              period === item.value
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {isFailed && (
          <p className="px-2 py-6 text-center text-slate-500 text-sm">
            {t(
              "ランキングを読み込めませんでした。",
              "Could not load the ranking.",
            )}
          </p>
        )}
        {!isFailed && ranking === null && (
          <p className="px-2 py-6 text-center text-slate-400 text-sm">
            {t("よみこみ中…", "Loading…")}
          </p>
        )}
        {ranking !== null && ranking.items.length === 0 && (
          <p className="px-2 py-6 text-center text-slate-500 text-sm">
            {t(
              "まだ記録がありません。最初の 1 位になりましょう！",
              "No records yet. Be the first!",
            )}
          </p>
        )}
        <ol className="space-y-1">
          {ranking?.items.map((item) => (
            <li
              key={item.user.id}
              className={cn(
                "flex items-center gap-2 rounded-xl px-2 py-1.5",
                item.user.id === props.viewerId
                  ? "bg-amber-100"
                  : item.rank <= 3
                    ? "bg-slate-50"
                    : "",
              )}
            >
              <span className="w-7 shrink-0 text-center font-black text-slate-500 text-sm tabular-nums">
                {MEDALS[item.rank - 1] ?? item.rank}
              </span>
              <PictorRunAvatar user={item.user} size={32} />
              <PictorRunUserName user={item.user} />
              <span className="ml-auto shrink-0 font-black tabular-nums">
                {item.score.toLocaleString()}
                <span className="ml-0.5 font-bold text-slate-500 text-xs">
                  m
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {ranking?.me && (
        <p className="border-t bg-amber-50 px-4 py-2 text-center font-bold text-sm">
          {t(
            `あなたは ${ranking.me.rank} 位（${ranking.me.score.toLocaleString()} m）`,
            `You are #${ranking.me.rank} (${ranking.me.score.toLocaleString()} m)`,
          )}
        </p>
      )}
      {ranking !== null && !ranking.me && props.viewerId === null && (
        <p className="border-t bg-slate-50 px-4 py-2 text-center text-slate-600 text-sm">
          <a
            href="/login"
            className="font-bold text-clear-bright-blue underline"
          >
            {t("ログイン", "Log in")}
          </a>
          {t("するとランキングに参加できます", " to join the ranking")}
        </p>
      )}
    </div>
  )
}
