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
  ArrowLeft,
  ArrowRight,
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
  height?: number // キャンバスの立幅
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
  onChangeSetDrawing?(value: boolean): void // 描画中かどうかの状態を変更する関数
  onChangeCompositionCanvasBase64?(value: string): void // 合成画像のbase64を変更する関数
  onSubmit?(value: string): void
  onClose?(): void
  setBackImageBase64?(value: string): void
  extension?: string // 保存する拡張子
}

// Canvas 描画状態を保存するためのインターフェース
interface CanvasState {
  dataUrl: string // Canvas のデータ URL
  width: number // Canvas の幅
  height: number // Canvas の高さ
}

/**
 * ペイント機能を提供する、ツールバーも提供する
 */
export function PaintCanvas(props: Props) {
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const brushCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const assistedCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const [tool, setTool] = useState(props.isMosaicMode ? "eraser" : "brush")
  const [color, setColor] = useState("#000000") // ブラシの初期色
  const [brushSize, setBrushSize] = useState<number>(20)

  const [scale, setScale] = useState<number>(1)
  const [translateX, setTranslateX] = useState<number>(0)
  const [translateY, setTranslateY] = useState<number>(0)

  const [points, setPoints] = useState<{ x: number; y: number }[]>([]) // 状態としてポイントを保存
  const [canvasWidth, setCanvasWidth] = useState<number>(props.width || 240)
  const [canvasHeight, setCanvasHeight] = useState<number>(props.height || 360)
  const [backgroundColor, setBackgroundColor] = useState("#fff")
  const [mosaicCanvasRef, setMosaicCanvasRef] =
    useState<HTMLCanvasElement | null>(null)

  // Canvas 描画状態の配列
  const [canvasStates, setCanvasStates] = useState<CanvasState[]>([])
  // 現在の Canvas の状態を示すインデックス
  const [stateIndex, setStateIndex] = useState<number>(0)

  const onChangeMosaicCanvasRef = (canvas: HTMLCanvasElement) => {
    setMosaicCanvasRef(canvas)
  }

  // Canvas の描画状態を保存する関数
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
        const dataUrl = canvas.toDataURL() // Canvas のデータ URL を取得
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

  // Canvas の描画状態を復元する関数
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

  // 戻るボタンのクリック時の処理
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

  // 進むボタンのクリック時の処理
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
    const backgroundCanvas = backgroundCanvasRef.current
    const assistedCanvas = assistedCanvasRef.current
    if (!assistedCanvas) return

    const ctx = props.isMosaicMode
      ? imageCanvas?.getContext("2d")
      : brushCanvas.getContext("2d")
    if (!ctx) return

    const assistedCtx = assistedCanvas.getContext("2d")
    if (!assistedCtx) return

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      if (props.onChangeSetDrawing) props.onChangeSetDrawing(true)

      const rect = brushCanvas.getBoundingClientRect()
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
      const x = (clientX - rect.left) / scale
      const y = (clientY - rect.top) / scale

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
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
        const x = (clientX - rect.left) / scale
        const y = (clientY - rect.top) / scale

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
            if (backgroundCanvas) {
              compositionCtx.drawImage(backgroundCanvas, 0, 0)
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
    translateX,
    translateY,
  ])

  useEffect(() => {
    const imageCanvas = imageCanvasRef.current
    if (!imageCanvas) return
    const brushCanvas = brushCanvasRef.current
    if (!brushCanvas) return
    const assistedCanvas = assistedCanvasRef.current
    if (!assistedCanvas) return

    const ctx = imageCanvas.getContext("2d")
    if (!ctx || !props.imageUrl) return

    ctx.globalCompositeOperation = "copy"

    const image = new Image()
    image.crossOrigin = "Anonymous"
    image.src = props.imageUrl
    image.onload = () => {
      imageCanvas.width = image.width
      imageCanvas.height = image.height
      brushCanvas.width = image.width
      brushCanvas.height = image.height
      assistedCanvas.width = image.width
      assistedCanvas.height = image.height

      setCanvasWidth(image.width)
      setCanvasHeight(image.height)

      ctx.drawImage(image, 0, 0, image.width, image.height)
      saveCanvasState(imageCanvas)
    }
  }, [props.imageUrl])

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    const scaleFactor = 1.1
    const newScale = e.deltaY < 0 ? scale * scaleFactor : scale / scaleFactor
    setScale(Math.max(0.1, Math.min(newScale, 10)))
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
        >
          <div
            className="relative"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
              transformOrigin: "top left",
            }}
            onWheel={handleWheel}
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
              className="-translate-x-1/2 absolute bottom-56 left-1/2"
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
          <div className="absolute bottom-32 z-50 w-[72%]">
            <Slider
              aria-label="slider-ex-2"
              defaultValue={[scale]}
              min={0.1}
              max={10}
              step={0.1}
              onValueChange={(value) => {
                setScale(value[0])
              }}
            />
          </div>
          {/* 下部に左右移動ボタン */}
          <div className="-translate-x-1/2 absolute bottom-40 left-1/2 z-50 flex gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTranslateX((prev) => prev + 50)}
            >
              <ArrowLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTranslateX((prev) => prev - 50)}
            >
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
