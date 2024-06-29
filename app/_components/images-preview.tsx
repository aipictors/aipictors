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
  const lastTap = useRef(0)

  const initialTouchRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const pinchDistanceRef = useRef<number>(0)

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

  const handleDoubleTap = (e: React.TouchEvent<HTMLImageElement>) => {
    const currentTime = new Date().getTime()
    const tapLength = currentTime - lastTap.current
    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault()
      handleDoubleClick()
    }
    lastTap.current = currentTime
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
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      initialTouchRef.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      }
      pinchDistanceRef.current = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY,
      )
    } else if (e.touches.length === 1 && scale !== 1) {
      // Your existing single touch move logic here
    }
  }

  const handleTouchMove: React.TouchEventHandler<HTMLImageElement> = (e) => {
    if (e.touches.length === 2 && scale !== 1) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const currentPinchDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY,
      )
      const scaleAmount = currentPinchDistance / pinchDistanceRef.current
      setScale((prevScale) =>
        Math.min(Math.max(0.1, prevScale * scaleAmount), 4),
      )

      // Calculate translation based on the center of the pinch gesture
      const currentTouch = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      }
      const deltaX = currentTouch.x - initialTouchRef.current.x
      const deltaY = currentTouch.y - initialTouchRef.current.y
      setTranslate({
        x: prevTranslate.current.x + deltaX,
        y: prevTranslate.current.y + deltaY,
      })

      pinchDistanceRef.current = currentPinchDistance
    } else if (e.touches.length === 1 && scale !== 1) {
      // Your existing single touch move logic here
    }
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    const scaleAmount = e.deltaY > 0 ? 0.9 : 1.1
    setScale((prevScale) => Math.min(Math.max(0.1, prevScale * scaleAmount), 4))
  }

  const adjustImageSize = () => {
    if (imgRef.current) {
      const img = imgRef.current
      const aspectRatio = img.naturalWidth / img.naturalHeight
      const screenAspectRatio = window.innerWidth / window.innerHeight

      if (aspectRatio > screenAspectRatio) {
        img.style.width = "100vw"
        img.style.height = "auto"
      } else {
        img.style.width = "auto"
        img.style.height = "100vh"
      }
    }
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

  useEffect(() => {
    if (isOpen && imgRef.current) {
      adjustImageSize()
    }
  }, [isOpen, props.currentIndex])

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closePreview()
    }
  }

  const displayedImage = props.imageURLs[props.currentIndex]

  return (
    <div>
      {/* Display thumbnail */}
      <div className="m-auto flex h-full max-h-[64vh] w-auto cursor-pointer justify-center overflow-x-auto rounded bg-card object-contain">
        <div className="inline-block overflow-hidden text-center">
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <img
            className="m-auto h-full max-h-[64vh] w-auto cursor-pointer rounded bg-card object-contain"
            draggable={false}
            alt="thumbnail"
            src={props.thumbnailUrl}
            onClick={openPreview}
            style={{ userSelect: "none" }}
          />
          {props.imageURLs.map((url, index) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
            <img
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className="m-auto h-full max-h-[64vh] w-auto cursor-pointer rounded bg-card object-contain md:max-h-[72vh]"
              draggable={false}
              alt={`thumbnail-${index}`}
              src={url}
              onClick={openPreview}
              style={{ userSelect: "none" }}
            />
          ))}
        </div>
      </div>
      {/* Display full-screen preview */}
      {isOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80"
          onClick={handleBackgroundClick}
        >
          <Button
            className="cursor absolute top-4 right-4 z-10"
            onClick={closePreview}
            size={"icon"}
          >
            <XIcon />
          </Button>
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
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDoubleTap}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          />
          <div className="absolute bottom-4 flex w-full justify-center">
            <Button
              className="mr-4 transform rounded-full"
              size={"icon"}
              onClick={prevImage}
              disabled={!(props.currentIndex > 0)}
            >
              <ChevronLeft />
            </Button>
            <Button
              className="ml-4 transform rounded-full"
              size={"icon"}
              onClick={nextImage}
              disabled={!(props.currentIndex < props.imageURLs.length - 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
