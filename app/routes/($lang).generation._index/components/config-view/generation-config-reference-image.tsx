import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Label } from "~/components/ui/label"
import { RadioGroup } from "~/components/ui/radio-group"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { GenerationConfigControlNet } from "~/routes/($lang).generation._index/components/config-view/generation-config-control-net"
import { GenerationConfigI2i } from "~/routes/($lang).generation._index/components/config-view/generation-config-i2i"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

type ReferenceImageMode = "none" | "i2i" | "controlnet"

function ReferenceRadioIndicator() {
  return (
    <span className="mt-0.5 flex size-4 items-center justify-center rounded-full border border-primary text-primary ring-offset-background">
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </span>
  )
}

export function GenerationConfigReferenceImage() {
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
    if (nextMode === mode) return
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
        <RadioGroupPrimitive.Item id="ref-none" value="none" asChild>
          <button
            type="button"
            className={cn(
              "flex items-start gap-x-3 rounded-md border border-input p-3 text-left",
              mode === "none" && "border-primary/30 bg-primary/5",
            )}
          >
            <>
              <ReferenceRadioIndicator />
              <div className="flex flex-col gap-y-0.5">
                <Label>{t("なし", "None")}</Label>
                <p className="text-muted-foreground text-xs">
                  {t("参照画像を使いません。", "No reference image.")}
                </p>
              </div>
            </>
          </button>
        </RadioGroupPrimitive.Item>

        <RadioGroupPrimitive.Item id="ref-i2i" value="i2i" asChild>
          <button
            type="button"
            className={cn(
              "flex items-start gap-x-3 rounded-md border border-input p-3 text-left",
              mode === "i2i" && "border-primary/30 bg-primary/5",
            )}
          >
            <>
              <ReferenceRadioIndicator />
              <div className="flex flex-col gap-y-0.5">
                <Label>{t("画像から生成", "Generate from image")}</Label>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "元画像をベースに生成します（構図や雰囲気を引き継ぎたいとき）。",
                    "Generate based on the input image (inherit composition/mood).",
                  )}
                </p>
              </div>
            </>
          </button>
        </RadioGroupPrimitive.Item>

        <RadioGroupPrimitive.Item id="ref-controlnet" value="controlnet" asChild>
          <button
            type="button"
            className={cn(
              "flex items-start gap-x-3 rounded-md border border-input p-3 text-left",
              mode === "controlnet" && "border-primary/30 bg-primary/5",
            )}
          >
            <>
              <ReferenceRadioIndicator />
              <div className="flex flex-col gap-y-0.5">
                <Label>{t("ControlNet", "ControlNet")}</Label>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "輪郭・ポーズなどを参考に、より厳密に誘導して生成します。",
                    "Guide generation more strictly using edges/pose, etc.",
                  )}
                </p>
              </div>
            </>
          </button>
        </RadioGroupPrimitive.Item>
      </RadioGroup>

      {mode === "i2i" && <GenerationConfigI2i />}
      {mode === "controlnet" && <GenerationConfigControlNet />}
    </div>
  )
}
