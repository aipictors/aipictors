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

export function ThumbnailPositionAdjustDialog(props: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [translate, setTranslate] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isSquare, setIsSquare] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const onClose = () => setIsOpen(false)

  useEffect(() => {
    setTranslate({ x: 0, y: 0 })
    props.setThumbnailPosX(0)
    props.setThumbnailPosY(0)

    if (props.thumbnailBase64 !== "") {
      const img = new Image()
      img.src = props.thumbnailBase64
      img.onload = () => {
        setIsSquare(img.width === img.height)
      }
    }
  }, [props.thumbnailBase64])

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    if (isSquare) return

    const container = containerRef.current
    const image = imageRef.current
    if (!container || !image) return

    const containerRect = container.getBoundingClientRect()
    const imageRect = image.getBoundingClientRect()

    if (props.isThumbnailLandscape) {
      if (containerRect.right > imageRect.right) {
        setTranslate((prev) => ({
          ...prev,
          x: Math.min(0, prev.x + 0.1),
        }))
      }
    } else {
      if (containerRect.bottom > imageRect.bottom) {
        setTranslate((prev) => ({
          ...prev,
          y: Math.min(0, prev.y + 0.1),
        }))
      }
    }

    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSquare || !isDragging) return

    const { movementX, movementY } = e
    const container = containerRef.current
    const image = imageRef.current
    if (!container || !image) return

    const containerRect = container.getBoundingClientRect()
    const imageRect = image.getBoundingClientRect()

    if (props.isThumbnailLandscape) {
      if (containerRect.right < imageRect.right && movementX <= 0) {
        setTranslate((prev) => ({
          ...prev,
          x: Math.max(Math.min(0, prev.x + (movementX / 160) * 100)),
        }))
      }
      if (containerRect.left > imageRect.left && movementX >= 0) {
        setTranslate((prev) => ({
          ...prev,
          x: Math.max(Math.min(0, prev.x + (movementX / 160) * 100)),
        }))
      }
    } else {
      if (containerRect.bottom < imageRect.bottom && movementY <= 0) {
        setTranslate((prev) => ({
          ...prev,
          y: Math.max(Math.min(0, prev.y + (movementY / 160) * 100)),
        }))
      }
      if (containerRect.top > imageRect.top && movementY >= 0) {
        setTranslate((prev) => ({
          ...prev,
          y: Math.max(Math.min(0, prev.y + (movementY / 160) * 100)),
        }))
      }
    }
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
            }}
            className="absolute inset-0"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
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
