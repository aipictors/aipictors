import { ScanFaceIcon } from "lucide-react"
import { useId } from "react"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { configAccentSelected } from "~/routes/($lang).generation._index/components/config-view/generation-config-parts"
import { GenerationOptionExplanation } from "~/routes/($lang).generation._index/components/config-view/generation-option-explanation"

type Props = {
  value: boolean
  onChange(value: boolean): void
  /**
   * スマホ: ほかの項目と同じカード（角丸・余白・影）で出す
   */
  isMobileCard?: boolean
}

/**
 * 顔の自動修正（ADetailer 相当）
 * 詳細設定に埋もれないよう、解像度の下にオプションのカードとして出す。オン・オフの見本付き
 */
export function GenerationConfigFaceFix(props: Props) {
  const t = useTranslation()

  const id = useId()

  return (
    <section
      className={cn(
        "rounded-xl border p-3 transition-colors",
        props.isMobileCard &&
          "rounded-[20px] bg-card p-3.5 shadow-[0_6px_16px_rgba(0,0,0,0.035)] dark:shadow-none",
        props.value && configAccentSelected,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
            props.value &&
              "bg-fuchsia-500/15 text-fuchsia-700 dark:bg-fuchsia-400/15 dark:text-fuchsia-200",
          )}
        >
          <ScanFaceIcon className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <Label
            htmlFor={id}
            className="block cursor-pointer font-semibold text-foreground text-sm"
          >
            {t("顔を自動で修正", "Fix faces automatically")}
          </Label>
          <p className="text-muted-foreground text-xs">
            {props.value
              ? t("オン: 顔を描き直して仕上げます", "On: faces get redrawn")
              : t(
                  "崩れた顔・小さい顔におすすめ",
                  "Good for small or broken faces",
                )}
          </p>
        </div>
        <Switch
          id={id}
          checked={props.value}
          onCheckedChange={props.onChange}
        />
      </div>
      <GenerationOptionExplanation
        className="mt-3"
        text={t(
          "生成した画像から顔を見つけて、拡大して描き直します（ADetailer と同じ仕組み）。遠くの小さい顔や崩れた目もとがきれいになります。",
          "Finds faces in the image and redraws them larger (like ADetailer). Small faces and broken eyes get cleaner.",
        )}
        example={{
          offImageUrl:
            "https://assets.aipictors.com/generation-options/face-fix-off.webp",
          onImageUrl:
            "https://assets.aipictors.com/generation-options/face-fix-on.webp",
          alt: t(
            "同じ Seed で作った顔の自動修正の見本",
            "Face fix example made with the same seed",
          ),
        }}
        coin={t("コインは変わりません", "Same coin cost")}
        time={t("少し時間がかかります", "Takes a little longer")}
      />
    </section>
  )
}
