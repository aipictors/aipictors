import { Link } from "@remix-run/react"
import { SparklesIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { planCtaClassName } from "~/routes/($lang)._main.plus._index/components/pass-plan-description"
import {
  getPlanSpec,
  type PlanKey,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"
import { toMoneyNumberText } from "~/utils/to-money-number-text"

const plans: PlanKey[] = ["LITE", "STANDARD", "PREMIUM"]

/**
 * プランの案内
 */
export function GenerationAboutPlanSection() {
  const t = useTranslation()

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-violet-500/15 via-fuchsia-500/5 to-sky-500/15 px-5 py-8 md:px-10 md:py-10">
      <div className="-top-24 -right-20 pointer-events-none absolute size-72 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="relative space-y-6">
        <div className="space-y-2 text-center">
          <p className="mx-auto inline-flex items-center gap-1 rounded-full border bg-background/70 px-3 py-1 font-bold text-xs">
            <SparklesIcon className="size-3.5 text-violet-500" />
            {"Aipictors+"}
          </p>
          <p className="font-extrabold text-2xl md:text-3xl">
            {t("もっと生成するならプランがおすすめ", "Generate more with a plan")}
          </p>
          <p className="text-muted-foreground text-sm">
            {t(
              "1回で4枚、毎日のフリーコインも増えます。広告の非表示・画像から生成・高速生成モードなども使えます。",
              "4 images per request and more daily coins, plus ad-free browsing, image to image, fast mode and more.",
            )}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {plans.map((plan) => {
            const spec = getPlanSpec(plan)
            const isPrimary = plan === "STANDARD"
            return (
              <div
                key={plan}
                className={cn(
                  "relative rounded-2xl border bg-background/80 p-4 backdrop-blur",
                  isPrimary && "border-2 border-violet-500 dark:border-violet-400",
                )}
              >
                {isPrimary && (
                  <span className="-top-3 absolute right-4 rounded-full bg-gradient-to-r from-violet-600 to-sky-500 px-2.5 py-0.5 font-bold text-[11px] text-white">
                    {t("おすすめ", "Recommended")}
                  </span>
                )}
                <p className="font-bold">{t(spec.name, spec.enName)}</p>
                <p className="mt-1">
                  <span className="font-extrabold text-2xl">
                    {`¥${toMoneyNumberText(spec.price)}`}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {t("/月", "/mo")}
                  </span>
                </p>
                <p className="mt-2 text-sm">
                  {t(
                    `1回${spec.imagesPerRequest}枚・1日${spec.dailyImages}枚まで`,
                    `${spec.imagesPerRequest} per request, ${spec.dailyImages}/day`,
                  )}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t(
                    `毎日${toMoneyNumberText(spec.dailyFreeCoins)}フリーコイン・同時${spec.concurrentTasks}件`,
                    `${spec.dailyFreeCoins} coins daily, ${spec.concurrentTasks} concurrent`,
                  )}
                </p>
              </div>
            )
          })}
        </div>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className={cn(planCtaClassName, "sm:w-64")}>
            <Link to="/plus">{t("プランを見る", "See plans")}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full rounded-xl bg-background/70 sm:w-64"
          >
            <Link to="/generation">
              {t("まずは無料で生成", "Try for free")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
