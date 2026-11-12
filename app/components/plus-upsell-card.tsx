import { Link } from "~/lib/app/locale-router"
import { CheckIcon, SparklesIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import { TrialTerms } from "~/components/trial-terms"
import { toFirstMonthPrice, useFirstMonthOffer } from "~/hooks/use-first-month-offer"
import { TRIAL_DAYS, useLiteOffer } from "~/hooks/use-lite-offer"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { getPlanSpec } from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toApproxUsdText } from "~/utils/to-approx-usd-text"
import { toMoneyNumberText } from "~/utils/to-money-number-text"
import {
  trackGrowthEvent,
  trackGrowthEventOnce,
} from "~/utils/track-growth-event"

type Props = {
  className?: string
  /**
   * 置き場所（指定すると表示と押した回数を /api/growth-event で数える）
   */
  source?: string
}

/**
 * ダイアログなどに置く Aipictors+ の小さな案内
 */
export function PlusUpsellCard(props: Props) {
  const t = useTranslation()
  const lite = getPlanSpec("LITE")
  const premium = getPlanSpec("PREMIUM")
  const liteOffer = useLiteOffer()
  const isTrial = liteOffer.offer === "trial"
  // 確認中は、お試しとも初月半額とも書かない
  const isFirstMonthOffer =
    useFirstMonthOffer() && liteOffer.offer === "half"

  const ref = useRef<HTMLDivElement>(null)

  // 画面に入ったら数える。作品ページを開くたびに数えると 1 日 1 万回を超えるので、置き場所ごとにブラウザを開いている間 1 回だけ
  useEffect(() => {
    const element = ref.current
    if (!props.source || element === null || !("IntersectionObserver" in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        trackGrowthEventOnce("upsell_view", props.source ?? "")
        observer.disconnect()
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [props.source])

  return (
    <div
      ref={ref}
      className={cn(
        "space-y-3 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-sky-500/10 p-4 text-left text-foreground",
        props.className,
      )}
    >
      <p className="flex items-center gap-1 font-bold text-sm">
        <SparklesIcon className="size-4 text-violet-500" />
        {"Aipictors+"}
        {(isTrial || isFirstMonthOffer) && (
          <span className="ml-1 rounded-full bg-fuchsia-600 px-2 py-0.5 font-bold text-[10px] text-white">
            {isTrial
              ? liteOffer.isGuest
                ? t(`はじめての方は${TRIAL_DAYS}日間無料`, `New here? ${TRIAL_DAYS} days free`)
                : t(`${TRIAL_DAYS}日間無料`, `${TRIAL_DAYS} days free`)
              : t("初月半額", "50% off first month")}
          </span>
        )}
      </p>
      {/* 作品を見ている人にも関係のある特典（広告なし）を先に書く */}
      <ul className="space-y-1.5 text-sm">
        {[
          t("広告なしで作品を楽しめる", "Browse with no ads"),
          t(
            `画像生成が1回で${lite.imagesPerRequest}枚（無料は1枚）`,
            `Generate ${lite.imagesPerRequest} images per click instead of 1`,
          ),
          t(
            `1日${lite.dailyImages}〜${premium.dailyImages}枚まで生成`,
            `Create ${lite.dailyImages} to ${premium.dailyImages} images a day`,
          ),
        ].map((text) => (
          <li key={text} className="flex items-start gap-1.5">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-violet-500" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      {isTrial && <TrialTerms isGuest={liteOffer.isGuest} />}
      <p className={cn("text-muted-foreground text-xs", isTrial && "hidden")}>
        {isFirstMonthOffer
          ? t(
              `ライトは初月¥${toMoneyNumberText(toFirstMonthPrice(lite.price))}、2か月目から¥${toMoneyNumberText(lite.price)}/月。いつでも解約できます`,
              `Lite is ¥${toMoneyNumberText(toFirstMonthPrice(lite.price))} for the first month, then ¥${toMoneyNumberText(lite.price)}/mo (${toApproxUsdText(lite.price)}, charged in JPY). Cancel anytime.`,
            )
          : t(
              `ライトは¥${toMoneyNumberText(lite.price)}/月。いつでも解約できます`,
              `Lite is ¥${toMoneyNumberText(lite.price)}/mo (${toApproxUsdText(lite.price)}, charged in JPY). Cancel anytime.`,
            )}
      </p>
      <Button
        asChild
        className="h-10 w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 font-bold text-white hover:opacity-95 dark:text-white"
      >
        <Link
          to="/plus#plans"
          onClick={() => {
            if (props.source) trackGrowthEvent("upsell_click", props.source)
            if (props.source && isTrial) {
              trackGrowthEvent("trial_click", props.source)
            }
          }}
        >
          {isTrial
            ? t(
                `ライトを${TRIAL_DAYS}日間無料で試す`,
                `Try Lite free for ${TRIAL_DAYS} days`,
              )
            : t("プランを見る", "See plans")}
        </Link>
      </Button>
    </div>
  )
}
