import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useTranslation } from "~/hooks/use-translation"
import {
  GENERATION_SAMPLER_OPTIONS,
  toGenerationSamplerOptionValue,
} from "~/lib/generation-sampler"
import { GenerationConfigFieldLabel } from "~/routes/($lang).generation._index/components/config-view/generation-config-field-label"

type Props = {
  value: string
  onChange(value: string): void
}

/**
 * サンプラー（描き方）。昔の「〜 Karras」は同じ描き方の名前で表示する（生成結果は同じ）
 */
export function GenerationConfigSampler(props: Props) {
  const t = useTranslation()

  const value = toGenerationSamplerOptionValue(props.value)

  const selected = GENERATION_SAMPLER_OPTIONS.find(
    (option) => option.value === value,
  )

  return (
    <div className="flex flex-col gap-y-2">
      <GenerationConfigFieldLabel
        label={t("Sampler（描き方）", "Sampler")}
        hint={t(
          "ノイズから絵を描いていく方法です。迷ったら「DPM++ 2M」のままで大丈夫です。",
          'How the image is drawn from noise. "DPM++ 2M" is fine if unsure.',
        )}
      />
      <Select
        value={value}
        onValueChange={(next) => {
          props.onChange(next)
        }}
      >
        <SelectTrigger aria-label="Sampler">
          <SelectValue>{value}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {GENERATION_SAMPLER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex flex-col">
                <span>{option.value}</span>
                <span className="text-muted-foreground text-xs">
                  {t(option.description, option.descriptionEn)}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected && (
        <p className="text-muted-foreground text-xs">
          {t(selected.description, selected.descriptionEn)}
        </p>
      )}
    </div>
  )
}
