import { useRef, useEffect } from "react"

const MosaicCanvas = ({
  imageUrl,
  mosaicSize = 10,
  width,
  height,
  className,
  style,
  onChangeCanvasRef,
}: {
  imageUrl: string
  mosaicSize?: number
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
  onChangeCanvasRef?: (canvas: HTMLCanvasElement) => void
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (onChangeCanvasRef && canvasRef.current !== null) {
      onChangeCanvasRef(canvasRef.current)
    }
  }, [canvasRef])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    const image = new Image()
    image.crossOrigin = "anonymous" // CORSポリシーに対応するために必要

    image.onload = () => {
      if (!context) return
      canvas.width = !width ? image.width : width
      canvas.height = !height ? image.height : height
      context.drawImage(image, 0, 0)

      // モザイク処理を改善
      const imageData = context.getImageData(0, 0, image.width, image.height)
      for (let y = 0; y < image.height; y += mosaicSize) {
        for (let x = 0; x < image.width; x += mosaicSize) {
          const { totalR, totalG, totalB, count } = calculateAverageColor(
            x,
            y,
            mosaicSize,
            imageData,
            image.width,
          )

          const averageR = totalR / count
          const averageG = totalG / count
          const averageB = totalB / count

          // 平均色でモザイクブロックを塗りつぶす
          context.fillStyle = `rgb(${averageR}, ${averageG}, ${averageB})`
          context.fillRect(x, y, mosaicSize, mosaicSize)
        }
      }
    }

    const calculateAverageColor = (
      x: number,
      y: number,
      mosaicSize: number,
      imageData: ImageData,
      imageWidth: number,
    ) => {
      const total = { totalR: 0, totalG: 0, totalB: 0, count: 0 }
      for (let i = 0; i < mosaicSize; i++) {
        for (let j = 0; j < mosaicSize; j++) {
          if (x + j < imageWidth && y + i < image.height) {
            const index = ((y + i) * imageWidth + (x + j)) * 4
            total.totalR += imageData.data[index]
            total.totalG += imageData.data[index + 1]
            total.totalB += imageData.data[index + 2]
            total.count++
          }
        }
      }
      return total
    }

    image.src = imageUrl
  }, [imageUrl, mosaicSize]) // 依存配列を確認

  return <canvas className={className} ref={canvasRef} style={style} />
}

export default MosaicCanvas
