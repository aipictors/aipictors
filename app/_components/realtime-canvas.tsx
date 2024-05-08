import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import { Button } from "@/_components/ui/button"
import { useEffect, useRef, useState } from "react"

interface IProps {
  width: number // キャンバスの横幅
  height: number // キャンバスの縦幅
  imageBase64: string // 画像のbase64エンコードされたデータURL
  isDrawing: boolean // 描画中かどうか
  isGenerating: boolean // 生成中かどうか
  updatedPaintCanvasBase64?: (base64: string) => void // 描画中のキャンバスのbase64エンコードされたデータURLを更新する関数
}

const RealTimeCanvas: React.FC<IProps> = ({
  width,
  height,
  imageBase64,
  isDrawing,
  isGenerating,
  updatedPaintCanvasBase64,
}) => {
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [time, setTime] = useState(0)
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isGenerating && !timerId) {
      const newTimerId = setInterval(() => {
        setTime((prevTime) => prevTime + 0.001)
      }, 1)
      if (newTimerId) {
        setTimerId(newTimerId as NodeJS.Timeout)
      }
    } else if (!isGenerating && timerId) {
      clearInterval(timerId)
      setTimerId(null)
      setTime(0)
    }
  }, [isGenerating, timerId])

  useEffect(() => {
    const imageCanvas = imageCanvasRef.current
    if (imageCanvas) {
      const ctx = imageCanvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, width, height)
        const image = new Image()
        image.crossOrigin = "Anonymous"
        image.src = `data:image/png;base64,${imageBase64}`
        image.onload = () => {
          ctx.drawImage(image, 0, 0, width, height)
        }
      }
    }
  }, [imageBase64, width, height])

  return (
    <div className="relative flex h-full items-center justify-center">
      {isDrawing && !isGenerating && (
        <div className="absolute top-4 m-auto w-40 items-center justify-center rounded-md bg-black bg-opacity-50 p-1">
          <div className="text-center text-white">描画中...</div>
        </div>
      )}
      {isGenerating && (
        <div className="absolute top-4 m-auto w-40 items-center justify-center rounded-md bg-black bg-opacity-50 p-1">
          <div className="text-center text-white">
            生成中...({time.toFixed(4)}秒)
          </div>
        </div>
      )}
      <canvas
        className="border"
        ref={imageCanvasRef}
        width={width}
        height={height}
      />

      <AppConfirmDialog
        title={"確認"}
        description={"現在のキャンバスを上書きしますか？"}
        onNext={() => {
          if (updatedPaintCanvasBase64) {
            updatedPaintCanvasBase64(imageBase64)
          }
        }}
        onCancel={() => {}}
      >
        <Button onClick={() => {}} className="absolute bottom-2 left-2">
          ベース画像にする
        </Button>
      </AppConfirmDialog>
    </div>
  )
}

export default RealTimeCanvas
