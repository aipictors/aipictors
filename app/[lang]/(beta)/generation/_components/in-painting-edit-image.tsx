import { Slider } from "@/components/ui/slider"
// import { KonvaEventObject } from "konva/lib/Node"
// import { useState } from "react"
// import { Layer, tage } from "react-konva"
// import useImage from "use-image"

type Props = {
  imageUrl: string
}

export const InPaintingEditImage = ({ imageUrl }: Props) => {
  // const [image] = useImage(imageUrl)
  // const [lines, setLines] = useState<LineObject[]>([])
  // const [brushSize, setBrushSize] = useState(10)

  // const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
  //   if (!e || !e.target) return
  //   const stage = e.target.getStage()
  //   if (!stage) return
  //   const pos = e.target.getStage()?.getPointerPosition()
  //   if (pos) {
  //     setLines([...lines, { tool: "pen", points: [pos.x, pos.y] }])
  //   }
  // }

  // const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
  //   if (!lines.length) return
  //   const stage = e.target.getStage()
  //   const point = stage?.getPointerPosition()
  //   const lastLine = lines[lines.length - 1]
  //   if (point) {
  //     lastLine.points = lastLine.points.concat([point.x, point.y])
  //   }
  //   lines.splice(lines.length - 1, 1, lastLine)
  //   setLines(lines.concat())
  // }

  // const handleMouseUp = () => {
  //   // 線の描画終了
  // }

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
          value={[10]}
        />
      </div>
      <div className="flex justify-center">
        <div className="w-full max-h-64 max-w-96 overflow-auto h-auto m-auto"></div>
      </div>
    </div>
  )
}
