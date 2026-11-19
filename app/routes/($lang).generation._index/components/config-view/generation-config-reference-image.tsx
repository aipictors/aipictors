import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { useEffect, useMemo, useState } from "react"
import { RadioGroup } from "~/components/ui/radio-group"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationConfigControlNet } from "~/routes/($lang).generation._index/components/config-view/generation-config-control-net"
import { GenerationConfigI2i } from "~/routes/($lang).generation._index/components/config-view/generation-config-i2i"
import {
  ConfigSectionHeader,
  configChipClass,
} from "~/routes/($lang).generation._index/components/config-view/generation-config-parts"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

type ReferenceImageMode = "none" | "i2i" | "controlnet"

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

  const options: {
    value: ReferenceImageMode
    label: string
    description: string
  }[] = [
    {
      value: "none",
      label: t("なし", "None"),
      description: t("参照画像を使いません。", "No reference image."),
    },
    {
      value: "i2i",
      label: t("画像から生成", "Generate from image"),
      description: t(
        "元画像をベースに生成します（構図や雰囲気を引き継ぎたいとき）。",
        "Generate based on the input image (inherit composition/mood).",
      ),
    },
    {
      value: "controlnet",
      label: t("ControlNet", "ControlNet"),
      description: t(
        "輪郭・ポーズなどを参考に、より厳密に誘導して生成します。",
        "Guide generation more strictly using edges/pose, etc.",
      ),
    },
  ]

  const selectedOption = options.find((option) => option.value === mode)

  return (
    <section className="flex flex-col gap-y-2">
      <ConfigSectionHeader
        title={t("参照画像", "Reference image")}
        tooltip={t(
          "『画像から生成』と『ControlNet』はどちらか一方のみ選べます。切り替えると反対側の設定は解除されます。",
          "Choose either 'Generate from image' or 'ControlNet'. Switching clears the other setting.",
        )}
      />

      <RadioGroup
        value={mode}
        onValueChange={(value) => onChangeMode(value as ReferenceImageMode)}
        className="grid grid-cols-3 gap-1.5"
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option.value}
            id={`ref-${option.value}`}
            value={option.value}
            asChild
          >
            <button
              type="button"
              className={configChipClass({
                isSelected: mode === option.value,
                className: "px-1 text-xs sm:text-sm",
              })}
            >
              {option.label}
            </button>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroup>

      {selectedOption && (
        <p className="text-muted-foreground text-xs">
          {selectedOption.description}
        </p>
      )}
      {isBothSelected && (
        <p className="text-muted-foreground text-xs">
          {t(
            "現在、両方が設定されています。どちらかを選ぶと片方が解除されます。",
            "Both are currently set. Selecting one will clear the other.",
          )}
        </p>
      )}

      {mode === "i2i" && <GenerationConfigI2i />}
      {mode === "controlnet" && <GenerationConfigControlNet />}
    </section>
  )
}
