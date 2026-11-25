import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { cn } from "~/lib/utils"

type Props = {
  thumbnailBase64: string
  isThumbnailLandscape: boolean
  children: React.ReactNode
  thumbnailPosX: number
  thumbnailPosY: number
  setThumbnailPosX(value: number): void
  setThumbnailPosY(value: number): void
}

/** 画像の大きさに対する % の位置を、枠からはみ出さない範囲に収める */
const clampTranslate = (
  value: number,
  imageSize: number,
  frameSize: number,
) => {
  if (imageSize <= 0 || imageSize <= frameSize) return 0
  const min = -((imageSize - frameSize) / imageSize) * 100
  return Math.min(0, Math.max(min, value))
}

export function ThumbnailPositionAdjustDialog(props: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [translate, setTranslate] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isSquare, setIsSquare] = useState<boolean>(false)
  const lastPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const onClose = () => setIsOpen(false)

  useEffect(() => {
    if (props.thumbnailBase64 !== "") {
      const img = new Image()
      img.src = props.thumbnailBase64
      img.onload = () => {
        const aspectRatio = img.width / img.height
        setIsSquare(img.width === img.height)
        let translateX = 0
        let translateY = 0
        if (aspectRatio > 1) {
          // 横長の画像の場合、画像を中央に配置するためのtranslateXを計算
          translateX = -((aspectRatio - 1) / (2 * aspectRatio)) * 100
        } else if (aspectRatio < 1) {
          // 縦長の画像の場合、必要に応じてtranslateYを計算
          translateY = -((1 - aspectRatio) * 50)
        }
        setTranslate({ x: translateX, y: translateY })
        props.setThumbnailPosX(translateX)
        props.setThumbnailPosY(translateY)
      }
    } else {
      setTranslate({ x: 0, y: 0 })
      props.setThumbnailPosX(0)
      props.setThumbnailPosY(0)
    }
  }, [props.thumbnailBase64])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSquare) return
    setIsDragging(true)
    lastPositionRef.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isSquare || !isDragging) return

    const deltaX = e.clientX - lastPositionRef.current.x
    const deltaY = e.clientY - lastPositionRef.current.y

    lastPositionRef.current = { x: e.clientX, y: e.clientY }

    const container = containerRef.current
    const image = imageRef.current
    if (!container || !image) return

    // translate の % は画像自身の大きさに対する割合。枠（境界線を除いた内側）からはみ出さないように止める
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const imageWidth = image.offsetWidth
    const imageHeight = image.offsetHeight

    if (props.isThumbnailLandscape) {
      setTranslate((prev) => ({
        ...prev,
        x: clampTranslate(
          prev.x + (deltaX / imageWidth) * 100,
          imageWidth,
          containerWidth,
        ),
      }))
    } else {
      setTranslate((prev) => ({
        ...prev,
        y: clampTranslate(
          prev.y + (deltaY / imageHeight) * 100,
          imageHeight,
          containerHeight,
        ),
      }))
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isSquare) return
    setIsDragging(false)
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  const onSubmit = () => {
    props.setThumbnailPosX(translate.x)
    props.setThumbnailPosY(translate.y)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="p-8">
        <DialogHeader>
          <DialogTitle>サムネイル調整</DialogTitle>
        </DialogHeader>
        <div
          ref={containerRef}
          className="relative m-auto h-[160px] w-[160px] overflow-hidden border-4 border-clear-bright-blue"
        >
          <div
            style={{
              cursor: props.isThumbnailLandscape ? "ew-resize" : "ns-resize",
              touchAction: "none",
            }}
            className="absolute inset-0"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img
              ref={imageRef}
              draggable={false}
              src={props.thumbnailBase64}
              alt="Thumbnail"
              className={cn("absolute", {
                "h-full": props.isThumbnailLandscape,
                "w-full": !props.isThumbnailLandscape,
              })}
              style={{
                transform: `translate(${translate.x}%, ${translate.y}%)`,
                maxWidth: "initial",
                maxHeight: "initial",
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            className="m-auto w-full"
            onClick={onClose}
          >
            キャンセル
          </Button>
          <Button
            disabled={props.thumbnailBase64 === ""}
            className="m-auto w-full"
            onClick={onSubmit}
          >
            決定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
