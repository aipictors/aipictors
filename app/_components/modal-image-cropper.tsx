import getCroppedImg from "@/app/_utils/getCroppedImg"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState } from "react"
import Cropper, { Area } from "react-easy-crop"

type Props = {
  src: string
  isOpen: boolean
  cropWidth: number
  cropHeight: number
  onCrop: (croppedImage: string) => void
  onClose: () => void
}

/**
 * モーダル画像クロップ
 * @param param0
 * @returns
 */
const ImageCropperModal = (props: Props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })

  const [zoom, setZoom] = useState(1)

  const [croppedAreaPixels, setCroppedAreaPixels] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const onSubmit = async () => {
    const croppedImage = await getCroppedImg(props.src, croppedAreaPixels)
    props.onCrop(croppedImage)
    props.onClose()
  }

  const aspectRatio = props.cropWidth / props.cropHeight

  return (
    <Dialog open={props.isOpen}>
      <DialogContent>
        <div className="w-[80vw] h-[72vh]">
          <Cropper
            classes={{ containerClassName: "mb-16" }}
            image={props.src}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
          />
        </div>
        <div className="flex items-center absolute bottom-4 left-4">
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
        {/* <Slider value={[zoom]} onChange={(value) => setZoom(Number(value))} /> */}
      </DialogContent>
    </Dialog>
  )
}

export default ImageCropperModal
