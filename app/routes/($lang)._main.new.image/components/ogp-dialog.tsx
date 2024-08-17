import { useEffect, useState } from "react"
import { ImageCropperModal } from "~/components/modal-image-cropper"

type Props = {
  imageBase64: string
  setResultImage: (image: string) => void
  children: React.ReactNode
}

export function OgpDialog(props: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [cropDimensions, setCropDimensions] = useState<{
    width: number
    height: number
  }>({ width: 0, height: 0 })

  useEffect(() => {
    const img = new Image()
    img.src = props.imageBase64
    img.onload = () => {
      const aspectRatio = 1.91
      const imageWidth = img.width
      const imageHeight = img.height

      let cropWidth = imageWidth
      let cropHeight = cropWidth / aspectRatio

      if (cropHeight > imageHeight) {
        cropHeight = imageHeight
        cropWidth = cropHeight * aspectRatio
      }

      setCropDimensions({ width: cropWidth, height: cropHeight })
    }
  }, [props.imageBase64])

  const onClose = () => {
    setIsOpen(false)
  }

  const onCrop = (croppedImage: string) => {
    props.setResultImage(croppedImage)
    onClose()
  }

  const cropperClassName = "react-easy-crop-container"

  return (
    <>
      <ImageCropperModal
        src={props.imageBase64}
        isOpen={isOpen}
        cropContainerClassName={cropperClassName}
        cropWidth={cropDimensions.width}
        cropHeight={cropDimensions.height}
        onCrop={onCrop}
        onClose={onClose}
      />
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        onClick={() => {
          setIsOpen(true)
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
        }}
      >
        {props.children}
      </div>
    </>
  )
}
