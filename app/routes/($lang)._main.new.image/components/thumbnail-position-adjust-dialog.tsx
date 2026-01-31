import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { useEffect, useRef, useState } from "react"
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

export function ThumbnailPositionAdjustDialog (props: Props) {
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

    const containerRect = container.getBoundingClientRect()
    const imageRect = image.getBoundingClientRect()

    if (props.isThumbnailLandscape) {
      setTranslate((prev) => ({
        ...prev,
        x: calculateNewTranslate(
          prev.x,
          (deltaX / containerRect.width) * 100,
          containerRect,
          imageRect,
          "x",
        ),
      }))
    } else {
      setTranslate((prev) => ({
        ...prev,
        y: calculateNewTranslate(
          prev.y,
          (deltaY / containerRect.height) * 100,
          containerRect,
          imageRect,
          "y",
        ),
      }))
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isSquare) return
    setIsDragging(false)
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  const calculateNewTranslate = (
    prevTranslate: number,
    delta: number,
    containerRect: DOMRect,
    imageRect: DOMRect,
    axis: "x" | "y",
  ) => {
    let newTranslate = prevTranslate + delta

    if (axis === "x") {
      const maxTranslate = 0
      const minTranslate =
        -((imageRect.width - containerRect.width) / containerRect.width) * 100
      newTranslate = Math.max(
        Math.min(newTranslate, maxTranslate),
        minTranslate,
      )
    } else {
      const maxTranslate = 0
      const minTranslate =
        -((imageRect.height - containerRect.height) / containerRect.height) *
        100
      newTranslate = Math.max(
        Math.min(newTranslate, maxTranslate),
        minTranslate,
      )
    }

    return newTranslate
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
            onPointerLeave={handlePointerUp}
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
