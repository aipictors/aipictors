import { Link } from "~/lib/app/locale-router"
import { CheckIcon, SparklesIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import { toFirstMonthPrice, useFirstMonthOffer } from "~/hooks/use-first-month-offer"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { getPlanSpec } from "~/routes/($lang)._main.plus._index/utils/plan-specs"
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
  const isFirstMonthOffer = useFirstMonthOffer()

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
        "space-y-3 rounded-2xl border bg-gradient-to-br from-violet-500/10 to-sky-500/10 p-4 text-left text-foreground",
        props.className,
      )}
    >
      <p className="flex items-center gap-1 font-bold text-sm">
        <SparklesIcon className="size-4 text-violet-500" />
        {"Aipictors+"}
        {isFirstMonthOffer && (
          <span className="ml-1 rounded-full bg-fuchsia-600 px-2 py-0.5 font-bold text-[10px] text-white">
            {t("初月半額", "50% off first month")}
          </span>
        )}
      </p>
      {/* 作品を見ている人にも関係のある特典（広告なし）を先に書く */}
      <ul className="space-y-1.5 text-sm">
        {[
          t("広告なしで作品を楽しめる", "Browse without ads"),
          t(
            `画像生成が1回で${lite.imagesPerRequest}枚（無料は1枚）`,
            `${lite.imagesPerRequest} images per generation (1 on Free)`,
          ),
          t(
            `1日${lite.dailyImages}〜${premium.dailyImages}枚まで生成`,
            `${lite.dailyImages}–${premium.dailyImages} images a day`,
          ),
        ].map((text) => (
          <li key={text} className="flex items-start gap-1.5">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-violet-500" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground text-xs">
        {isFirstMonthOffer
          ? t(
              `ライトは初月¥${toMoneyNumberText(toFirstMonthPrice(lite.price))}、2か月目から¥${toMoneyNumberText(lite.price)}/月。いつでも解約できます`,
              `Lite: ¥${toMoneyNumberText(toFirstMonthPrice(lite.price))} first month, then ¥${toMoneyNumberText(lite.price)}/mo. Cancel anytime`,
            )
          : t(
              `ライトは¥${toMoneyNumberText(lite.price)}/月。いつでも解約できます`,
              `Lite is ¥${toMoneyNumberText(lite.price)}/mo. Cancel anytime`,
            )}
      </p>
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
          {t("プランを見る", "See plans")}
        </Link>
      </Button>
    </div>
  )
}
