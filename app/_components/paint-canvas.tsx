import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/_components/ui/button"
import {
  BrushIcon,
  EraserIcon,
  CookingPotIcon,
  SlidersHorizontalIcon,
  LassoIcon,
  RotateCwIcon,
  RotateCcwIcon, // 1. LassoIcon を追加
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu"
import { Slider } from "@/_components/ui/slider"
import { cn } from "@/_lib/cn"
import MosaicCanvas from "@/_components/mosaic-canvas"

interface IProps {
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
 * TODO: コンポーネントを分割する
 */
const PaintCanvas: React.FC<IProps> = ({
  width,
  height,
  imageUrl,
  isMosaicMode,
  isColorPicker,
  isBackground,
  isBackgroundColorPicker,
  isShowSubmitButton,
  isPadding,
  imageBase64,
  backImageBase64,
  extension,
  onChangeBrushImageBase64,
  onChangeSetDrawing,
  onChangeCompositionCanvasBase64,
  onSubmit,
  onClose,
  setBackImageBase64,
}) => {
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const brushCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const assistedCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const [tool, setTool] = useState(isMosaicMode ? "eraser" : "brush")

  const [color, setColor] = useState("#000000") // ブラシの初期色

  const [brushSize, setBrushSize] = useState<number>(20)

  const [scale, setScale] = useState<number>(1)

  const [points, setPoints] = useState<{ x: number; y: number }[]>([]) // 状態としてポイントを保存

  const [canvasWidth, setCanvasWidth] = useState<number>(width || 240)

  const [canvasHeight, setCanvasHeight] = useState<number>(height || 360)

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
    // 画像の読み込みが完了してから Canvas の状態を保存する
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

    console.log("saveCanvasState")

    waitForImageLoad
      .then(() => {
        const dataUrl = canvas.toDataURL() // Canvas のデータ URL を取得
        const newState: CanvasState = {
          dataUrl,
          width: canvas.width,
          height: canvas.height,
        }
        console.log("waitForImageLoad")
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
      const ref = isMosaicMode ? imageCanvasRef : brushCanvasRef
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
      const ref = isMosaicMode ? imageCanvasRef : brushCanvasRef
      if (ref.current) {
        restoreCanvasState(ref.current, canvasStates[newIndex])
      }
    }
  }

  useEffect(() => {
    if (imageBase64) {
      // 画像のbase64がセットされたら、キャンバスに描画する
      const imageCanvas = imageCanvasRef.current
      if (!imageCanvas) return
      const ctx = imageCanvas.getContext("2d")
      if (!ctx) return
      const image = new Image()
      image.crossOrigin = "Anonymous" // CORSを回避するための設定
      image.src = imageBase64
      image.onload = () => {
        imageCanvas.width = image.width
        imageCanvas.height = image.height
        ctx.drawImage(image, 0, 0, image.width, image.height)
        saveCanvasState(imageCanvas)
      }
    }
  }, [imageBase64])

  useEffect(() => {
    if (backImageBase64) {
      if (backImageBase64) {
        // brashRefに対して再描画する
        const brushCanvas = brushCanvasRef.current
        if (!brushCanvas) return
        const ctx = brushCanvas.getContext("2d")
        if (!ctx) return
        const image = new Image()
        image.crossOrigin = "Anonymous" // CORSを回避するための設定
        image.src = `data:image/png;base64,${backImageBase64}`
        image.onload = () => {
          brushCanvas.width = image.width
          brushCanvas.height = image.height
          ctx.drawImage(image, 0, 0, image.width, image.height)
          saveCanvasState(brushCanvas)
        }
      }
      if (setBackImageBase64) {
        setBackImageBase64("")
      }
    }
  }, [backImageBase64])

  useEffect(() => {
    const brushCanvas = brushCanvasRef.current
    if (!brushCanvas) return

    const imageCanvas = imageCanvasRef.current
    if (isMosaicMode && !imageCanvas) return

    const backgroundCanvas = backgroundCanvasRef.current

    const assistedCanvas = assistedCanvasRef.current
    if (!assistedCanvas) return

    const ctx = isMosaicMode
      ? imageCanvas?.getContext("2d")
      : brushCanvas.getContext("2d")
    if (!ctx) return

    const assistedCtx = assistedCanvas.getContext("2d")
    if (!assistedCtx) return

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      if (onChangeSetDrawing) onChangeSetDrawing(true)

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
      const rect = brushCanvas.getBoundingClientRect()
      const x = (clientX - rect.left) / scale
      const y = (clientY - rect.top) / scale
      setPoints([]) // ポイントをリセット
      points.push({ x, y }) // 最初の点を追加

      ctx.beginPath()
      ctx.moveTo(x, y)

      assistedCtx.beginPath()
      assistedCtx.moveTo(x, y)

      if (isMosaicMode && tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.strokeStyle = "rgba(0, 0, 0, 1)"
        ctx.lineWidth = brushSize
      } else if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.lineWidth = brushSize
      } else if (tool === "lasso") {
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = color
        ctx.lineWidth = 1
      } else if (tool === "lasso-mosaic") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.strokeStyle = color
        ctx.lineWidth = 1
      } else {
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = color
        ctx.lineWidth = brushSize
      }

      const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (tool !== "lasso" && tool !== "lasso-mosaic") {
          const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
          const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
          const x = (clientX - rect.left) / scale
          const y = (clientY - rect.top) / scale
          points.push({ x, y }) // 追加の点を配列に保存
          ctx.lineTo(x, y)
          ctx.stroke()
        } else {
          const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
          const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
          const x = (clientX - rect.left) / scale
          const y = (clientY - rect.top) / scale

          ctx.lineTo(x, y)
          ctx.stroke()

          assistedCtx.lineTo(x, y)
          assistedCtx.stroke()

          if (tool === "lasso" || tool === "lasso-mosaic") {
            // 投げ縄のときは描写範囲を塗りつぶす
            assistedCtx.fillStyle = `rgba(${[120, 0, 0, 0.5]})`
            assistedCtx.fill()
          } else {
            ctx.stroke()
          }
        }
      }

      const handleMouseUp = () => {
        if (canvasStates.length === 0) {
          if (isMosaicMode) {
            if (imageCanvas) {
              // index以降の履歴を削除
              canvasStates.splice(stateIndex + 1)
              saveCanvasState(imageCanvas)
            }
          } else {
            if (brushCanvas) {
              // index以降の履歴を削除
              canvasStates.splice(stateIndex + 1)
              saveCanvasState(brushCanvas)
            }
          }
        }
        if (tool === "lasso" || tool === "lasso-mosaic") {
          ctx.lineTo(points[0].x, points[0].y) // 最初の点に戻る
          ctx.closePath()
          ctx.fillStyle = color // 塗りつぶしの色
          ctx.fill() // 形状を塗りつぶす
          setPoints([]) // ポイントをリセット
          resetAssistedCanvas()
        }

        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchmove", handleMouseMove)
        document.removeEventListener("touchend", handleMouseUp)

        if (isMosaicMode) {
          if (imageCanvas) {
            // index以降の履歴を削除
            canvasStates.splice(stateIndex + 1)
            saveCanvasState(imageCanvas)
          }
        } else {
          if (brushCanvas) {
            // index以降の履歴を削除
            canvasStates.splice(stateIndex + 1)
            saveCanvasState(brushCanvas)
          }
        }

        if (onChangeSetDrawing) onChangeSetDrawing(false)

        if (onChangeCompositionCanvasBase64) {
          // キャンバスを合成してbase64に変換してセットする
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
            onChangeCompositionCanvasBase64(compositionCanvas.toDataURL())
          }
        }
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleMouseMove)
      document.addEventListener("touchend", handleMouseUp)

      if (!isMosaicMode) {
        // ブラシキャンバスのbase64画像を取得する
        if (onChangeBrushImageBase64) {
          onChangeBrushImageBase64(brushCanvas.toDataURL())
        }
      }
    }

    assistedCanvas.addEventListener("mousedown", handleMouseDown)
    assistedCanvas.addEventListener("touchstart", handleMouseDown)

    return () => {
      assistedCanvas.removeEventListener("mousedown", handleMouseDown)
      assistedCanvas.removeEventListener("touchstart", handleMouseDown)
    }
  }, [brushSize, color, isMosaicMode, scale, tool, points])

  useEffect(() => {
    const imageCanvas = imageCanvasRef.current
    if (!imageCanvas) return
    const brushCanvas = brushCanvasRef.current
    if (!brushCanvas) return
    const assistedCanvas = assistedCanvasRef.current
    if (!assistedCanvas) return

    const ctx = imageCanvas.getContext("2d")
    if (!ctx) return

    ctx.globalCompositeOperation = "copy"

    if (!imageUrl) return

    const image = new Image()
    image.crossOrigin = "Anonymous" // CORSを回避するための設定
    image.src = imageUrl
    image.onload = () => {
      imageCanvas.width = image.width
      imageCanvas.height = image.height
      brushCanvas.width = image.width
      brushCanvas.height = image.height
      assistedCanvas.width = image.width
      assistedCanvas.height = image.height

      setCanvasWidth(image.width)
      setCanvasHeight(image.height)

      // Canvasに画像を描画
      ctx.drawImage(image, 0, 0, image.width, image.height)

      saveCanvasState(imageCanvas)
      // ここで必要な処理を実行する（例: サーバーに送信する、他の要素に表示するなど）
    }
  }, [imageUrl])

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault() // デフォルトのイベントをキャンセル
    const scaleFactor = 1.1
    const newScale = e.deltaY < 0 ? scale * scaleFactor : scale / scaleFactor
    setScale(Math.max(0.1, Math.min(newScale, 10))) // scale を更新
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

    if (!ctx || !imageUrl) return

    ctx.globalCompositeOperation = "copy"

    const image = new Image()
    image.crossOrigin = "Anonymous" // CORSを回避するための設定

    image.onload = () => {
      ctx.drawImage(image, 0, 0)
    }

    image.onerror = () => {
      console.error("画像の読み込みに失敗しました。")
    }

    image.src = imageUrl // 画像URLを設定
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
        <div className="mb-1 flex md:flex-col">
          {!isMosaicMode && (
            <Button
              className={cn(
                tool === "brush" ? "mr-2 bg-gray-200 dark:bg-gray-800" : "mr-2",
              )}
              size="icon"
              variant="ghost"
              onClick={() => setTool("brush")}
            >
              <BrushIcon className="m-auto" />
            </Button>
          )}
          {!isMosaicMode && (
            <Button // 2. 投げ縄ボタンを追加
              className={cn(
                tool === "lasso" ? "mr-2 bg-gray-200 dark:bg-gray-800" : "mr-2",
              )}
              size="icon"
              variant="ghost"
              onClick={() => setTool("lasso")}
            >
              <LassoIcon className="m-auto" />
            </Button>
          )}
          {isMosaicMode && (
            <Button // 2. 投げ縄ボタンを追加
              className={cn(
                tool === "lasso-mosaic"
                  ? "mr-2 bg-gray-200 dark:bg-gray-800"
                  : "mr-2",
              )}
              size="icon"
              variant="ghost"
              onClick={() => setTool("lasso-mosaic")}
            >
              <LassoIcon className="m-auto" />
            </Button>
          )}

          <Button
            className={cn(
              tool === "eraser" ? "mr-2 bg-gray-200 dark:bg-gray-800" : "mr-2",
            )}
            size="icon"
            variant="ghost"
            onClick={() => setTool("eraser")}
          >
            <EraserIcon className="m-auto" />
          </Button>
          {!isMosaicMode && (
            <Button
              className="mr-2"
              size="icon"
              variant="ghost"
              onClick={resetCanvas}
            >
              <CookingPotIcon className="m-auto" />
            </Button>
          )}
          {isMosaicMode && (
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
              <div className={`flex items-center${isPadding ? "p-2" : ""}`}>
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
          {!isMosaicMode && isColorPicker && (
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mr-2 h-10 w-10 cursor-pointer border-0 p-0"
              style={{ backgroundColor: color }}
              title="Choose a color"
            />
          )}
          {isBackgroundColorPicker && (
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
            "flex h-[100%] w-full items-center justify-center overflow-hidden border border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-900",
          )}
        >
          <div
            className={cn(
              `w-[${canvasWidth}px] h-[${canvasHeight}px] relative m-auto`,
            )}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
            onWheel={(event: React.WheelEvent<HTMLDivElement>) =>
              handleWheel(event)
            }
          >
            {isMosaicMode && imageUrl && (
              <MosaicCanvas
                className={cn("absolute top-0 left-0")}
                imageUrl={imageUrl}
                mosaicSize={10}
                width={width}
                height={height}
                onChangeCanvasRef={onChangeMosaicCanvasRef}
                style={{
                  top: `${imageUrl ? (-1 * canvasHeight) / 2 : 0}px`,
                  left: `${imageUrl ? (-1 * canvasWidth) / 2 : 0}px`,
                }}
              />
            )}

            {/* 真っ白な背景のキャンバスを描画する */}
            {isBackground && (
              <canvas
                ref={backgroundCanvasRef}
                width={width}
                height={height}
                className={cn("absolute top-0 left-0")}
                style={{
                  backgroundColor: `${backgroundColor}`,
                  top: `${imageUrl ? (-1 * canvasHeight) / 2 : 0}px`,
                  left: `${imageUrl ? (-1 * canvasWidth) / 2 : 0}px`,
                }}
              />
            )}

            {imageUrl && (
              <canvas
                ref={imageCanvasRef}
                width={width}
                height={height}
                className={cn("absolute top-0 left-0")}
                style={{
                  top: `${imageUrl ? (-1 * canvasHeight) / 2 : 0}px`,
                  left: `${imageUrl ? (-1 * canvasWidth) / 2 : 0}px`,
                }}
              />
            )}
            <canvas
              ref={brushCanvasRef}
              width={width}
              height={height}
              className={cn("absolute top-0 left-0")}
              style={{
                top: `${imageUrl ? (-1 * canvasHeight) / 2 : 0}px`,
                left: `${imageUrl ? (-1 * canvasWidth) / 2 : 0}px`,
              }}
            />
            <canvas
              ref={assistedCanvasRef}
              width={width}
              height={height}
              className={cn("absolute top-0 left-0 opacity-50")}
              style={{
                top: `${imageUrl ? (-1 * canvasHeight) / 2 : 0}px`,
                left: `${imageUrl ? (-1 * canvasWidth) / 2 : 0}px`,
              }}
            />
          </div>
          {isShowSubmitButton && (
            <Button
              className="absolute bottom-8 md:bottom-12"
              onClick={() => {
                if (onSubmit) {
                  // キャンバスを合成する（brush、image、background）
                  const compositeCanvas = document.createElement("canvas")
                  const ctx = compositeCanvas.getContext("2d")

                  if (!ctx) return

                  // 各キャンバスのサイズに合わせて、合成用キャンバスのサイズを設定（この例では最初のキャンバスのサイズを使用）
                  compositeCanvas.width = brushCanvasRef?.current?.width || 0
                  compositeCanvas.height = brushCanvasRef?.current?.height || 0

                  // 各キャンバスを合成キャンバスに描画（存在する場合のみ）
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

                  // 合成したキャンバスからDataURLを取得
                  const dataUrl = compositeCanvas.toDataURL(
                    `image/${extension ?? "webp"}`,
                  )

                  // onSubmit関数を呼び出し、DataURLを渡す
                  onSubmit(dataUrl)
                }
                if (onClose) {
                  onClose()
                }
              }}
            >
              決定
            </Button>
          )}
          <div className="absolute bottom-2 z-50 w-[72%] md:bottom-8">
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
        </div>
      </div>
    </section>
  )
}

export default PaintCanvas
