import { LockIcon } from "lucide-react"
import { useContext, useEffect } from "react"
import { Slider } from "~/components/ui/slider"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { ConfigSectionHeader } from "~/routes/($lang).generation._index/components/config-view/generation-config-parts"
import { GenerationReserveCountInput } from "~/routes/($lang).generation._index/components/submission-view/generation-reserve-count-input"
import { GenerationQueryContext } from "~/routes/($lang).generation._index/contexts/generation-query-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { openGenerationPlanUpgrade } from "~/routes/($lang).generation._index/utils/generation-plan-upgrade-store"

type Props = {
  remainingImageGenerationTasksCount: number
  setGenerationCount: (count: number) => void
  generationCount: number
}

/**
 * 生成回数の設定
 */
export function GenerationConfigCount(props: Props) {
  const context = useGenerationContext()

  const dataContext = useContext(GenerationQueryContext)

  const isStandardOrPremium =
    dataContext.currentPass?.type === "STANDARD" ||
    dataContext.currentPass?.type === "PREMIUM"

  useEffect(() => {
    if (!isStandardOrPremium) {
      context.changeGenerationCount(1)
    }
  }, [])

  const t = useTranslation()

  return (
    <section className="space-y-2">
      <ConfigSectionHeader
        title={t(
          "続けて生成する回数（予約生成）",
          "Repeat count (reserved generation)",
        )}
        tooltip={
          !isStandardOrPremium
            ? t(
                "サブスクSTANDARD以上で1度の生成枚数を増やすことができます。",
                "You can increase the number of images generated at once with a subscription STANDARD or higher.",
              )
            : t(
                "同じ設定で何回続けて生成するかです。同時に進められる数を超えた分は予約生成となり、順番に生成されます。",
                "If you specify more than the number of images generated at the same time, it will be reserved generation and will be generated sequentially.",
              )
        }
        aside={
          !isStandardOrPremium && (
            <LockIcon
              className="size-3.5"
              aria-label={t("STANDARD以上", "STANDARD+")}
            />
          )
        }
      />
      <div
        className={cn(
          "relative flex items-center gap-x-3",
          !isStandardOrPremium && "opacity-45",
        )}
      >
        {/* 使えないときは押せない見た目のままにして、押したらプランの案内を出す（以前は何も起きなかった） */}
        {!isStandardOrPremium && (
          <button
            type="button"
            className="absolute inset-0 z-10 cursor-pointer"
            aria-label={t(
              "続けて生成はスタンダード以上で使えます",
              "Repeat generation needs Standard or above",
            )}
            onClick={() =>
              openGenerationPlanUpgrade({
                requiredPlan: "STANDARD",
                title: t(
                  "続けて生成（予約生成）はスタンダード以上で使えます",
                  "Repeat generation needs Standard or above",
                ),
                description: t(
                  "同じ設定で何回も続けて生成できます。生成している間に次の生成も始められます。",
                  "Run the same settings many times in a row, and start the next one while generating.",
                ),
                source: "repeat_setting",
              })
            }
          />
        )}
        <Slider
          aria-label="生成枚数"
          disabled={!isStandardOrPremium}
          defaultValue={[context.config.generationCount]}
          min={1}
          max={Math.min(props.remainingImageGenerationTasksCount, 10)}
          step={1}
          onValueChange={(value) => {
            context.changeGenerationCount(value[0])
          }}
        />
        <GenerationReserveCountInput
          disabled={!isStandardOrPremium}
          maxCount={props.remainingImageGenerationTasksCount}
          onChange={props.setGenerationCount}
          count={context.config.generationCount}
        />
      </div>
    </section>
  )
}
