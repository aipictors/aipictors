import { MinusIcon, PlusIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationConfigFieldLabel } from "~/routes/($lang).generation._index/components/config-view/generation-config-field-label"

type Props = {
  value: number
  onChange(value: number): void
}

export function GenerationConfigStep(props: Props) {
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
      <GenerationConfigFieldLabel
        label={t("Steps（描き込む回数）", "Steps")}
        range={`${minSteps}-${maxSteps}`}
        hint={t(
          "多いほどていねいに描きますが、時間がかかります。ふつうは 20〜28、turbo・lightning 系のモデルは 4〜8 です。",
          "More steps are more careful but slower. Usually 20–28; 4–8 for turbo / lightning models.",
        )}
      />

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
