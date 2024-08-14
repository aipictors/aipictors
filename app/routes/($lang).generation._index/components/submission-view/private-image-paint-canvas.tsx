import { useEffect, useState } from "react"
import { PaintCanvas } from "~/components/paint-canvas"

type Props = {
  fileName: string
  token: string
  onChangeBrushImageBase64?(value: string): void
  setIsDrawing?(value: boolean): void
}

export function PrivateImagePaintCanvas(props: Props) {
  const [base64Image, setBase64Image] = useState<string>("")

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(props.fileName)
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Data = reader.result
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
  }, [props.fileName])

  return (
    <PaintCanvas
      imageUrl={base64Image}
      onChangeBrushImageBase64={props.onChangeBrushImageBase64}
      onChangeSetDrawing={props.setIsDrawing}
    />
  )
}

export default PrivateImagePaintCanvas
