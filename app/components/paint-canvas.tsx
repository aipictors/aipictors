import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  BrushIcon,
  EraserIcon,
  CookingPotIcon,
  SlidersHorizontalIcon,
  LassoIcon,
  RotateCwIcon,
  RotateCcwIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Slider } from "~/components/ui/slider"
import { cn } from "~/lib/utils"
import MosaicCanvas from "~/components/mosaic-canvas"

type Props = {
  width?: number // キャンバスの横幅
  height?: number // キャンバスの縦幅
  imageUrl?: string // 画像のURL
  isMosaicMode?: boolean
  isColorPicker?: boolean
  isBackground?: boolean
  isBackgroundColorPicker?: boolean
  isShowSubmitButton?: boolean
  isPadding?: boolean
  imageBase64?: string
  backImageBase64?: string
  onChangeBrushImageBase64?(value: string): void
  onChangeSetDrawing?(value: boolean): void // 描画中かどうかの状態を変更
  onChangeCompositionCanvasBase64?(value: string): void // 合成画像のbase64を変更する関数
  onSubmit?(value: string): void
  onClose?(): void
  setBackImageBase64?(value: string): void
  extension?: string // 保存する拡張子
}

interface CanvasState {
  dataUrl: string
  width: number
  height: number
}

export function PaintCanvas(props: Props) {
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const brushCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const assistedCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const [tool, setTool] = useState(props.isMosaicMode ? "eraser" : "brush")
  const [color, setColor] = useState("#000000") // ブラシの初期色
  const [brushSize, setBrushSize] = useState<number>(20)

  // 拡大縮小関連
  const [scale, setScale] = useState<number>(1)
  const [translateX, setTranslateX] = useState<number>(0)
  const [translateY, setTranslateY] = useState<number>(0)

  const [points, setPoints] = useState<{ x: number; y: number }[]>([])
  const [canvasWidth, setCanvasWidth] = useState<number>(props.width || 240)
  const [canvasHeight, setCanvasHeight] = useState<number>(props.height || 360)
  const [backgroundColor, setBackgroundColor] = useState("#fff")
  const [mosaicCanvasRef, setMosaicCanvasRef] =
    useState<HTMLCanvasElement | null>(null)

  const [canvasStates, setCanvasStates] = useState<CanvasState[]>([])
  const [stateIndex, setStateIndex] = useState<number>(0)

  const isTouchDevice =
    typeof window !== "undefined" && "ontouchstart" in window

  // ピンチズーム用
  const [isPinching, setIsPinching] = useState(false)
  const [initialPinchDistance, setInitialPinchDistance] = useState<
    number | null
  >(null)
  const [initialScale, setInitialScale] = useState<number>(1)
  const [initialMidX, setInitialMidX] = useState(0)
  const [initialMidY, setInitialMidY] = useState(0)

  const onChangeMosaicCanvasRef = (canvas: HTMLCanvasElement) => {
    setMosaicCanvasRef(canvas)
  }

  const saveCanvasState = (canvas: HTMLCanvasElement) => {
    const waitForImageLoad = new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve()
      }
      img.onerror = (error) => {
        reject(error)
      }
      img.src = canvas.toDataURL()
    })

    waitForImageLoad
      .then(() => {
        const dataUrl = canvas.toDataURL()
        const newState: CanvasState = {
          dataUrl,
          width: canvas.width,
          height: canvas.height,
        }
        if (canvasStates.length > 0) {
          setCanvasStates((prevStates) => [
            ...prevStates.slice(0, stateIndex + 1),
            newState,
          ])
        } else {
          canvasStates.push(newState)
        }
        setStateIndex((prevIndex) => prevIndex + 1)
      })
      .catch((error) => {
        console.error("Failed to load image:", error)
      })
  }

  const restoreCanvasState = (
    canvas: HTMLCanvasElement,
    state: CanvasState,
  ) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.globalCompositeOperation = "copy"
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = state.dataUrl
  }

  const handleUndo = () => {
    if (stateIndex > 0) {
      const newIndex = stateIndex - 1
      setStateIndex(newIndex)
      const ref = props.isMosaicMode ? imageCanvasRef : brushCanvasRef
      if (ref.current) {
        restoreCanvasState(ref.current, canvasStates[newIndex])
      }
    }
  }

  const handleRedo = () => {
    if (stateIndex < canvasStates.length - 1) {
      const newIndex = stateIndex + 1
      setStateIndex(newIndex)
      const ref = props.isMosaicMode ? imageCanvasRef : brushCanvasRef
      if (ref.current) {
        restoreCanvasState(ref.current, canvasStates[newIndex])
      }
    }
  }

  useEffect(() => {
    if (props.imageBase64) {
      const imageCanvas = imageCanvasRef.current
      if (!imageCanvas) return
      const ctx = imageCanvas.getContext("2d")
      if (!ctx) return
      const image = new Image()
      image.crossOrigin = "Anonymous"
      image.src = props.imageBase64
      image.onload = () => {
        imageCanvas.width = image.width
        imageCanvas.height = image.height
        ctx.drawImage(image, 0, 0, image.width, image.height)
        saveCanvasState(imageCanvas)
      }
    }
  }, [props.imageBase64])

  useEffect(() => {
    if (props.backImageBase64) {
      const brushCanvas = brushCanvasRef.current
      if (!brushCanvas) return
      const ctx = brushCanvas.getContext("2d")
      if (!ctx) return
      const image = new Image()
      image.crossOrigin = "Anonymous"
      image.src = `data:image/png;base64,${props.backImageBase64}`
      image.onload = () => {
        brushCanvas.width = image.width
        brushCanvas.height = image.height
        ctx.drawImage(image, 0, 0, image.width, image.height)
        saveCanvasState(brushCanvas)
      }
      if (props.setBackImageBase64) {
        props.setBackImageBase64("")
      }
    }
  }, [props.backImageBase64])

  useEffect(() => {
    const brushCanvas = brushCanvasRef.current
    if (!brushCanvas) return
    const imageCanvas = imageCanvasRef.current
    if (props.isMosaicMode && !imageCanvas) return
    const assistedCanvas = assistedCanvasRef.current
    if (!assistedCanvas) return

    const ctx = props.isMosaicMode
      ? imageCanvas?.getContext("2d")
      : brushCanvas.getContext("2d")
    if (!ctx) return

    const assistedCtx = assistedCanvas.getContext("2d")
    if (!assistedCtx) return

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      // スマホで2本指以上は拡大縮小用
      if (isTouchDevice && "touches" in e && e.touches.length > 1) {
        return
      }

      if (props.onChangeSetDrawing) props.onChangeSetDrawing(true)

      const brushRect = brushCanvas.getBoundingClientRect()
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

      // scale, translateを考慮したローカル座標
      const x = (clientX - brushRect.left - translateX) / scale
      const y = (clientY - brushRect.top - translateY) / scale

      setPoints([])
      points.push({ x, y })

      ctx.beginPath()
      ctx.moveTo(x, y)

      assistedCtx.beginPath()
      assistedCtx.moveTo(x, y)

      if (props.isMosaicMode && tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.strokeStyle = "rgba(0, 0, 0, 1)"
        ctx.lineWidth = brushSize
      } else if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.lineWidth = brushSize
      } else if (tool === "lasso" || tool === "lasso-mosaic") {
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = color
        ctx.lineWidth = 1
      } else {
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = color
        ctx.lineWidth = brushSize
      }

      const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (isPinching) return

        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
        const x = (clientX - brushRect.left - translateX) / scale
        const y = (clientY - brushRect.top - translateY) / scale

        if (tool !== "lasso" && tool !== "lasso-mosaic") {
          points.push({ x, y })
          ctx.lineTo(x, y)
          ctx.stroke()
        } else {
          ctx.lineTo(x, y)
          ctx.stroke()

          assistedCtx.lineTo(x, y)
          assistedCtx.stroke()

          if (tool === "lasso" || tool === "lasso-mosaic") {
            assistedCtx.fillStyle = "rgba(120, 0, 0, 0.5)"
            assistedCtx.fill()
          } else {
            ctx.stroke()
          }
        }
      }

      const handleMouseUp = () => {
        if (canvasStates.length === 0) {
          if (props.isMosaicMode) {
            if (imageCanvas) {
              canvasStates.splice(stateIndex + 1)
              saveCanvasState(imageCanvas)
            }
          } else {
            if (brushCanvas) {
              canvasStates.splice(stateIndex + 1)
              saveCanvasState(brushCanvas)
            }
          }
        }
        if (tool === "lasso" || tool === "lasso-mosaic") {
          ctx.lineTo(points[0].x, points[0].y)
          ctx.closePath()
          ctx.fillStyle = color
          ctx.fill()
          setPoints([])
          resetAssistedCanvas()
        }

        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchmove", handleMouseMove)
        document.removeEventListener("touchend", handleMouseUp)

        if (props.isMosaicMode) {
          if (imageCanvas) {
            canvasStates.splice(stateIndex + 1)
            saveCanvasState(imageCanvas)
          }
        } else {
          if (brushCanvas) {
            canvasStates.splice(stateIndex + 1)
            saveCanvasState(brushCanvas)
          }
        }

        if (props.onChangeSetDrawing) props.onChangeSetDrawing(false)

        if (props.onChangeCompositionCanvasBase64) {
          const compositionCanvas = document.createElement("canvas")
          compositionCanvas.width = canvasWidth
          compositionCanvas.height = canvasHeight
          const compositionCtx = compositionCanvas.getContext("2d")
          if (compositionCtx) {
            if (backgroundCanvasRef.current) {
              compositionCtx.drawImage(backgroundCanvasRef.current, 0, 0)
            }
            if (imageCanvas) {
              compositionCtx.drawImage(imageCanvas, 0, 0)
            }
            compositionCtx.drawImage(brushCanvas, 0, 0)
            props.onChangeCompositionCanvasBase64(compositionCanvas.toDataURL())
          }
        }
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleMouseMove)
      document.addEventListener("touchend", handleMouseUp)

      if (!props.isMosaicMode) {
        if (props.onChangeBrushImageBase64) {
          props.onChangeBrushImageBase64(brushCanvas.toDataURL())
        }
      }
    }

    assistedCanvas.addEventListener("mousedown", handleMouseDown)
    assistedCanvas.addEventListener("touchstart", handleMouseDown)

    return () => {
      assistedCanvas.removeEventListener("mousedown", handleMouseDown)
      assistedCanvas.removeEventListener("touchstart", handleMouseDown)
    }
  }, [
    brushSize,
    color,
    props.isMosaicMode,
    scale,
    tool,
    points,
    isPinching,
    isTouchDevice,
    translateX,
    translateY,
    canvasHeight,
    canvasWidth,
  ])

  useEffect(() => {
    const imageCanvas = imageCanvasRef.current
    if (!imageCanvas) return
    const ctx = imageCanvas.getContext("2d")
    if (!ctx) return
    if (!props.imageUrl) return

    const image = new Image()
    image.crossOrigin = "Anonymous"
    image.src = props.imageUrl
    image.onload = () => {
      imageCanvas.width = image.width
      imageCanvas.height = image.height
      if (brushCanvasRef.current) {
        brushCanvasRef.current.width = image.width
        brushCanvasRef.current.height = image.height
      }
      if (assistedCanvasRef.current) {
        assistedCanvasRef.current.width = image.width
        assistedCanvasRef.current.height = image.height
      }

      setCanvasWidth(image.width)
      setCanvasHeight(image.height)

      ctx.drawImage(image, 0, 0, image.width, image.height)
      saveCanvasState(imageCanvas)
    }
  }, [props.imageUrl])

  const containerRef = useRef<HTMLDivElement | null>(null)

  // PC用ホイールイベント: マウス位置を基準に拡大縮小
  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (isTouchDevice) return // タッチデバイスなら何もしない
    e.preventDefault()
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const localX = (mouseX - translateX) / scale
    const localY = (mouseY - translateY) / scale

    const scaleFactor = 1.1
    let newScale = e.deltaY < 0 ? scale * scaleFactor : scale / scaleFactor
    newScale = Math.max(0.1, Math.min(newScale, 10))

    const newTranslateX = mouseX - localX * newScale
    const newTranslateY = mouseY - localY * newScale

    setScale(newScale)
    setTranslateX(newTranslateX)
    setTranslateY(newTranslateY)
  }

  // モバイル用ピンチズーム
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchDevice) return
    if (e.touches.length === 2 && containerRef.current) {
      setIsPinching(true)
      const rect = containerRef.current.getBoundingClientRect()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]

      const midX = (touch1.clientX + touch2.clientX) / 2 - rect.left
      const midY = (touch1.clientY + touch2.clientY) / 2 - rect.top

      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      const distance = Math.sqrt(dx * dx + dy * dy)

      setInitialPinchDistance(distance)
      setInitialScale(scale)
      setInitialMidX(midX)
      setInitialMidY(midY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchDevice) return
    if (
      isPinching &&
      e.touches.length === 2 &&
      initialPinchDistance &&
      containerRef.current
    ) {
      e.preventDefault()
      const rect = containerRef.current.getBoundingClientRect()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]

      const midX = (touch1.clientX + touch2.clientX) / 2 - rect.left
      const midY = (touch1.clientY + touch2.clientY) / 2 - rect.top

      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const newScale = Math.min(
        Math.max((distance / initialPinchDistance) * initialScale, 0.1),
        10,
      )

      const localX = (initialMidX - translateX) / scale
      const localY = (initialMidY - translateY) / scale

      const newTranslateX = midX - localX * newScale
      const newTranslateY = midY - localY * newScale

      setScale(newScale)
      setTranslateX(newTranslateX)
      setTranslateY(newTranslateY)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchDevice) return
    if (e.touches.length < 2 && isPinching) {
      setIsPinching(false)
    }
  }

  const resetCanvas = () => {
    const brushCanvas = brushCanvasRef.current
    if (!brushCanvas) return
    const ctx = brushCanvas.getContext("2d")
    if (ctx) ctx.clearRect(0, 0, brushCanvas.width, brushCanvas.height)
  }

  const resetMosaicCanvas = () => {
    const imageCanvas = imageCanvasRef.current
    if (!imageCanvas) return
    const ctx = imageCanvas.getContext("2d")
    if (!ctx || !props.imageUrl) return
    ctx.globalCompositeOperation = "copy"

    const image = new Image()
    image.crossOrigin = "Anonymous"
    image.onload = () => {
      ctx.drawImage(image, 0, 0)
    }
    image.onerror = () => {
      console.error("画像の読み込みに失敗しました。")
    }
    image.src = props.imageUrl
  }

  const resetAssistedCanvas = () => {
    const assistedCanvas = assistedCanvasRef.current
    if (!assistedCanvas) return
    const ctx = assistedCanvas.getContext("2d")
    if (ctx) ctx.clearRect(0, 0, assistedCanvas.width, assistedCanvas.height)
  }

  return (
    <section className="relative h-[100%] w-[100%]">
      <div className="block h-[100%] w-[100%] md:flex">
        <div className="mb-1 flex bg-card md:flex-col">
          {!props.isMosaicMode && (
            <Button
              className={cn(tool === "brush" ? "mr-2 border" : "mr-2")}
              size="icon"
              variant="ghost"
              onClick={() => setTool("brush")}
            >
              <BrushIcon className="m-auto text-black" />
            </Button>
          )}
          {!props.isMosaicMode && (
            <Button
              className={cn(tool === "lasso" ? "mr-2 border" : "mr-2")}
              size="icon"
              variant="ghost"
              onClick={() => setTool("lasso")}
            >
              <LassoIcon className="m-auto" />
            </Button>
          )}
          {props.isMosaicMode && (
            <Button
              className={cn(tool === "lasso-mosaic" ? "mr-2 border" : "mr-2")}
              size="icon"
              variant="ghost"
              onClick={() => setTool("lasso-mosaic")}
            >
              <LassoIcon className="m-auto" />
            </Button>
          )}

          <Button
            className={cn(tool === "eraser" ? "mr-2 border" : "mr-2")}
            size="icon"
            variant="ghost"
            onClick={() => setTool("eraser")}
          >
            <EraserIcon className="m-auto" />
          </Button>
          {!props.isMosaicMode && (
            <Button
              className="mr-2"
              size="icon"
              variant="ghost"
              onClick={resetCanvas}
            >
              <CookingPotIcon className="m-auto" />
            </Button>
          )}
          {props.isMosaicMode && (
            <Button
              className="mr-2"
              size="icon"
              variant="ghost"
              onClick={resetMosaicCanvas}
            >
              <CookingPotIcon className="m-auto" />
            </Button>
          )}

          <Button
            className="mr-2"
            size="icon"
            variant="ghost"
            onClick={handleUndo}
          >
            <RotateCcwIcon className="m-auto" />
          </Button>
          <Button
            className="mr-2"
            size="icon"
            variant="ghost"
            onClick={handleRedo}
            disabled={stateIndex >= canvasStates.length - 1}
          >
            <RotateCwIcon className="m-auto" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="block">
              <Button
                className="mr-2"
                size={"icon"}
                variant={"ghost"}
                onClick={() => {}}
              >
                <SlidersHorizontalIcon className="m-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div
                className={cn("flex items-center", {
                  "p-2": props.isPadding,
                })}
              >
                <div className="flex flex-col">
                  <p className="w-48">{"ブラシサイズ："}</p>
                  <Slider
                    aria-label="slider-ex-2"
                    defaultValue={[brushSize]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={(value) => {
                      setBrushSize(value[0])
                    }}
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {!props.isMosaicMode && props.isColorPicker && (
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mr-2 h-10 w-10 cursor-pointer border-0 p-0"
              style={{ backgroundColor: color }}
              title="Choose a color"
            />
          )}
          {props.isBackgroundColorPicker && (
            <input
              type="color"
              value={color}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="mr-2 h-10 w-10 cursor-pointer border-0 p-0"
              style={{ backgroundColor: color }}
              title="Choose a color"
            />
          )}
        </div>
        <div
          className={cn(
            "flex h-[100%] w-full items-center justify-center overflow-hidden border border-gray-300 bg-card",
          )}
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={isTouchDevice ? undefined : handleWheel}
          style={{ touchAction: isTouchDevice ? "pan-x pan-y" : "auto" }}
        >
          {/* translateとscaleを適用したラッパー */}
          <div
            style={{
              position: "relative",
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {props.isMosaicMode && props.imageUrl && (
              <MosaicCanvas
                className={cn("absolute top-0 left-0")}
                imageUrl={props.imageUrl}
                mosaicSize={10}
                width={props.width}
                height={props.height}
                onChangeCanvasRef={onChangeMosaicCanvasRef}
              />
            )}

            {props.isBackground && (
              <canvas
                ref={backgroundCanvasRef}
                width={props.width}
                height={props.height}
                className={cn("absolute top-0 left-0")}
                style={{
                  backgroundColor: `${backgroundColor}`,
                }}
              />
            )}

            {props.imageUrl && (
              <canvas
                ref={imageCanvasRef}
                width={props.width}
                height={props.height}
                className={cn("absolute top-0 left-0")}
              />
            )}
            <canvas
              ref={brushCanvasRef}
              width={props.width}
              height={props.height}
              className={cn("absolute top-0 left-0")}
            />
            <canvas
              ref={assistedCanvasRef}
              width={props.width}
              height={props.height}
              className={cn("absolute top-0 left-0 opacity-50")}
            />
          </div>
          {props.isShowSubmitButton && (
            <Button
              className="absolute bottom-16 md:bottom-12"
              onClick={() => {
                if (props.onSubmit) {
                  const compositeCanvas = document.createElement("canvas")
                  const ctx = compositeCanvas.getContext("2d")
                  if (!ctx) return
                  compositeCanvas.width = brushCanvasRef?.current?.width || 0
                  compositeCanvas.height = brushCanvasRef?.current?.height || 0

                  if (backgroundCanvasRef?.current) {
                    ctx.drawImage(backgroundCanvasRef.current, 0, 0)
                  }
                  if (mosaicCanvasRef) {
                    ctx.drawImage(mosaicCanvasRef, 0, 0)
                  }
                  if (imageCanvasRef?.current) {
                    ctx.drawImage(imageCanvasRef.current, 0, 0)
                  }
                  if (brushCanvasRef?.current) {
                    ctx.drawImage(brushCanvasRef.current, 0, 0)
                  }

                  const dataUrl = compositeCanvas.toDataURL(
                    `image/${props.extension ?? "webp"}`,
                    1.0,
                  )
                  props.onSubmit(dataUrl)
                }
                if (props.onClose) {
                  props.onClose()
                }
              }}
            >
              決定
            </Button>
          )}
          <div className="absolute bottom-8 z-50 w-[72%] md:bottom-8">
            <Slider
              aria-label="slider-ex-2"
              defaultValue={[scale]}
              min={0.1}
              max={10}
              step={0.1}
              onValueChange={(value) => {
                // スライダー操作で拡大縮小する場合、中心点は画面中央とするなどの対応が必要
                // ここでは簡易的に中央に対してスケーリングする例
                const centerX = canvasWidth / 2
                const centerY = canvasHeight / 2

                const localX = (centerX - translateX) / scale
                const localY = (centerY - translateY) / scale

                const newScale = value[0]
                const newTranslateX = centerX - localX * newScale
                const newTranslateY = centerY - localY * newScale

                setScale(newScale)
                setTranslateX(newTranslateX)
                setTranslateY(newTranslateY)
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
