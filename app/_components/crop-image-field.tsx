import ImageCropperModal from "@/_components/modal-image-cropper"
import { Button } from "@/_components/ui/button"
import { Card } from "@/_components/ui/card"
import { Input } from "@/_components/ui/input"
import { ArrowUpFromLineIcon, XIcon } from "lucide-react"
import { useCallback, useState } from "react"

type Props = {
  isHidePreviewImage: boolean
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

  const cropperClassName = "react-easy-crop-container"

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
            // syadcnのダイアログ上でクロップモーダルが表示されるときに、クロップ領域が正常に描画されるために必要な処理
            setTimeout(() => {
              const element = document.querySelector(`.${cropperClassName}`)
              if (element) {
                setTimeout(() => {
                  element.classList.remove("mt-1")
                }, 100)
                setTimeout(() => {
                  element.classList.add("mt-1")
                }, 200)
              }
            }, 500)
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

  if (croppedImage && !props.isHidePreviewImage) {
    return (
      <>
        <Card className="relative">
          <img
            className="m-auto max-h-48 max-w-64"
            alt={"croppedImage"}
            src={croppedImage}
          />
          <Input
            type="file"
            accept=".webp,.png,.jpeg,.jpg,.gif,.svg,.bmp,.ico,.tiff,.tif,.svgz,.apng,.avif,.jfif,.pjpeg,.pjp,.jpgv,.hdp,.jpe,.jpeg2000,.jxr,.wdp,.jng,.jif,.jfi"
            onChange={onFileChange}
            className="left- 0 absolute top-0 h-full w-full cursor-pointer opacity-0"
          />
          <Button
            className="absolute top-2 right-2"
            size={"icon"}
            variant="ghost"
            onClick={onDeleteImage}
          >
            <XIcon className="h-6 w-6" />
          </Button>
        </Card>
        {image && (
          <ImageCropperModal
            src={image}
            isOpen={isOpen}
            cropContainerClassName={cropperClassName}
            cropWidth={props.cropWidth}
            cropHeight={props.cropHeight}
            onCrop={onCrop}
            onClose={onClose}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="relative">
        <div className="rounded-lg border p-4">
          <ArrowUpFromLineIcon className="m-auto h-4 w-4 opacity-80" />
          <div className="text-center text-sm opacity-80">画像アップロード</div>
        </div>
        <Input
          type="file"
          accept=".webp,.png,.jpeg,.jpg,.gif,.svg,.bmp,.ico,.tiff,.tif,.svgz,.apng,.avif,.jfif,.pjpeg,.pjp,.jpgv,.hdp,.jpe,.jpeg2000,.jxr,.wdp,.jng,.jif,.jfi"
          onChange={onFileChange}
          className="left- 0 absolute top-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      {image && (
        <ImageCropperModal
          src={image}
          isOpen={isOpen}
          cropContainerClassName={cropperClassName}
          cropWidth={props.cropWidth}
          cropHeight={props.cropHeight}
          onCrop={onCrop}
          onClose={onClose}
        />
      )}
    </>
  )
}

export default CropImageField
