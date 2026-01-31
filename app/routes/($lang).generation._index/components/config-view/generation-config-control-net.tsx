import { CropImageField } from "~/components/crop-image-field"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"
import { GenerationConfigControlNetDialogContents } from "~/routes/($lang).generation._index/components/config-view/generation-config-control-net-dialog-contents"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { parseGenerationSize } from "~/routes/($lang).generation._index/types/generation-size"
import { useState } from "react"
import { useBoolean } from "usehooks-ts"
import { useTranslation } from "~/hooks/use-translation"

/**
 * ControlNet設定
 */
export function GenerationConfigControlNet () {
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
    if (model === "" && module === "") {
      return
    }
    context.changeControlNetModuleAndModelAndWeight(model, module, weight)
  }

  const t = useTranslation()

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex gap-x-2">
        <span className="text-nowrap font-bold">
          {t("ControlNet", "ControlNet")}
        </span>
        <CrossPlatformTooltip
          text={t(
            "参考画像からより厳密な画像生成ができます。",
            "You can generate more accurate images from reference images.",
          )}
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
                ? t("コントロールを変更", "Change control")
                : t("コントロールを追加", "Add control")}
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
              modelType={context.config.modelType}
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
                {t("キャンセル", "Cancel")}
              </Button>
              <Button
                onClick={() => {
                  onSubmitControlNet()
                  setFalse()
                }}
                disabled={isSelectorOpen}
                className="mb-4 md:mb-0"
              >
                {t("追加", "Add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
