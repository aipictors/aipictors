"use client"

import { Slider } from "@/components/ui/slider"
import { KonvaEventObject } from "konva/lib/Node"
import { useEffect, useState } from "react"
import { Image, Layer, Line, Stage } from "react-konva"
import useImage from "use-image"

type Props = {
  imageUrl: string
}

type LineObject = {
  tool: string
  points: number[]
  brushSize: number
}

/**
 * Konvaを使った画像編集コンポーネント
 * Dynamic-Importで呼び出すのでexport-defaultにしている
 * @param props
 * @returns
 */
export default function InPaintingEditImage(props: Props) {
  const [image] = useImage(props.imageUrl)
  const [lines, setLines] = useState<LineObject[]>([])
  const [brushSize, setBrushSize] = useState(10)
  const [isDrawing, setIsDrawing] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (image) {
      setImageSize({ width: image.width, height: image.height })
    }
  }, [image])

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    setIsDrawing(true)
    const pos = e.target.getStage()?.getPointerPosition()
    if (pos) {
      setLines([...lines, { tool: "pen", points: [pos.x, pos.y], brushSize }])
    }
  }

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return
    const point = e.target.getStage()?.getPointerPosition()
    if (point) {
      const lastLine = lines[lines.length - 1]
      lastLine.points = lastLine.points.concat([point.x, point.y])
      lines.splice(lines.length - 1, 1, lastLine)
      setLines(lines.concat())
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleStart = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    setIsDrawing(true)
    const pos = e.target.getStage()?.getPointerPosition()
    if (pos) {
      setLines([...lines, { tool: "pen", points: [pos.x, pos.y], brushSize }])
    }
  }

  const handleMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing) return
    const point = e.target.getStage()?.getPointerPosition()
    if (point) {
      const lastLine = lines[lines.length - 1]
      lastLine.points = lastLine.points.concat([point.x, point.y])
      lines.splice(lines.length - 1, 1, lastLine)
      setLines(lines.concat())
    }
  }

  const handleEnd = () => {
    setIsDrawing(false)
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
          value={[brushSize]}
          onValueChange={(value) => setBrushSize(value[0])}
        />
      </div>
      <div className="flex justify-center">
        <div className="w-full max-h-64 max-w-96 overflow-auto h-auto m-auto">
          <Stage
            width={typeof window !== "undefined" ? window.innerWidth : 0}
            height={typeof window !== "undefined" ? window.innerHeight : 0}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          >
            <Layer>
              <Image image={image} />
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke="black"
                  strokeWidth={brushSize}
                  tension={0.5}
                  lineCap="round"
                  globalCompositeOperation={
                    line.tool === "eraser" ? "destination-out" : "source-over"
                  }
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  )
}
