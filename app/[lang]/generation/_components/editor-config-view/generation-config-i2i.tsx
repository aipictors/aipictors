import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { parseGenerationSize } from "@/app/[lang]/generation/tasks/[task]/_types/generation-size"
import CropImageField from "@/app/_components/crop-image-field"
import { CrossPlatformTooltip } from "@/app/_components/cross-platform-tooltip"
import getBase64FromImageUrl from "@/app/_utils/get-base64-from-image-url"
import { Slider } from "@/components/ui/slider"

/**
 * i2i向け画像設定
 * @returns
 */
export const GenerationConfigI2i = () => {
  const context = useGenerationContext()

  const size = parseGenerationSize(context.config.sizeType)

  /**
   * クロップ完了
   * @param croppedImage クロップした画像
   */
  const onCrop = async (croppedImage: string) => {
    console.log(croppedImage)
    const base64 = await getBase64FromImageUrl(croppedImage)
    console.log(base64)
    context.changeI2iImageBase64(base64)
  }

  /**
   * 画像削除
   */
  const onDeleteImage = () => {
    context.changeI2iImageBase64("")
  }

  return (
    <div className="flex flex-col gap-y-2">
      <span className="text-nowrap font-bold">{"画像から生成"}</span>
      <CropImageField
        isHidePreviewImage={context.config.i2iImageBase64 === ""}
        cropWidth={size.width}
        cropHeight={size.height}
        onDeleteImage={onDeleteImage}
        onCrop={onCrop}
      />
      <div className="flex items-center gap-x-2">
        <span className="w-auto text-nowrap text-sm">{"変更度"}</span>
        <CrossPlatformTooltip
          text={"変更度が小さいほど元の画像が残ります。推奨値は0.5~0.6です。"}
        />
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
    </div>
  )
}
