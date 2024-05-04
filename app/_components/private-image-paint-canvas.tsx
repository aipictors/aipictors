import PaintCanvas from "@/_components/paint-canvas"
import { config } from "@/config"
import { useEffect, useState } from "react"

type Props = {
  fileName: string
  token: string
  onChangeBrushImageBase64?(value: string): void
}

export const PrivateImagePaintCanvas = (props: Props) => {
  const [base64Image, setBase64Image] = useState<string>("")

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(
          `${config.wordpressEndpoint.privateImage}?token=${encodeURIComponent(
            props.token,
          )}&name=${props.fileName}`,
        )
        if (!response.ok) {
          throw new Error("Failed to fetch image")
        }
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = () => {
          const base64Data = reader.result
          // 取得したBase64データをセットする
          if (base64Data) {
            setBase64Image(base64Data as string)
          }
        }
        reader.readAsDataURL(blob)
      } catch (error) {
        console.error("Error fetching image:", error)
      }
    }

    fetchImage()
  }, [])

  return (
    <PaintCanvas
      imageUrl={base64Image}
      onChangeBrushImageBase64={props.onChangeBrushImageBase64}
    />
  )
}

export default PrivateImagePaintCanvas
