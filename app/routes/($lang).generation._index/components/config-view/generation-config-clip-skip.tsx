import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationConfigFieldLabel } from "~/routes/($lang).generation._index/components/config-view/generation-config-field-label"

type Props = {
  value: number
  onChange(value: number): void
}

/**
 * ClipSkipの設定
 */
export function GenerationConfigClipSkip(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-y-2">
      <GenerationConfigFieldLabel
        label="Clip skip"
        range="1-12"
        hint={t(
          "絵柄の雰囲気が少し変わります。アニメ系のモデルはふつう 2 です。",
          "Slightly changes the style. Usually 2 for anime models.",
        )}
      />
      <Input
        type="number"
        value={props.value}
        min={1}
        max={12}
        onChange={(event) => {
          const value = Number(event.target.value)
          if (event.target.value === "" || Number.isNaN(value)) return
          props.onChange(Math.min(12, Math.max(1, Math.round(value))))
        }}
      />
    </div>
  )
}
