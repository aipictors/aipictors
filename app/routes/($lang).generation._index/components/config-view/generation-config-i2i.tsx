import { CropImageField } from "~/components/crop-image-field"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { useTranslation } from "~/hooks/use-translation"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { parseGenerationSize } from "~/routes/($lang).generation._index/types/generation-size"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"

const CHANGE_STRENGTH_MIN = 0.1
const CHANGE_STRENGTH_MAX = 1.0

const CHANGE_STRENGTH_PRESETS = [
  { value: 0.3, key: "low" as const },
  { value: 0.55, key: "recommended" as const },
  { value: 0.8, key: "high" as const },
]

function getChangeStrengthLabel(value: number) {
  if (value <= 0.35) return "low" as const
  if (value <= 0.65) return "balanced" as const
  if (value <= 0.85) return "high" as const
  return "veryHigh" as const
}

/**
 * i2i向け画像設定
 */
export function GenerationConfigI2i() {
  const context = useGenerationContext()

  const size = parseGenerationSize(context.config.sizeType)

  /**
   * クロップ完了
   * @param croppedImage クロップした画像
   */
  const onCrop = async (croppedImage: string) => {
    const base64 = await getBase64FromImageUrl(croppedImage)
    context.changeI2iImageBase64(base64)
  }

  /**
   * 画像削除
   */
  const onDeleteImage = () => {
    context.changeI2iImageBase64("")
  }

  const t = useTranslation()

  const changeStrength = context.config.i2iDenoisingStrengthSize
  const changeStrengthLabel = getChangeStrengthLabel(changeStrength)

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex gap-x-2">
        <span className="text-nowrap font-bold">
          {t(
            "画像から生成（元画像ベース）",
            "Generate from image (base image)",
          )}
        </span>
        <CrossPlatformTooltip
          text={t(
            "任意の画像から、画像生成することができます ※機能紹介動画",
            "You can generate images from any image ※ Function introduction video",
          )}
          detailLink={"https://youtu.be/d1nKrnUy3wY?feature=shared"}
          isTargetBlank={true}
        />
      </div>
      {context.config.modelType === "GEMINI" && !context.currentPass?.type && (
        <div className="rounded-md border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-3 dark:border-blue-800 dark:from-blue-950 dark:to-purple-950">
          <div className="text-blue-800 text-sm dark:text-blue-200">
            <div className="text-xs opacity-80">
              {t(
                "全モデルで画像から生成を利用できるのは",
                "Image-to-image generation for all models is available with",
              )}
              <a
                href="/plus"
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t("LITEプラン以上", "LITE plan or higher")}
              </a>
              {t("です。", ".")}
            </div>
          </div>
        </div>
      )}
      <CropImageField
        isHidePreviewImage={context.config.i2iImageBase64 === ""}
        cropWidth={size.width}
        cropHeight={size.height}
        onDeleteImage={onDeleteImage}
        onCrop={onCrop}
      />
      {context.config.i2iImageBase64 !== "" &&
        context.config.modelType !== "GEMINI" && (
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2">
              <div className="flex w-24 items-center">
                <span className="whitespace-nowrap font-bold text-sm">
                  {t("変更度", "Change strength")}
                </span>
                <CrossPlatformTooltip
                  text={t(
                    "値が小さいほど元画像に近く、値が大きいほど大きく変化します（0.10: ほぼ元画像 / 1.00: 大きく変更）。迷ったらおすすめ（0.55）を基準に調整してください。",
                    "Lower values keep the base image, higher values change it more (0.10: mostly base / 1.00: big changes). If unsure, start from Recommended (0.55).",
                  )}
                />
              </div>

              <Slider
                className="color-pink w-full"
                aria-label="i2i-change-strength"
                min={CHANGE_STRENGTH_MIN}
                max={CHANGE_STRENGTH_MAX}
                step={0.01}
                value={[changeStrength]}
                onValueChange={(value) =>
                  context.changeI2iDenoisingStrengthSize(value[0])
                }
              />

              <span className="w-14 text-right font-bold tabular-nums">
                {changeStrength.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>{t("元画像に近い", "Closer to base")}</span>
              <span>{t("大きく変える", "Change more")}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {CHANGE_STRENGTH_PRESETS.map((preset) => (
                <Button
                  key={preset.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    context.changeI2iDenoisingStrengthSize(preset.value)
                  }
                >
                  {preset.key === "low" && t("微変更", "Subtle")}
                  {preset.key === "recommended" && t("おすすめ", "Recommended")}
                  {preset.key === "high" && t("大きめ", "Strong")}{" "}
                  {preset.value.toFixed(2)}
                </Button>
              ))}
              <span className="text-muted-foreground text-xs">
                {changeStrengthLabel === "low" &&
                  t(
                    "元画像重視（輪郭・構図が残りやすい）",
                    "Base-focused (keeps structure more)",
                  )}
                {changeStrengthLabel === "balanced" &&
                  t(
                    "バランス（迷ったらここ）",
                    "Balanced (good starting point)",
                  )}
                {changeStrengthLabel === "high" &&
                  t(
                    "変化強め（雰囲気を変えたい時）",
                    "Stronger change (when you want a new vibe)",
                  )}
                {changeStrengthLabel === "veryHigh" &&
                  t(
                    "大きく変更（崩れやすいので注意）",
                    "Very strong (may drift/break)",
                  )}
              </span>
            </div>
          </div>
        )}
    </div>
  )
}
