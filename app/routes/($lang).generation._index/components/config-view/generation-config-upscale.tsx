import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Checkbox } from "~/components/ui/checkbox"
import { useTranslation } from "~/hooks/use-translation"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useId } from "react"

export function GenerationConfigUpscale() {
  const context = useGenerationContext()

  const t = useTranslation()

  const checkboxId = useId()

  // Gemini生成の場合は高解像度チェックボックスを非表示にする
  const isGeminiModel =
    context.config.modelType === "GEMINI" || context.config.modelType === "SD5"
  if (isGeminiModel) {
    return null
  }

  return (
    <>
      <div className="flex gap-x-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={checkboxId}
            checked={context.config.upscaleSize === 2}
            onCheckedChange={() => {
              context.changeUpscaleSize(
                context.config.upscaleSize === 2 ? null : 2,
              )
            }}
          />
          <label
            htmlFor={checkboxId}
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("高解像度で生成する", "Upscale")}
          </label>
        </div>
        <CrossPlatformTooltip
          text={t(
            "通常の2倍の高解像度で生成できます、2枚分の消費になります。",
            "You can generate at twice the normal resolution, which will consume two images.",
          )}
        />
      </div>
    </>
  )
}
