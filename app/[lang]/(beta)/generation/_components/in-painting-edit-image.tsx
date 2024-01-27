import { Slider } from "@/components/ui/slider"
import { fabric } from "fabric"
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react"
import { useState } from "react"

type Props = {
  imageUrl: string
}

export const InPaintingEditImage = (props: Props) => {
  const { editor, onReady } = useFabricJSEditor()
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null)

  const setupCanvas = (canvas: fabric.Canvas) => {
    fabric.Image.fromURL(props.imageUrl, (oImg) => {
      oImg.selectable = false
      canvas.add(oImg)
    })
    canvas.isDrawingMode = true
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
    canvas.freeDrawingBrush.color = "black"
    canvas.freeDrawingBrush.width = 10
    setFabricCanvas(canvas)
  }

  return (
    <div>
      <div className="flex">
        <p>{"ブラシサイズ："}</p>
        <Slider
          className="color-pink w-32"
          aria-label="slider-ex-2"
          min={1}
          max={100}
          step={0.1}
          onValueChange={(value) => {
            if (fabricCanvas != null) {
              fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(
                fabricCanvas,
              )
              fabricCanvas.freeDrawingBrush.color = "black"
              fabricCanvas.freeDrawingBrush.width = value[0] as number
            }
          }}
        />
      </div>
      <div className="flex justify-center">
        <div className="w-full h-auto">
          <FabricJSCanvas className="sample-canvas" onReady={setupCanvas} />
        </div>
      </div>
    </div>
  )
}
