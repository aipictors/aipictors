import { Button } from "~/components/ui/button"
import { Dialog, DialogContent } from "~/components/ui/dialog"
import { getBase64FromAipictorsUrl } from "~/utils/get-base64-from-aipicors-url"
import { getCroppedImage } from "~/utils/get-cropped-image"
import getResizedImg from "~/utils/get-resized-image"
import { useState } from "react"
import type { Area } from "react-easy-crop"
import Cropper from "react-easy-crop"

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
export const ImageCropperModal = (props: Props) => {
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
  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  /**
   * 切り抜き処理
   */
  const onSubmit = async () => {
    if (props.src.startsWith("https://")) {
      const base64 = await getBase64FromAipictorsUrl(props.src)
      const dataUrl = `data:image/webp;base64,${base64}`

      const croppedImage = await getCroppedImage(
        dataUrl,
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
    <Dialog open={props.isOpen}>
      <DialogContent>
        <div className="">
          <div className="mb-2 h-[72vh] w-[80vw]">
            <Cropper
              classes={{
                containerClassName: `mb-16 mt-1 ${props.cropContainerClassName}`,
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
          </div>
          <div className="absolute bottom-4 left-4 flex items-center">
            <div className="flex items-center">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => {
                  setZoom(Number(e.target.value))
                }}
                className="ml-2"
              />
            </div>
            <div className="ml-2 flex items-center">
              <Button
                variant={"secondary"}
                className="ml-2"
                onClick={props.onClose}
              >
                {"キャンセル"}
              </Button>
              <Button className="ml-2" onClick={onSubmit}>
                {"切り抜く"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
