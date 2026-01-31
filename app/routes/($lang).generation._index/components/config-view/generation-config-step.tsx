import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { HelpCircleIcon, MinusIcon, PlusIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { config } from "~/config"

type Props = {
  value: number
  onChange(value: number): void
}

export function GenerationConfigStep (props: Props) {
  const t = useTranslation()

  const minSteps = config.generationFeature.imageGenerationMinSteps
  const maxSteps = config.generationFeature.imageGenerationMaxSteps

  const handleIncrement = () => {
    const newValue = Math.min(props.value + 1, maxSteps)
    props.onChange(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max(props.value - 1, minSteps)
    props.onChange(newValue)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value

    // 空文字の場合は一時的に許可（入力中の可能性があるため）
    if (inputValue === "") {
      return
    }

    const numericValue = Number(inputValue)

    // 数値でない場合は処理しない
    if (Number.isNaN(numericValue)) {
      return
    }

    // 範囲内の値のみ受け入れる
    if (numericValue >= minSteps && numericValue <= maxSteps) {
      props.onChange(numericValue)
    }
  }

  const handleInputBlur = () => {
    // フォーカスが外れた時に範囲チェック
    if (props.value < minSteps) {
      props.onChange(minSteps)
    } else if (props.value > maxSteps) {
      props.onChange(maxSteps)
    }
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-x-2">
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
        <span className="text-muted-foreground text-xs">
          ({minSteps}-{maxSteps})
        </span>
      </div>

      {/* モバイル向けプラスマイナスボタン付きUI */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={handleDecrement}
          disabled={props.value <= minSteps}
          aria-label={t("ステップ数を減らす", "Decrease steps")}
        >
          <MinusIcon className="h-4 w-4" />
        </Button>

        <div className="relative max-w-20 flex-1">
          <Input
            type="number"
            value={props.value}
            min={minSteps}
            max={maxSteps}
            step="1"
            className="h-10 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            aria-label={t("ステップ数", "Steps")}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={handleIncrement}
          disabled={props.value >= maxSteps}
          aria-label={t("ステップ数を増やす", "Increase steps")}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
