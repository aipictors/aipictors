import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { parseGenerationSize } from "@/app/[lang]/generation/tasks/[task]/_types/generation-size"
import CropImageField from "@/app/_components/crop-image-field"
import getImageAsBase64 from "@/app/_utils/get-image-as-base64"

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
    const base64 = await getImageAsBase64(croppedImage)
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
      <span className="font-bold text-sm">{"画像から生成"}</span>
      <CropImageField
        cropWidth={size.width}
        cropHeight={size.height}
        onDeleteImage={onDeleteImage}
        onCrop={onCrop}
      />
    </div>
  )
}
