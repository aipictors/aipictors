import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationConfigFieldLabel } from "~/routes/($lang).generation._index/components/config-view/generation-config-field-label"

type Props = {
  value: boolean
  onChange(value: boolean): void
}

/**
 * 顔の自動修正（ADetailer 相当）
 */
export function GenerationConfigFaceFix(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex items-center justify-between gap-x-4">
      <GenerationConfigFieldLabel
        label={t("顔を自動で修正", "Fix faces automatically")}
        hint={t(
          "生成した画像の顔を見つけて、拡大して描き直します（ADetailer と同じ仕組み）。遠くの小さい顔や崩れた顔がきれいになります。少し時間がかかります。",
          "Finds faces in the image and redraws them at a higher resolution (like ADetailer). Small or broken faces get cleaner. Takes a little longer.",
        )}
      />
      <Switch checked={props.value} onCheckedChange={props.onChange} />
    </div>
  )
}
