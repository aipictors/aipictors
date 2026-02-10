import { useEffect, useMemo, useState } from "react"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Label } from "~/components/ui/label"
import { cn } from "~/lib/utils"
import { useTranslation } from "~/hooks/use-translation"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { GenerationConfigControlNet } from "~/routes/($lang).generation._index/components/config-view/generation-config-control-net"
import { GenerationConfigI2i } from "~/routes/($lang).generation._index/components/config-view/generation-config-i2i"

type ReferenceImageMode = "none" | "i2i" | "controlnet"

export function GenerationConfigReferenceImage () {
  const context = useGenerationContext()

  const t = useTranslation()

  const hasI2iImage = context.config.i2iImageBase64 !== ""
  const hasControlNetImage =
    context.config.controlNetImageBase64 !== null &&
    context.config.controlNetImageBase64 !== ""

  const defaultMode: ReferenceImageMode = useMemo(() => {
    if (hasControlNetImage) return "controlnet"
    if (hasI2iImage) return "i2i"
    return "none"
  }, [hasControlNetImage, hasI2iImage])

  const [mode, setMode] = useState<ReferenceImageMode>(() => defaultMode)

  useEffect(() => {
    if (mode !== "none") return
    if (hasControlNetImage) {
      setMode("controlnet")
      return
    }
    if (hasI2iImage) {
      setMode("i2i")
    }
  }, [hasControlNetImage, hasI2iImage, mode])

  const clearI2i = () => {
    context.changeI2iImageBase64("")
  }

  const clearControlNet = () => {
    context.changeControlNetModuleAndModelAndImage(null, null, null, null, null)
    context.changeControlNetEnabled(false)
  }

  const onChangeMode = (nextMode: ReferenceImageMode) => {
    setMode(nextMode)

    if (nextMode === "i2i") {
      clearControlNet()
      return
    }

    if (nextMode === "controlnet") {
      clearI2i()
      return
    }

    clearI2i()
    clearControlNet()
  }

  const isBothSelected = hasI2iImage && hasControlNetImage

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-col gap-y-1">
        <span className="font-bold">{t("参照画像", "Reference image")}</span>
        <p className="text-muted-foreground text-xs">
          {t(
            "『画像から生成』と『ControlNet』はどちらか一方のみ選べます。切り替えると反対側の設定は解除されます。",
            "Choose either 'Generate from image' or 'ControlNet'. Switching clears the other setting.",
          )}
        </p>
        {isBothSelected && (
          <p className="text-muted-foreground text-xs">
            {t(
              "現在、両方が設定されています。どちらかを選ぶと片方が解除されます。",
              "Both are currently set. Selecting one will clear the other.",
            )}
          </p>
        )}
      </div>

      <RadioGroup
        value={mode}
        onValueChange={(value) => onChangeMode(value as ReferenceImageMode)}
        className="gap-2"
      >
        <div
          className={cn(
            "flex items-start gap-x-3 rounded-md border border-input p-3",
            mode === "none" && "border-primary/30 bg-primary/5",
          )}
        >
          <RadioGroupItem id="ref-none" value="none" className="mt-0.5" />
          <div className="flex flex-col gap-y-0.5">
            <Label htmlFor="ref-none" className="cursor-pointer">
              {t("なし", "None")}
            </Label>
            <p className="text-muted-foreground text-xs">
              {t("参照画像を使いません。", "No reference image.")}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex items-start gap-x-3 rounded-md border border-input p-3",
            mode === "i2i" && "border-primary/30 bg-primary/5",
          )}
        >
          <RadioGroupItem id="ref-i2i" value="i2i" className="mt-0.5" />
          <div className="flex flex-col gap-y-0.5">
            <Label htmlFor="ref-i2i" className="cursor-pointer">
              {t("画像から生成", "Generate from image")}
            </Label>
            <p className="text-muted-foreground text-xs">
              {t(
                "元画像をベースに生成します（構図や雰囲気を引き継ぎたいとき）。",
                "Generate based on the input image (inherit composition/mood).",
              )}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex items-start gap-x-3 rounded-md border border-input p-3",
            mode === "controlnet" && "border-primary/30 bg-primary/5",
          )}
        >
          <RadioGroupItem
            id="ref-controlnet"
            value="controlnet"
            className="mt-0.5"
          />
          <div className="flex flex-col gap-y-0.5">
            <Label htmlFor="ref-controlnet" className="cursor-pointer">
              {t("ControlNet", "ControlNet")}
            </Label>
            <p className="text-muted-foreground text-xs">
              {t(
                "輪郭・ポーズなどを参考に、より厳密に誘導して生成します。",
                "Guide generation more strictly using edges/pose, etc.",
              )}
            </p>
          </div>
        </div>
      </RadioGroup>

      {mode === "i2i" && <GenerationConfigI2i />}
      {mode === "controlnet" && <GenerationConfigControlNet />}
    </div>
  )
}
