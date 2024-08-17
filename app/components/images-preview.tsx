import { Button } from "~/components/ui/button"
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react"
import type React from "react"
import { useState, useEffect, useRef } from "react"

type Props = {
  imageURLs: string[]
  thumbnailUrl: string
  currentIndex: number
  setCurrentIndex: (index: number) => void
}

export function ImagesPreview(props: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const startCoord = useRef({ x: 0, y: 0 })
  const prevTranslate = useRef({ x: 0, y: 0 })
  const lastTap = useRef(0)

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
    } else {
      // Loop back to the first image
      props.setCurrentIndex(0)
    }
  }

  const prevImage = () => {
    if (props.currentIndex > 0) {
      props.setCurrentIndex(props.currentIndex - 1)
    } else {
      // Loop back to the last image
      props.setCurrentIndex(props.imageURLs.length - 1)
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

    // ダブルタップの間隔を少し広げ、誤検知を防ぐ
    if (tapLength < 300 && tapLength > 50) {
      e.preventDefault()
      handleDoubleClick()
    }

    // 最後のタップ時間を更新
    lastTap.current = currentTime
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale !== 1) {
      setIsDragging(true)
      startCoord.current = { x: e.clientX, y: e.clientY }
      prevTranslate.current = { ...translate }
    } else {
      startCoord.current = { x: e.clientX, y: e.clientY }
      prevTranslate.current = { ...translate }
    }
  }

  const handleMouseUp: React.MouseEventHandler<HTMLImageElement> = (e) => {
    if (isDragging) {
      setIsDragging(false)
    } else {
      const deltaX = e.clientX - startCoord.current.x
      const swipeDistance = Math.abs(deltaX)

      if (swipeDistance > 50) {
        // Adjust threshold as needed
        if (deltaX < 0) {
          nextImage()
        } else {
          prevImage()
        }
      } else {
        openPreview()
      }

      // Reset translation
      setTranslate({ x: 0, y: 0 })
    }
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
    if (scale !== 1) {
      setIsDragging(true) // ドラッグ開始
    }
    startCoord.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    prevTranslate.current = { ...translate }
  }

  const handleTouchMove: React.TouchEventHandler<HTMLImageElement> = (e) => {
    e.preventDefault() // タッチスクロールのデフォルト動作を無効化

    if (isDragging) {
      const deltaX = e.touches[0].clientX - startCoord.current.x
      const deltaY = e.touches[0].clientY - startCoord.current.y
      setTranslate({
        x: prevTranslate.current.x + deltaX,
        y: prevTranslate.current.y + deltaY,
      })
    }
  }

  const handleTouchEnd: React.TouchEventHandler<HTMLImageElement> = (e) => {
    if (isDragging && e.changedTouches.length === 1 && scale === 1) {
      setIsDragging(false) // ドラッグ終了
      const deltaX = e.changedTouches[0].clientX - startCoord.current.x
      const swipeDistance = Math.abs(deltaX)

      if (swipeDistance > 50) {
        if (deltaX < 0) {
          nextImage()
        } else {
          prevImage()
        }
      }

      setTranslate({ x: 0, y: 0 })
    } else {
      if (!isDragging) {
        const deltaX = e.changedTouches[0].clientX - startCoord.current.x
        const swipeDistance = Math.abs(deltaX)

        if (swipeDistance > 50) {
          if (deltaX < 0) {
            nextImage()
          } else {
            prevImage()
          }
        }
      }
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

  const handleMainTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const deltaX = e.changedTouches[0].clientX - startCoord.current.x
    const deltaY = e.changedTouches[0].clientY - startCoord.current.y
    const swipeDistance = Math.abs(deltaX)

    if (swipeDistance > 50) {
      // Adjust threshold as needed
      if (deltaX < 0) {
        nextImage()
      } else {
        prevImage()
      }
    }

    // Reset translation
    setTranslate({ x: 0, y: 0 })
  }

  const handleMainMouseDown = (e: React.MouseEvent) => {
    startCoord.current = { x: e.clientX, y: e.clientY }
    prevTranslate.current = { ...translate }
  }

  const handleMainMouseUp: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const deltaX = e.clientX - startCoord.current.x
    const swipeDistance = Math.abs(deltaX)

    if (swipeDistance > 50) {
      // Adjust threshold as needed
      if (deltaX < 0) {
        nextImage()
      } else {
        prevImage()
      }
    } else {
      openPreview()
    }

    // Reset translation
    setTranslate({ x: 0, y: 0 })
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative">
        <div className="m-auto flex h-full max-h-[64vh] w-auto cursor-pointer justify-center overflow-x-auto rounded bg-card bg-zinc-100 object-contain dark:bg-zinc-900 ">
          <div className="inline-block overflow-hidden text-center">
            <img
              className="m-auto h-full max-h-[64vh] w-auto cursor-pointer bg-zinc-100 object-contain dark:bg-zinc-900"
              draggable={false}
              key={props.thumbnailUrl}
              alt="thumbnail"
              src={props.thumbnailUrl}
              // onClick={openPreview}
              onMouseUp={handleMainMouseUp}
              onMouseDown={handleMainMouseDown}
              onTouchEnd={handleMainTouchEnd}
              style={{ userSelect: "none" }}
            />
            {props.imageURLs.map((url, index) => (
              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
              <img
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                className="m-auto h-full max-h-[64vh] w-auto cursor-pointer bg-zinc-100 object-contain md:max-h-[72vh] dark:bg-zinc-900"
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
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchEndCapture={handleDoubleTap}
            />
            {props.imageURLs.length > 1 && (
              <>
                <div className="absolute bottom-4 flex w-full items-center justify-center">
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
                    disabled={
                      !(props.currentIndex < props.imageURLs.length - 1)
                    }
                  >
                    <ChevronRight />
                  </Button>
                </div>
                {/* ページ */}
                <div className="absolute right-6 bottom-6 text-right text-sm text-white">
                  {props.currentIndex + 1}/{props.imageURLs.length}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
