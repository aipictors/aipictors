import { Link } from "~/lib/app/locale-router"
import { SparklesIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import { toFirstMonthPrice, useFirstMonthOffer } from "~/hooks/use-first-month-offer"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  getPlanSpec,
  type PlanKey,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toMoneyNumberText } from "~/utils/to-money-number-text"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  className?: string
  /**
   * 置き場所（指定すると表示と押した回数を /api/growth-event で数える）
   */
  source?: string
}

const plans: PlanKey[] = ["LITE", "STANDARD", "PREMIUM"]

/**
 * ダイアログなどに置く Aipictors+ の小さな案内
 */
export function PlusUpsellCard(props: Props) {
  const t = useTranslation()
  const lite = getPlanSpec("LITE")
  const premium = getPlanSpec("PREMIUM")
  const isFirstMonthOffer = useFirstMonthOffer()

  const ref = useRef<HTMLDivElement>(null)

  // 画面に入ったら 1 回だけ数える
  useEffect(() => {
    const element = ref.current
    if (!props.source || element === null || !("IntersectionObserver" in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        trackGrowthEvent("upsell_view", props.source ?? "")
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
        "space-y-3 rounded-2xl border bg-gradient-to-br from-violet-500/10 to-sky-500/10 p-4 text-left text-foreground",
        props.className,
      )}
    >
      <p className="flex items-center gap-1 font-bold text-sm">
        <SparklesIcon className="size-4 text-violet-500" />
        {t(
          `Aipictors+なら1回で${lite.imagesPerRequest}枚・1日最大${premium.dailyImages}枚`,
          `Aipictors+: ${lite.imagesPerRequest} per request, up to ${premium.dailyImages}/day`,
        )}
      </p>
      <ul className="space-y-1 text-sm">
        {plans.map((plan) => {
          const spec = getPlanSpec(plan)
          return (
            <li key={plan} className="flex items-baseline justify-between gap-2">
              <span className="font-medium">
                {t(spec.name, spec.enName)}
                <span className="ml-1 text-muted-foreground text-xs">
                  {`¥${toMoneyNumberText(spec.price)}${t("/月", "/mo")}`}
                </span>
              </span>
              <span className="text-muted-foreground text-xs">
                {t(`1日${spec.dailyImages}枚まで`, `${spec.dailyImages}/day`)}
              </span>
            </li>
          )
        })}
      </ul>
      <Button
        asChild
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 font-bold text-white hover:opacity-95"
      >
        <Link
          to="/plus#plans"
          onClick={() => {
            if (props.source) trackGrowthEvent("upsell_click", props.source)
          }}
        >
          {isFirstMonthOffer
            ? t(
                `初月¥${toMoneyNumberText(toFirstMonthPrice(lite.price))}から・プランを見る`,
                `From ¥${toMoneyNumberText(toFirstMonthPrice(lite.price))} first month`,
              )
            : t("プランを見る", "See plans")}
        </Link>
      </Button>
    </div>
  )
}
