import { useRef, useEffect } from "react"

const MosaicCanvas = ({
  imageUrl,
  mosaicSize,
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

    const calculateAverageColor = (
      x: number,
      y: number,
      mosaicSize: number,
      imageData: ImageData,
      imageWidth: number,
      imageHeight: number,
    ) => {
      const total = { totalR: 0, totalG: 0, totalB: 0, count: 0 }
      for (let i = 0; i < mosaicSize; i++) {
        for (let j = 0; j < mosaicSize; j++) {
          if (x + j < imageWidth && y + i < imageHeight) {
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

    image.onload = () => {
      if (!context) return
      
      // アスペクト比を保持してcanvasサイズを設定
      if (width && height) {
        // 指定されたwidth, heightがある場合、アスペクト比を保持して調整
        const imageAspectRatio = image.width / image.height
        const canvasAspectRatio = width / height
        
        if (imageAspectRatio > canvasAspectRatio) {
          // 画像が横長の場合、widthを基準に調整
          canvas.width = width
          canvas.height = width / imageAspectRatio
        } else {
          // 画像が縦長の場合、heightを基準に調整
          canvas.width = height * imageAspectRatio
          canvas.height = height
        }
      } else {
        // width, heightが指定されていない場合は元画像サイズを使用
        canvas.width = image.width
        canvas.height = image.height
      }

      // 長辺の1/100をモザイクサイズとする
      const effectiveMosaicSize = Math.ceil(
        Math.max(canvas.width, canvas.height) / 100,
      )
      
      // 画像をcanvasサイズに合わせて描画
      context.drawImage(image, 0, 0, canvas.width, canvas.height)

      // モザイク処理を改善
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      for (let y = 0; y < canvas.height; y += effectiveMosaicSize) {
        for (let x = 0; x < canvas.width; x += effectiveMosaicSize) {
          const { totalR, totalG, totalB, count } = calculateAverageColor(
            x,
            y,
            effectiveMosaicSize,
            imageData,
            canvas.width,
            canvas.height,
          )

          const averageR = totalR / count
          const averageG = totalG / count
          const averageB = totalB / count

          // 平均色でモザイクブロックを塗りつぶす
          context.fillStyle = `rgb(${averageR}, ${averageG}, ${averageB})`
          context.fillRect(x, y, effectiveMosaicSize, effectiveMosaicSize)
        }
      }
    }

    image.src = imageUrl
  }, [imageUrl, mosaicSize, width, height]) // 依存配列を確認

  return <canvas className={className} ref={canvasRef} style={style} />
}

export default MosaicCanvas
