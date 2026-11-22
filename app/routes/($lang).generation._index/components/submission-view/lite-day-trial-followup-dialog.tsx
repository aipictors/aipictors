import { Check, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { TrialTerms } from "~/components/trial-terms"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { TRIAL_DAYS, useLiteOffer } from "~/hooks/use-lite-offer"
import { usePassCheckout } from "~/hooks/use-pass-checkout"
import { useTranslation } from "~/hooks/use-translation"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import {
  daysSinceLiteDayTrial,
  shouldShowLiteDayFollowup,
} from "~/routes/($lang).generation._index/utils/lite-day-trial"
import { trackGrowthEvent } from "~/utils/track-growth-event"

const STORAGE_KEY_PREFIX = "lite-day-followup:"

/**
 * ライト1日体験の翌日以降（7 日間）に、生成画面を開いたら 1 回だけ「昨日の続きを」とライトを案内する。
 * 「1回4枚でたくさん作れる」を体験した人に出すので、上限に達したときの案内より押されやすいはず
 */
export function LiteDayTrialFollowupDialog() {
  const context = useGenerationContext()

  const [open, setOpen] = useState(false)

  const trial = context.liteDayTrial
  const hasPass = context.currentPass !== null
  const isTarget = shouldShowLiteDayFollowup(trial, hasPass)
  const days = daysSinceLiteDayTrial(trial)

  useEffect(() => {
    if (!isTarget || trial?.trialDate === null || trial === null) return
    const key = `${STORAGE_KEY_PREFIX}${trial.trialDate}`
    try {
      if (window.localStorage.getItem(key) !== null) return
    } catch (_error) {
      // 覚えられない端末では出さない（毎回出てしまうため）
      return
    }
    // 開いた直後のほかの案内（お知らせ・規約）と重ならないよう少し待つ
    const timeout = setTimeout(() => {
      try {
        window.localStorage.setItem(key, String(Date.now()))
      } catch (_error) {
        return
      }
      setOpen(true)
      trackGrowthEvent("lite_day_followup_view", `d${days}`)
    }, 2000)
    return () => clearTimeout(timeout)
  }, [isTarget, trial?.trialDate])

  if (!isTarget) return null

  return (
    <LiteDayTrialFollowupDialogView
      open={open}
      onOpenChange={setOpen}
      days={days ?? 1}
    />
  )
}

/**
 * 「昨日の続きを」の案内の中身（表示の確認用に、状態の判定と分けている）
 */
export function LiteDayTrialFollowupDialogView(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 体験した日から何日たったか */
  days: number
}) {
  const t = useTranslation()

  const checkout = usePassCheckout()

  const liteOffer = useLiteOffer().offer
  const isTrial = liteOffer === "trial"
  const isHalf = liteOffer === "half"

  const days = props.days

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        className="max-h-[92dvh] max-w-md overflow-y-auto outline-none focus:outline-none focus-visible:outline-none"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          if (event.currentTarget instanceof HTMLElement) {
            event.currentTarget.focus()
          }
        }}
      >
        <DialogHeader className="pr-6">
          <DialogTitle className="text-balance leading-snug">
            {days === 1
              ? t(
                  "昨日のライト体験、いかがでしたか？",
                  "How was yesterday's Lite day pass?",
                )
              : t(
                  "ライト体験の続きを、毎日",
                  "Keep the Lite experience every day",
                )}
          </DialogTitle>
          <DialogDescription>
            {t(
              "ライトプランなら、毎日1回4枚・1日50枚まで作れます。",
              "With Lite you get 4 images per click and up to 50 a day, every day.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border-2 border-violet-500 bg-gradient-to-br from-violet-500/10 to-sky-500/10 p-4 dark:border-violet-400">
          <p className="font-extrabold text-3xl text-fuchsia-600 leading-tight tracking-tight dark:text-fuchsia-300">
            {isTrial
              ? t(`${TRIAL_DAYS}日間無料`, `${TRIAL_DAYS} days free`)
              : isHalf
                ? t("初月 ¥240", "¥240 first month")
                : t("¥480/月", "¥480/mo")}
          </p>
          <p className="mt-1 text-foreground/80 text-xs">
            {isTrial
              ? t("その後 ¥480/月（税込）", "then ¥480/mo")
              : isHalf
                ? t("2か月目から¥480/月（税込）", "then ¥480/mo")
                : t("税込・いつでも解約できます", "Cancel anytime")}
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            {[
              t("1回で4枚まとめて", "4 images per click"),
              t("1日50枚まで", "50 images a day"),
              t("無料より先に生成", "Ahead of free users"),
              t("広告なし", "No ads"),
            ].map((text) => (
              <li key={text} className="flex items-start gap-1.5">
                <Check className="mt-0.5 size-3.5 shrink-0 text-violet-500" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <Button
            disabled={checkout.isLoading}
            onClick={() => {
              if (isTrial) {
                trackGrowthEvent("trial_checkout", "lite_day_followup")
                void checkout.startTrialCheckout()
                return
              }
              trackGrowthEvent("lite_day_followup_checkout", liteOffer)
              void checkout.startCheckout("LITE")
            }}
            className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 font-bold text-white shadow-lg shadow-violet-500/25 hover:opacity-95 active:scale-[0.98] dark:text-white"
          >
            {checkout.isLoadingFor("LITE") ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("決済画面へ移動中…", "Opening checkout…")}
              </>
            ) : isTrial ? (
              t(
                `${TRIAL_DAYS}日間無料で続ける`,
                `Continue — ${TRIAL_DAYS} days free`,
              )
            ) : isHalf ? (
              t("初月¥240で続ける", "Continue for ¥240")
            ) : (
              t("ライトで続ける", "Continue with Lite")
            )}
          </Button>
          {isTrial && <TrialTerms className="mt-2" />}
        </div>

        <button
          type="button"
          onClick={() => {
            trackGrowthEvent("lite_day_followup_close", liteOffer)
            props.onOpenChange(false)
          }}
          className="mx-auto min-h-9 text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("今日は無料で作る", "Stay on free today")}
        </button>
      </DialogContent>
    </Dialog>
  )
}
