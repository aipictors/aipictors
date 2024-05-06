import type React from "react"
import { useEffect, useRef } from "react"
import {} from "lucide-react"
import {} from "@/_components/ui/dropdown-menu"

interface IProps {
  width: number // キャンバスの横幅
  height: number // キャンバスの立幅
  imageBase64: string // 画像のURL
  isDrawing: boolean // 描画中かどうか
  isGenerating: boolean // 生成中かどうか
}

// Canvas 描画状態を保存するためのインターフェース
interface CanvasState {
  dataUrl: string // Canvas のデータ URL
  width: number // Canvas の幅
  height: number // Canvas の高さ
}

/**
 * リアルタイム生成の結果を投影するキャンバスを提供する
 */
const RealTimeCanvas: React.FC<IProps> = ({
  width,
  height,
  imageBase64,
  isDrawing,
  isGenerating,
}) => {
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    // キャンバスに描画する
    const imageCanvas = imageCanvasRef.current
    if (imageCanvas) {
      const ctx = imageCanvas.getContext("2d")
      if (ctx) {
        const image = new Image()
        image.onload = () => {
          ctx.drawImage(image, 0, 0, width, height)
        }
        image.src = imageBase64
      }
    }
  }, [imageBase64])

  return (
    <>
      <div className="relative flex h-full items-center justify-center">
        {isDrawing && (
          <div className="absolute top-4 m-auto w-32 items-center justify-center rounded-md bg-black bg-opacity-50 p-1">
            <div className="text-center text-white">{"描画中..."}</div>
          </div>
        )}
        <canvas
          className="border"
          ref={imageCanvasRef}
          width={width}
          height={height}
        />
      </div>
    </>
  )
}

export default RealTimeCanvas
