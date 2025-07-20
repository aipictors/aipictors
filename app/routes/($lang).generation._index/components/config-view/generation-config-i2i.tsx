import { CropImageField } from "~/components/crop-image-field"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Slider } from "~/components/ui/slider"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { parseGenerationSize } from "~/routes/($lang).generation._index/types/generation-size"
import { useTranslation } from "~/hooks/use-translation"

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

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex gap-x-2">
        <span className="text-nowrap font-bold">
          {t("画像から生成", "Generate from image (except SDXL)")}
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
      <CropImageField
        isHidePreviewImage={context.config.i2iImageBase64 === ""}
        cropWidth={size.width}
        cropHeight={size.height}
        onDeleteImage={onDeleteImage}
        onCrop={onCrop}
      />
      {context.config.i2iImageBase64 !== "" && (
        <div className="flex items-center gap-x-2">
          <div className="flex w-20 items-center">
            <span className="w-12 whitespace-nowrap text-nowrap text-sm">
              {t("変更度", "Change rate")}
            </span>
            <CrossPlatformTooltip
              text={t(
                "変更度が小さいほど元の画像が残ります。推奨値は0.5~0.6です。",
                "The smaller the change, the more the original image remains. The recommended value is 0.5 to 0.6.",
              )}
            />
          </div>
          <Slider
            className="color-pink w-full"
            aria-label="slider-ex-2"
            min={0.1}
            max={1.0}
            step={0.01}
            value={[context.config.i2iDenoisingStrengthSize]}
            onValueChange={(value) =>
              context.changeI2iDenoisingStrengthSize(value[0])
            }
          />
          <span className="font-bold">
            {context.config.i2iDenoisingStrengthSize.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  )
}
