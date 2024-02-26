import ImageCropperModal from "@/app/_components/modal-image-cropper"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { XIcon } from "lucide-react"
import { useCallback, useState } from "react"

type Props = {
  cropWidth: number
  cropHeight: number
  onDeleteImage: () => void
  onCrop: (croppedImage: string) => void
}

/**
 * 指定した画像ファイルの切り抜き開始領域
 * @param props
 * @returns
 */
const CropImageField = (props: Props) => {
  const [image, setImage] = useState<string | undefined>(undefined)

  const [croppedImage, setCroppedImage] = useState<string>("")

  const [isOpen, setIsOpen] = useState<boolean>(false)

  /**
   * ファイル選択後の処理
   */
  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const reader = new FileReader()
        reader.addEventListener("load", () => {
          if (reader.result) {
            setImage(reader.result.toString() || "")
            setIsOpen(true)
          }
        })
        reader.readAsDataURL(e.target.files[0])
      }
    },
    [],
  )

  /**
   * クロップしたときの処理
   * @param croppedImage クロップした画像base64
   */
  const onCrop = (croppedImage: string) => {
    setCroppedImage(croppedImage)
    props.onCrop(croppedImage)
  }

  /**
   * クロップモーダルを閉じたときの処理
   */
  const onClose = () => {
    setIsOpen(false)
  }

  /**
   * 画像削除
   */
  const onDeleteImage = () => {
    setImage("")
    setCroppedImage("")
    props.onDeleteImage()
  }

  return (
    <>
      <Input
        type="file"
        accept=".webp,.png,.jpeg,.jpg,.gif,.svg,.bmp,.ico,.tiff,.tif,.svgz,.apng,.avif,.jfif,.pjpeg,.pjp,.jpgv,.hdp,.jpe,.jpeg2000,.jxr,.wdp,.jng,.jif,.jfi"
        onChange={onFileChange}
      />
      {croppedImage && (
        <Card className="relative">
          <img
            className="max-w-64 max-h-48 m-auto"
            alt={"croppedImage"}
            src={croppedImage}
          />
          <Button
            className="absolute right-2 top-2"
            size={"icon"}
            variant="ghost"
            onClick={onDeleteImage}
          >
            <XIcon className="h-6 w-6" />
          </Button>
        </Card>
      )}
      <ImageCropperModal
        src={image!}
        isOpen={isOpen}
        cropWidth={props.cropWidth}
        cropHeight={props.cropHeight}
        onCrop={onCrop}
        onClose={onClose}
      />
    </>
  )
}

export default CropImageField
