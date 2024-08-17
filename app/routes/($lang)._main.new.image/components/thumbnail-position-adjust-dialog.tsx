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

  const onClose = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    setTranslate({ x: 0, y: 0 })
    props.setThumbnailPosX(0)
    props.setThumbnailPosY(0)

    // 画像が正方形なら正方形フラグを立ててドラッグ移動できないようにする
    if (props.thumbnailBase64 !== "") {
      const img = new Image()
      img.src = props.thumbnailBase64
      img.onload = () => {
        if (img.width === img.height) {
          setIsSquare(true)
        } else {
          setIsSquare(false)
        }
      }
    }
  }, [props.thumbnailBase64])

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    if (isSquare) return

    // ドラッグ終了時に枠からはみ出てる場合は枠内に画像を合わせる
    const container = containerRef.current
    const image = imageRef.current

    if (!container || !image) return

    const containerRect = container.getBoundingClientRect()
    const imageRect = image.getBoundingClientRect()

    if (props.isThumbnailLandscape) {
      if (containerRect.right > imageRect.right) {
        setTranslate((prev) => {
          const adjustTranslation = (initialX: number) => {
            let result = initialX
            while (true) {
              result += 0.1
              const newX = result
              image.style.transform = `translateX(${newX}%)`
              const newImageRect = image.getBoundingClientRect()
              if (containerRect.right < newImageRect.right) {
                return newX
              }
            }
          }

          const newX = adjustTranslation(prev.x)
          return { ...prev, x: newX }
        })
      }
    } else {
      if (containerRect.bottom > imageRect.bottom) {
        setTranslate((prev) => {
          const adjustTranslation = (initialY: number) => {
            let result = initialY
            while (true) {
              result += 0.1
              const newY = result
              image.style.transform = `translateY(${newY}%)`
              const newImageRect = image.getBoundingClientRect()
              if (containerRect.bottom < newImageRect.bottom) {
                return newY
              }
            }
          }

          const newY = adjustTranslation(prev.y)
          return { ...prev, y: newY }
        })
      }
    }

    setIsDragging(false)
  }

  const handleMouseMove = (e: MouseEvent) => {
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

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const onSubmit = () => {
    props.setThumbnailPosX(translate.x)
    props.setThumbnailPosY(translate.y)
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        setIsOpen((prev: boolean) => (prev !== isOpen ? isOpen : prev))
      }}
    >
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="p-8">
        <DialogHeader>
          <DialogTitle>{"サムネイル調整"}</DialogTitle>
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
          >
            <img
              ref={imageRef}
              draggable={false}
              src={`${props.thumbnailBase64}`}
              alt="Thumbnail"
              className={`${
                props.isThumbnailLandscape
                  ? "absolute h-full"
                  : "absolute w-full"
              }`}
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
            variant={"secondary"}
            className="m-auto w-full"
            onClick={onClose}
          >
            {"キャンセル"}
          </Button>
          <Button
            disabled={props.thumbnailBase64 === ""}
            className="m-auto w-full"
            onClick={onSubmit} // Replace with your upload function
          >
            {"決定"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
