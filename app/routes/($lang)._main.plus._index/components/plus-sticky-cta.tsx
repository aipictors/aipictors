import { Loader2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Button } from "~/components/ui/button"
import { TrialTerms } from "~/components/trial-terms"
import { toFirstMonthPrice, useFirstMonthOffer } from "~/hooks/use-first-month-offer"
import { useLiteOffer } from "~/hooks/use-lite-offer"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  type BillingInterval,
  getPlanSpec,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toApproxUsdText } from "~/utils/to-approx-usd-text"
import { toMoneyNumberText } from "~/utils/to-money-number-text"
import { trackGrowthEventOnce } from "~/utils/track-growth-event"

type PaidPlan = "LITE" | "STANDARD" | "PREMIUM"

type Props = {
  interval: BillingInterval
  isLoggedOut: boolean
  isLoading: boolean
  onSelect(passType: PaidPlan): Promise<void>
  onLoginClick(passType: PaidPlan): void
}

const PLANS: PaidPlan[] = ["LITE", "STANDARD", "PREMIUM"]

/**
 * スマホの画面下に固定で出す申込みボタン
 * プランの一覧まで戻らなくても、どこを読んでいても申し込めるようにする。
 * 初月の金額・2 か月目からの金額・解約できることをボタンの横に書く
 */
export function PlusStickyCta(props: Props) {
  const t = useTranslation()
  const liteOffer = useLiteOffer()
  // お試しの対象の人には、最初からライト（7 日間無料）を選んでおく。それ以外はおすすめのスタンダード
  const [selectedPlan, setPlan] = useState<PaidPlan | null>(null)
  const plan =
    selectedPlan ?? (liteOffer.offer === "trial" ? "LITE" : "STANDARD")
  const [isScrolled, setIsScrolled] = useState(false)
  const isYearly = props.interval === "year"
  // 初月半額は月払いだけ
  const isTrialOffer =
    plan === "LITE" && !isYearly && liteOffer.offer === "trial"
  const isOfferUnknown =
    plan === "LITE" && !isYearly && liteOffer.offer === "unknown"
  const isFirstMonthOffer =
    useFirstMonthOffer() && !isYearly && !isTrialOffer && !isOfferUnknown
  const spec = getPlanSpec(plan)

  // 最初の案内（ヒーロー）を読んでいる間は出さない
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 240)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!isScrolled) return
    if (!window.matchMedia("(max-width: 767px)").matches) return
    trackGrowthEventOnce("plus_sticky_view", props.isLoggedOut ? "guest" : "free")
  }, [isScrolled, props.isLoggedOut])

  const priceText = isYearly
    ? t(
        `¥${toMoneyNumberText(spec.yearlyPrice)}/年（税込）・解約すると更新日まで使えます`,
        `¥${toMoneyNumberText(spec.yearlyPrice)}/year (${toApproxUsdText(spec.yearlyPrice)}) · cancel anytime`,
      )
    : isFirstMonthOffer
      ? t(
          `初月¥${toMoneyNumberText(toFirstMonthPrice(spec.price))}・2か月目から¥${toMoneyNumberText(spec.price)}/月・いつでも解約OK`,
          `¥${toMoneyNumberText(toFirstMonthPrice(spec.price))} first month, then ¥${toMoneyNumberText(spec.price)}/mo (${toApproxUsdText(spec.price)})`,
        )
      : t(
          `¥${toMoneyNumberText(spec.price)}/月（税込）・いつでも解約OK`,
          `¥${toMoneyNumberText(spec.price)}/mo (${toApproxUsdText(spec.price)}) · cancel anytime`,
        )

  const buttonClassName =
    "h-11 min-w-[6.5rem] shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-4 font-bold text-white shadow-lg shadow-violet-500/25 active:scale-[0.98] dark:text-white"

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur transition-[transform,visibility] duration-200 motion-reduce:transition-none md:hidden",
        isScrolled
          ? "translate-y-0"
          : "pointer-events-none invisible translate-y-full",
      )}
      aria-hidden={!isScrolled}
    >
      <div className="flex items-center gap-2">
        <div
          role="radiogroup"
          aria-label={t("プラン", "Plan")}
          className="flex min-w-0 flex-1 rounded-xl border bg-muted/60 p-0.5"
        >
          {PLANS.map((key) => {
            const item = getPlanSpec(key)
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={plan === key}
                tabIndex={isScrolled ? 0 : -1}
                onClick={() => setPlan(key)}
                className={cn(
                  "h-10 min-w-0 flex-1 truncate rounded-[10px] px-1 font-bold text-xs transition-colors motion-reduce:transition-none",
                  plan === key
                    ? "bg-background text-violet-700 shadow dark:text-violet-300"
                    : "text-muted-foreground",
                )}
              >
                {t(item.name, item.enName)}
              </button>
            )
          })}
        </div>
        {props.isLoggedOut ? (
          <LoginDialogButton
            description={t(
              isTrialOffer
                ? `ログインすると、そのまま${spec.name}の無料お試しの手続きへ進みます（以前プランに入っていた方は初月半額になります）。`
                : `ログインすると、そのまま${spec.name}の決済画面へ進みます。`,
              isTrialOffer
                ? `Log in or create a free account, and we'll take you straight to your ${spec.enName} free trial. (If you've had a plan before, you'll get 50% off the first month instead.)`
                : `Log in or create a free account, and we'll take you straight to checkout for ${spec.enName}.`,
            )}
            triggerChildren={
              <Button
                className={buttonClassName}
                tabIndex={isScrolled ? 0 : -1}
                onClick={() => props.onLoginClick(plan)}
              >
                {isTrialOffer
                  ? t("無料で試す", "Try free")
                  : t("登録する", "Subscribe")}
              </Button>
            }
          />
        ) : (
          <Button
            className={buttonClassName}
            disabled={props.isLoading}
            tabIndex={isScrolled ? 0 : -1}
            onClick={() => void props.onSelect(plan)}
          >
            {props.isLoading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : isTrialOffer ? (
              t("無料で試す", "Try free")
            ) : (
              t("登録する", "Subscribe")
            )}
          </Button>
        )}
      </div>
      {isTrialOffer ? (
        // お試しの条件は省略せずに書く（折り返してよい）
        <TrialTerms isGuest={liteOffer.isGuest} className="mt-1.5" />
      ) : (
        <p className="mt-1.5 truncate text-center text-[11px] text-muted-foreground tabular-nums">
          {priceText}
        </p>
      )}
    </div>
  )
}
