import { usePainter } from "@/app/[lang]/generation/_hooks/use-painter"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import type Konva from "konva"
import { useEffect, useRef, useState } from "react"
import { Image as KonvaImage, Layer, Line, Stage } from "react-konva"
import useImage from "use-image"

export type PainterMode = {
  reverseDraw: "reverse-draw"
}

type Props = {
  imageUrl: string
  status: string
  onChange(value: string): void
  isLoading: boolean
  onLoaded(): void
}

export type LineObject = {
  tool: string
  points: number[]
  brushSize: number
}

export type DrawingCanvasProps = {
  imageUrl: string
  lines: LineObject[]
  onLineAdd: (line: LineObject) => void
  brushSize: number
}

export const InpaintCanvas = (props: Props) => {
  const stageRef = useRef<Konva.Stage>(null)

  const [image] = useImage(props.imageUrl)
  const {
    lines,
    tool,
    undo,
    setLines,
    brushSize,
    setBrushSize,
    handleStart,
    handleMove,
    handleEnd,
    isDrawing,
    setTool,
  } = usePainter()

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    if (image) {
      props.onLoaded()
      setImageSize({ width: image.width, height: image.height })
    }
  }, [image])

  /**
   * base64画像の色を反転させて、透明部分は黒色にする
   * @param base64Image
   * @returns
   */
  const invertImageColors = (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // ブラウザ環境でのみ実行
      if (typeof window === "undefined") {
        reject("この関数はブラウザでのみ使用可能です")
        return
      }

      // 新しいImageオブジェクトを作成し、Base64画像を読み込む
      const img = new Image()
      img.src = base64Image

      // 画像の読み込みが完了したら処理を行う
      img.onload = () => {
        // 新しいCanvas要素を作成
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject("Canvasコンテキストの取得に失敗しました")
          return
        }

        // Canvasのサイズを画像と同じに設定
        canvas.width = img.width
        canvas.height = img.height

        // 画像をCanvasに描画
        ctx.drawImage(img, 0, 0)

        // 画像データを取得
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // 色を反転させる
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) {
            // 透明なピクセルの場合は黒に設定
            data[i] = 0 // Red
            data[i + 1] = 0 // Green
            data[i + 2] = 0 // Blue
            data[i + 3] = 255 // Blue
          } else {
            // 非透明なピクセルの場合は色を反転
            data[i] = 255 - data[i] // Red
            data[i + 1] = 255 - data[i + 1] // Green
            data[i + 2] = 255 - data[i + 2] // Blue
          }
          // アルファ値は変更しない
        }
        // Canvasに反転した画像データを描画
        ctx.putImageData(imageData, 0, 0)

        // CanvasからBase64画像を取得
        const invertedBase64 = canvas.toDataURL()

        // 反転したBase64画像を返す
        resolve(invertedBase64)
      }

      img.onerror = () => {
        reject("画像の読み込みに失敗しました")
      }
    })
  }

  /**
   * base64画像を二値化して、透明部分は黒色にする
   * @param base64Image
   * @returns
   */
  const binarizeImage = (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // ブラウザ環境でのみ実行
      if (typeof window === "undefined") {
        reject("この関数はブラウザでのみ使用可能です")
        return
      }

      // 新しいImageオブジェクトを作成し、Base64画像を読み込む
      const img = new Image()
      img.src = base64Image

      // 画像の読み込みが完了したら処理を行う
      img.onload = () => {
        // 新しいCanvas要素を作成
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject("Canvasコンテキストの取得に失敗しました")
          return
        }

        // Canvasのサイズを画像と同じに設定
        canvas.width = img.width
        canvas.height = img.height

        // 画像をCanvasに描画
        ctx.drawImage(img, 0, 0)

        // 画像データを取得
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // 二値化と透明度の除去処理
        for (let i = 0; i < data.length; i += 4) {
          const brightness =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          const threshold = 128 // 閾値
          const color = brightness < threshold ? 0 : 255
          data[i] = data[i + 1] = data[i + 2] = color
          data[i + 3] = 255 // アルファ値を255に設定して不透明に
        }
        // Canvasに二値化した画像データを描画
        ctx.putImageData(imageData, 0, 0)

        // CanvasからBase64画像を取得
        const binarizedBase64 = canvas.toDataURL()

        // 二値化したBase64画像を返す
        resolve(binarizedBase64)
      }

      img.onerror = () => {
        reject("画像の読み込みに失敗しました")
      }
    })
  }

  useEffect(() => {
    if (stageRef?.current && lines.length > 0) {
      const dataURL = stageRef.current.toDataURL()
      invertImageColors(dataURL).then((invertedBase64: string) => {
        binarizeImage(invertedBase64).then((invertedBase64: string) => {
          props.onChange(invertedBase64)
        })
      })
    }
  }, [lines])

  return (
    <>
      <div className="mb-4 flex">
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
      <div className="mb-4 flex">
        <Select onValueChange={(value) => setTool(value)} value={tool}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select a tool" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="pen">ペン</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          className="mr-2 ml-2"
          size={"sm"}
          variant={"secondary"}
          onClick={undo}
        >
          元に戻す
        </Button>
      </div>
      <div className="flex justify-center">
        <div className="relative h-[800px] max-h-64 w-full max-w-[280px] overflow-auto md:max-w-[80vw]">
          {props.isLoading && (
            <Skeleton className="h-[120px] w-[240px] rounded-xl" />
          )}

          <Stage
            className="absolute"
            width={imageSize.width}
            height={imageSize.height}
          >
            <Layer>
              <KonvaImage image={image} />
            </Layer>
          </Stage>
          <Stage
            ref={stageRef}
            className="absolute"
            width={imageSize.width}
            height={imageSize.height}
            onMouseDown={handleStart}
            onMousemove={handleMove}
            onMouseup={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  key={i}
                  points={line.points}
                  stroke={"black"}
                  tension={0.5}
                  lineCap="round"
                  strokeWidth={line.brushSize}
                  globalCompositeOperation={
                    line.tool === "eraser" ? "destination-out" : "source-over"
                  }
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </>
  )
}
