import { AlertTriangleIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationConfigFieldLabel } from "~/routes/($lang).generation._index/components/config-view/generation-config-field-label"

type Props = {
  value: string
  onChange(value: string | null): void
}

/**
 * VAEの設定
 */
export function GenerationConfigVae(props: Props) {
  const t = useTranslation()

  // VAEが「None」の場合の警告表示判定
  const isVaeNone = props.value === "None"

  return (
    <div className="flex flex-col gap-y-2">
      <GenerationConfigFieldLabel
        label={t("VAE（色・線の仕上げ）", "VAE")}
        hint={t(
          "色の鮮やかさや線の仕上がりを整えます。ふつうはモデルに合ったものが自動で入ります。",
          "Adjusts colors and lines. A matching one is usually set automatically.",
        )}
      />

      {/* VAEが「None」の場合の警告メッセージ */}
      {isVaeNone && (
        <div className="flex items-center gap-x-2 rounded-md border bg-muted p-2 text-muted-foreground text-sm">
          <AlertTriangleIcon className="h-4 w-4 flex-shrink-0 text-amber-500" />
          <span>
            {t(
              "VAEが「None」に設定されています。生成結果に異常があった場合はVAEありにしてください。",
              "VAE is set to 'None'. If the generation result becomes pixelated, please use a VAE.",
            )}
          </span>
        </div>
      )}

      <Select
        value={props.value}
        onValueChange={(value) => {
          value === ""
            ? props.onChange("vae-ft-mse-840000-ema-pruned")
            : props.onChange(value)
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {config.generationFeature.vaeValues.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
