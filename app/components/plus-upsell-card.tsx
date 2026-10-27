import { Link } from "@remix-run/react"
import { SparklesIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  getPlanSpec,
  type PlanKey,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toMoneyNumberText } from "~/utils/to-money-number-text"

type Props = {
  className?: string
}

const plans: PlanKey[] = ["LITE", "STANDARD", "PREMIUM"]

/**
 * ダイアログなどに置く Aipictors+ の小さな案内
 */
export function PlusUpsellCard(props: Props) {
  const t = useTranslation()
  const lite = getPlanSpec("LITE")
  const premium = getPlanSpec("PREMIUM")

  return (
    <div
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
        <Link to="/plus">{t("プランを見る", "See plans")}</Link>
      </Button>
    </div>
  )
}
