import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Check, Gift, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  /** 計測用（free / lapsed） */
  source: string
  /** 始められたとき（プラン・コインの表示を取り直す） */
  onStarted: () => void
}

/**
 * カード登録なしの「ライト1日体験」を始めるカード（コインが足りないときの案内の主役）
 * カードの登録を嫌がって「7日間無料」も押されなかったので、まず登録なしで「1回4枚」を体験してもらう。
 * 翌日に「昨日の続きを」とプランを案内する（lite-day-trial-followup-dialog.tsx）
 */
export function LiteDayTrialCard(props: Props) {
  const t = useTranslation()

  const [start, { loading }] = useMutation(startLiteDayTrialMutation)

  const onStart = async () => {
    trackGrowthEvent("lite_day_click", props.source)
    try {
      await start({ variables: { source: `shortage_${props.source}` } })
      trackGrowthEvent("lite_day_start", props.source)
      toast(
        t(
          "ライト1日体験を始めました！今日の24時まで、1回4枚・あと40枚作れます",
          "Lite day pass is on! Up to 4 per run and 40 more images until midnight (JST)",
        ),
      )
      props.onStarted()
    } catch (error) {
      toast(
        error instanceof Error && error.message
          ? error.message
          : t("始められませんでした", "Couldn't start the day pass"),
      )
    }
  }

  return (
    <div className="rounded-2xl border-2 border-fuchsia-500 bg-gradient-to-br from-fuchsia-500/10 to-violet-500/10 p-4 dark:border-fuchsia-400">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-bold leading-tight">
          <Gift className="size-4 text-fuchsia-600 dark:text-fuchsia-300" />
          {t("ライト1日体験", "Lite day pass")}
        </p>
        <span className="inline-block whitespace-nowrap rounded-md bg-fuchsia-600 px-1.5 py-0.5 font-bold text-white text-xs">
          {t("カード登録なし", "No card needed")}
        </span>
      </div>
      <p className="mt-2 font-extrabold text-2xl text-fuchsia-600 leading-tight tracking-tight dark:text-fuchsia-300">
        {t("今日だけ無料", "Free for today")}
      </p>
      <p className="mt-1 text-foreground/80 text-xs">
        {t(
          "今日の24時まで、ライトプランと同じ使い方で作れます（1人1回）",
          "Use it like the Lite plan until midnight JST (once per account)",
        )}
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {[
          t("1回で4枚まとめて", "4 images per click"),
          t("あと40枚作れる", "40 more images today"),
          t("無料より先に生成", "Ahead of free users"),
          t("自動課金なし", "No auto-charge"),
        ].map((text) => (
          <li key={text} className="flex items-start gap-1.5">
            <Check className="mt-0.5 size-3.5 shrink-0 text-fuchsia-500" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <Button
        disabled={loading}
        onClick={() => void onStart()}
        className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 font-bold text-white shadow-fuchsia-500/25 shadow-lg hover:opacity-95 active:scale-[0.98] dark:text-white"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t("準備しています…", "Starting…")}
          </>
        ) : (
          t("今日だけライトで続ける（無料）", "Keep creating — free today")
        )}
      </Button>
    </div>
  )
}

const startLiteDayTrialMutation = graphql(
  `mutation StartLiteDayTrial($source: String) {
    startLiteDayTrial(source: $source) {
      status
      trialDate
      endsAt
    }
  }`,
)
