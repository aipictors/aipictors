import ImageCropperModal from "@/app/_components/modal-image-cropper"
import { Input } from "@/components/ui/input"
import { useCallback, useState } from "react"

type Props = {
  cropWidth: number
  cropHeight: number
  onCrop: (croppedImage: string) => void
}

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

  return (
    <>
      <Input type="file" onChange={onFileChange} />
      {croppedImage && <img alt={"croppedImage"} src={croppedImage} />}
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
