import { CropImageField } from "@/_components/crop-image-field"
import { CrossPlatformTooltip } from "@/_components/cross-platform-tooltip"
import { Button } from "@/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/_components/ui/dialog"
import { getBase64FromImageUrl } from "@/_utils/get-base64-from-image-url"
import { GenerationConfigControlNetDialogContents } from "@/routes/($lang).generation._index/_components/config-view/generation-config-control-net-dialog-contents"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { parseGenerationSize } from "@/routes/($lang).generation.tasks.$task/_types/generation-size"
import { useState } from "react"
import { useBoolean } from "usehooks-ts"

/**
 * ControlNet設定
 * @returns
 */
export const GenerationConfigControlNet = () => {
  const context = useGenerationContext()

  const size = parseGenerationSize(context.config.sizeType)

  const { value, setTrue, setFalse } = useBoolean()

  const [module, setModule] = useState("")

  const [model, setModel] = useState("")

  const [isSelectorOpen, setIsSelectorOpen] = useState(false)

  const [weight, setWeight] = useState(
    context.config.controlNetWeight === null
      ? 1
      : context.config.controlNetWeight,
  )

  /**
   * クロップ完了
   * @param croppedImage クロップした画像
   */
  const onCrop = async (croppedImage: string) => {
    const base64 = await getBase64FromImageUrl(croppedImage)
    context.changeControlNetImageBase64(base64)
    setTrue()
  }

  /**
   * 画像削除
   */
  const onDeleteImage = () => {
    context.changeControlNetModuleAndModelAndImage(null, null, null, null, null)
  }

  /**
   * 決定
   */
  const onSubmitControlNet = () => {
    if (model === "" || module === "") {
      return
    }
    context.changeControlNetModuleAndModelAndWeight(model, module, weight)
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex gap-x-2">
        <span className="text-nowrap font-bold">
          {"ControlNet（SDXL以外）"}
        </span>
        <CrossPlatformTooltip
          text={"参考画像からより厳密な画像生成ができます。"}
        />
      </div>
      <CropImageField
        isHidePreviewImage={
          context.config.controlNetImageBase64 === "" ||
          context.config.controlNetImageBase64 === null
        }
        cropWidth={size.width}
        cropHeight={size.height}
        onDeleteImage={onDeleteImage}
        onCrop={onCrop}
      />
      {context.config.controlNetModule !== null && (
        <div className="text-sm">Module: {context.config.controlNetModule}</div>
      )}
      {context.config.controlNetModel !== null && (
        <div className="text-sm">Model: {context.config.controlNetModel}</div>
      )}
      {context.config.controlNetWeight !== null && (
        <div className="text-sm">比重: {context.config.controlNetWeight}</div>
      )}
      {context.config.controlNetImageBase64 !== null && (
        <Dialog
          open={value}
          onOpenChange={(isOpen) => {
            if (isOpen) return
            setFalse()
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={setTrue}
              size={"sm"}
              className="w-full"
              variant={"secondary"}
            >
              {context.config.controlNetModule !== null
                ? "コントロールを変更"
                : "コントロールを追加"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogDescription>{"Control"}</DialogDescription>
            </DialogHeader>
            <GenerationConfigControlNetDialogContents
              module={module}
              weight={weight}
              isSelectorOpen={isSelectorOpen}
              setModule={setModule}
              setModel={setModel}
              setWeight={setWeight}
              setIsSelectorOpen={setIsSelectorOpen}
            />
            <DialogFooter>
              <Button
                variant={"secondary"}
                onClick={() => {
                  setFalse()
                }}
                disabled={isSelectorOpen}
              >
                {"キャンセル"}
              </Button>
              <Button
                onClick={() => {
                  onSubmitControlNet()
                  setFalse()
                }}
                disabled={isSelectorOpen}
                className="mb-4 md:mb-0"
              >
                {"追加"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
