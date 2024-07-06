import { CrossPlatformTooltip } from "@/_components/cross-platform-tooltip"
import { Slider } from "@/_components/ui/slider"
import { GenerationReserveCountInput } from "@/routes/($lang).generation._index/_components/submission-view/generation-reserve-count-input"
import { GenerationQueryContext } from "@/routes/($lang).generation._index/_contexts/generation-query-context"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { useContext, useEffect } from "react"

type Props = {
  availableImageGenerationMaxTasksCount: number
  tasksCount: number
  setGenerationCount: (count: number) => void
  generationCount: number
}

/**
 * 生成回数の設定
 */
export const GenerationConfigCount = (props: Props) => {
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

  return (
    <>
      <div className="gap-x-2">
        <div className="flex items-center gap-x-2">
          <span className="text-nowrap font-bold">{"生成枚数"}</span>
          <CrossPlatformTooltip
            text={
              !isStandardOrPremium
                ? "サブスクSTANDARD以上で1度の生成枚数を増やすことができます。"
                : "同時生成枚数以上を指定した場合は、予約生成となり順次生成が行われていきます。"
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
