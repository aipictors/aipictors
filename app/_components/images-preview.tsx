import { Button } from "@/_components/ui/button"
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react"
import type React from "react"
import { useState, useEffect, useRef } from "react"

type Props = {
  imageURLs: string[]
  thumbnailUrl: string
  currentIndex: number
  setCurrentIndex: (index: number) => void
}

export const ImagesPreview = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const prevTranslate = useRef({ x: 0, y: 0 })
  const startCoord = useRef({ x: 0, y: 0 })

  const openPreview = () => {
    setIsOpen(true)
    setTranslate({ x: 0, y: 0 })
    setScale(1)
    props.setCurrentIndex(props.imageURLs.indexOf(props.thumbnailUrl))
  }

  const closePreview = () => setIsOpen(false)

  const handleKeyDown = (e: KeyboardEvent) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault()
    }
    if (e.key === "Escape") closePreview()
    if (e.key === "ArrowLeft") prevImage()
    if (e.key === "ArrowRight") nextImage()
    if (e.key === "ArrowUp") increaseScale()
    if (e.key === "ArrowDown") decreaseScale()
  }

  const nextImage = () => {
    if (props.currentIndex < props.imageURLs.length - 1) {
      props.setCurrentIndex(props.currentIndex + 1)
    }
  }

  const prevImage = () => {
    if (props.currentIndex > 0) {
      props.setCurrentIndex(props.currentIndex - 1)
    }
  }

  const increaseScale = () => {
    setScale((prevScale) => Math.min(prevScale * 1.1, 4))
  }

  const decreaseScale = () => {
    setScale((prevScale) => Math.max(prevScale * 0.9, 0.1))
  }

  const handleDoubleClick = () => {
    setScale((prevScale) => (prevScale === 1 ? 2 : 1))
    setTranslate({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale !== 1) {
      setIsDragging(true)
      startCoord.current = { x: e.clientX, y: e.clientY }
      prevTranslate.current = { ...translate }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imgRef.current) {
      const deltaX = e.clientX - startCoord.current.x
      const deltaY = e.clientY - startCoord.current.y
      setTranslate({
        x: prevTranslate.current.x + deltaX,
        y: prevTranslate.current.y + deltaY,
      })
    }
  }

  const handleTouchStart: React.TouchEventHandler<HTMLImageElement> = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      startCoord.current = { x: touch.clientX, y: touch.clientY }
      prevTranslate.current = { ...translate }
    }
  }

  const handleTouchMove: React.TouchEventHandler<HTMLImageElement> = (e) => {
    if (e.touches.length === 1 && scale !== 1) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - startCoord.current.x
      const deltaY = touch.clientY - startCoord.current.y
      setTranslate({
        x: prevTranslate.current.x + deltaX,
        y: prevTranslate.current.y + deltaY,
      })
    }
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    const scaleAmount = e.deltaY > 0 ? 0.9 : 1.1
    setScale((prevScale) => Math.min(Math.max(0.1, prevScale * scaleAmount), 4))
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [props.currentIndex])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("wheel", handleWheel, { passive: false })
    } else {
      document.removeEventListener("wheel", handleWheel)
    }
    return () => {
      document.removeEventListener("wheel", handleWheel)
    }
  }, [isOpen, scale])

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closePreview()
    }
  }

  return (
    <div>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <img
        className={
          "cursor m-auto h-full max-h-[64vh] w-auto rounded bg-card object-contain md:max-h-[72vh]"
        }
        draggable={false}
        alt="thumbnail"
        src={props.thumbnailUrl}
        onClick={openPreview}
        style={{ userSelect: "none" }}
      />

      {isOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={handleBackgroundClick}
        >
          <Button
            className="cursor absolute top-4 right-4 z-10"
            onClick={closePreview}
            size={"icon"}
          >
            <XIcon />
          </Button>
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <img
              ref={imgRef}
              src={props.imageURLs[props.currentIndex]}
              alt={`image-${props.currentIndex}`}
              className="cursor object-contain"
              style={{
                transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
                userSelect: "none",
              }}
              draggable={false}
              onDoubleClick={handleDoubleClick}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            />
            {props.currentIndex > 0 && (
              <Button
                className="-translate-y-1/2 absolute top-1/2 left-0 transform rounded-full text-3xl"
                size={"icon"}
                onClick={prevImage}
              >
                <ChevronLeft />
              </Button>
            )}
            {props.currentIndex < props.imageURLs.length - 1 && (
              <Button
                className="-translate-y-1/2 absolute top-1/2 right-0 transform rounded-full text-3xl"
                size={"icon"}
                onClick={nextImage}
              >
                <ChevronRight />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
