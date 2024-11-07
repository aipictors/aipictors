import { Input } from "~/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { HelpCircleIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { config } from "~/config"

type Props = {
  value: number
  onChange(value: number): void
}

export function GenerationConfigStep(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex gap-x-2">
        <span className="font-bold text-sm">{"Steps"}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircleIcon className="w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t(
                  "Steps値を大きくするほどイラストがより洗練されます。",
                  "The higher the Steps value, the more refined the illustration becomes.",
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        type="number"
        value={props.value}
        min={9}
        max={config.generationFeature.imageGenerationMaxSteps}
        onChange={(event) => {
          const inputValue = Number(event.target.value)
          // 最大値を超えないように制限
          if (inputValue > config.generationFeature.imageGenerationMaxSteps) {
            props.onChange(config.generationFeature.imageGenerationMaxSteps)
          } else {
            props.onChange(inputValue)
          }

          if (inputValue < config.generationFeature.imageGenerationMinSteps) {
            props.onChange(config.generationFeature.imageGenerationMinSteps)
          }
        }}
      />
    </div>
  )
}
