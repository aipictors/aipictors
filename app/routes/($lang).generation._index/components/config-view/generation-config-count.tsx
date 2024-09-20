import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Slider } from "~/components/ui/slider"
import { GenerationReserveCountInput } from "~/routes/($lang).generation._index/components/submission-view/generation-reserve-count-input"
import { GenerationQueryContext } from "~/routes/($lang).generation._index/contexts/generation-query-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useContext, useEffect } from "react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  availableImageGenerationMaxTasksCount: number
  tasksCount: number
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
    <>
      <div className="gap-x-2">
        <div className="flex items-center gap-x-2">
          <span className="text-nowrap font-bold">
            {t("生成枚数（予約生成）", "Generation count (reserve generation)")}
          </span>
          <CrossPlatformTooltip
            text={
              !isStandardOrPremium
                ? t(
                    "サブスクSTANDARD以上で1度の生成枚数を増やすことができます。",
                    "You can increase the number of images generated at once with a subscription STANDARD or higher.",
                  )
                : t(
                    "同時生成枚数以上を指定した場合は、予約生成となり順次生成が行われていきます。",
                    "If you specify more than the number of images generated at the same time, it will be reserved generation and will be generated sequentially.",
                  )
            }
          />
        </div>
        <div className="flex items-center gap-x-2">
          <Slider
            disabled={!isStandardOrPremium}
            aria-label="slider-ex-2"
            defaultValue={[context.config.generationCount]}
            min={1}
            max={Math.min(
              props.availableImageGenerationMaxTasksCount - props.tasksCount,
              10,
            )}
            step={1}
            onValueChange={(value) => {
              context.changeGenerationCount(value[0])
            }}
          />
          <GenerationReserveCountInput
            disabled={!isStandardOrPremium}
            maxCount={
              props.availableImageGenerationMaxTasksCount - props.tasksCount
            }
            onChange={props.setGenerationCount}
            count={context.config.generationCount}
          />
        </div>
      </div>
    </>
  )
}
