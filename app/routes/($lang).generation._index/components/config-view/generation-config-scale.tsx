import { AlertTriangleIcon, MinusIcon, PlusIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"
import {
  LOW_GENERATION_SCALE,
  MAX_GENERATION_SCALE,
  MIN_GENERATION_SCALE,
} from "~/lib/generation-sampler"
import { GenerationConfigFieldLabel } from "~/routes/($lang).generation._index/components/config-view/generation-config-field-label"

type Props = {
  value: number
  onChange(value: number): void
}

const clamp = (value: number) =>
  Math.min(
    MAX_GENERATION_SCALE,
    Math.max(MIN_GENERATION_SCALE, Math.round(value)),
  )

/**
 * CFG Scale（プロンプトにどれだけ従うか）。turbo・lightning 系のモデル向けに 1 から選べる
 */
export function GenerationConfigScale(props: Props) {
  const t = useTranslation()

  // 入力中は空欄も許す（確定はフォーカスが外れたとき）
  const [text, setText] = useState(String(props.value))

  useEffect(() => {
    setText(String(props.value))
  }, [props.value])

  const commit = (value: number) => {
    const next = clamp(value)
    setText(String(next))
    if (next !== props.value) props.onChange(next)
  }

  const isLow = props.value < LOW_GENERATION_SCALE

  return (
    <div className="flex flex-col gap-y-2">
      <GenerationConfigFieldLabel
        label={t("CFG Scale（プロンプトへの忠実さ）", "CFG Scale")}
        range={`${MIN_GENERATION_SCALE}-${MAX_GENERATION_SCALE}`}
        hint={t(
          "大きいほどプロンプトどおりに、小さいほど自由に描きます。ふつうは 5〜8 がおすすめです。",
          "Higher follows the prompt more closely, lower is freer. 5–8 is usual.",
        )}
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={() => commit(props.value - 1)}
          disabled={props.value <= MIN_GENERATION_SCALE}
          aria-label={t("CFG を下げる", "Decrease CFG")}
        >
          <MinusIcon className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          inputMode="numeric"
          value={text}
          min={MIN_GENERATION_SCALE}
          max={MAX_GENERATION_SCALE}
          step="1"
          className="h-10 max-w-20 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          onChange={(event) => {
            setText(event.target.value)
            const value = Number(event.target.value)
            if (event.target.value === "" || Number.isNaN(value)) return
            if (
              value >= MIN_GENERATION_SCALE &&
              value <= MAX_GENERATION_SCALE
            ) {
              props.onChange(Math.round(value))
            }
          }}
          onBlur={() => {
            const value = Number(text)
            commit(text === "" || Number.isNaN(value) ? props.value : value)
          }}
          aria-label="CFG Scale"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={() => commit(props.value + 1)}
          disabled={props.value >= MAX_GENERATION_SCALE}
          aria-label={t("CFG を上げる", "Increase CFG")}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      {isLow && (
        <p className="flex items-start gap-x-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-amber-700 text-xs dark:text-amber-300">
          <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t(
            `CFG ${LOW_GENERATION_SCALE} 未満は turbo・lightning・DMD などの専用モデル向けです。ふつうのモデルでは絵が崩れます。`,
            `CFG below ${LOW_GENERATION_SCALE} is for turbo / lightning / DMD models. Regular models will look broken.`,
          )}
        </p>
      )}
    </div>
  )
}
