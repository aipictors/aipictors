import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { parseGenerationSize } from "@/app/[lang]/generation/tasks/[task]/_types/generation-size"
import CropImageField from "@/app/_components/crop-image-field"

/**
 * i2i向け画像設定
 * @returns
 */
export const GenerationConfigI2i = () => {
  const context = useGenerationContext()
  const size = parseGenerationSize(context.config.sizeType)

  const onCrop = (croppedImage: string) => {
    context.changeI2iImageBase64(croppedImage)
  }

  return (
    <div className="flex flex-col gap-y-2">
      <span className="font-bold text-sm">{"画像から生成"}</span>
      <CropImageField
        onCrop={onCrop}
        cropWidth={size.width}
        cropHeight={size.height}
      />
    </div>
  )
}
