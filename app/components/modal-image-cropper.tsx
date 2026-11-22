import { ZoomInIcon, ZoomOutIcon } from "lucide-react"
import { lazy, Suspense, useState } from "react"
import type { Area } from "react-easy-crop"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"
import { getCroppedImage } from "~/utils/get-cropped-image"
import getResizedImg from "~/utils/get-resized-image"

// 切り抜きを開いたときに読み込む（作品・ユーザーなど多くのページの最初の JS に入っていた）
const Cropper = lazy(() => import("react-easy-crop"))

type Props = {
  src: string
  isOpen: boolean
  cropWidth: number
  cropHeight: number
  cropContainerClassName?: string
  fileExtension?: string
  onCrop: (croppedImage: string) => void
  onClose: () => void
}

/**
 * モーダル画像クロップ
 */
export function ImageCropperModal(props: Props): React.ReactNode {
  const [crop, setCrop] = useState({ x: 0, y: 0 })

  const [zoom, setZoom] = useState(1)

  const [croppedAreaPixels, setCroppedAreaPixels] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })

  const aspectRatio = props.cropWidth / props.cropHeight

  /**
   * 切り抜きエリア変更時の処理
   * @param croppedArea
   * @param croppedAreaPixels
   */
  const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  /**
   * 切り抜き処理
   */
  const onSubmit = async () => {
    if (props.src.startsWith("https://")) {
      const base64 = await getBase64FromImageUrl(props.src)

      const croppedImage = await getCroppedImage(
        base64,
        croppedAreaPixels,
        props.fileExtension,
      )

      const resizedImage = await getResizedImg(
        croppedImage,
        props.cropWidth,
        props.cropHeight,
        props.fileExtension,
      )

      props.onCrop(resizedImage)
    } else {
      const croppedImage = await getCroppedImage(
        props.src,
        croppedAreaPixels,
        props.fileExtension,
      )

      const resizedImage = await getResizedImg(
        croppedImage,
        props.cropWidth,
        props.cropHeight,
        props.fileExtension,
      )

      props.onCrop(resizedImage)
    }

    props.onClose()
  }

  return (
    // onOpenChange を渡さないと、右上の「✕」・Esc・外側を押しても閉じない
    <Dialog
      open={props.isOpen}
      onOpenChange={(open) => {
        if (!open) {
          props.onClose()
        }
      }}
    >
      <DialogContent className="flex w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-3 p-4 sm:p-5">
        <DialogTitle className="pr-10 text-base">
          {"画像を切り抜く"}
        </DialogTitle>
        <div className="relative h-[min(60dvh,560px)] w-full overflow-hidden rounded-lg bg-muted">
          <Suspense fallback={null}>
            <Cropper
              classes={{
                containerClassName: `mt-1 ${props.cropContainerClassName ?? ""}`,
              }}
              image={props.src}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              showGrid={false}
              objectFit="contain"
            />
          </Suspense>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-2 text-muted-foreground text-xs">
            <ZoomOutIcon className="size-4 shrink-0" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-label="Zoom"
              onChange={(e) => {
                setZoom(Number(e.target.value))
              }}
              className="w-full accent-primary"
            />
            <ZoomInIcon className="size-4 shrink-0" />
          </label>
          <div className="flex gap-2">
            <Button
              variant={"ghost"}
              className="flex-1 sm:flex-none"
              onClick={props.onClose}
            >
              {"キャンセル"}
            </Button>
            <Button
              className="flex-[2] sm:min-w-32 sm:flex-none"
              onClick={onSubmit}
            >
              {"切り抜く"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
