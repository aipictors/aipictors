import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  BrushIcon,
  EraserIcon,
  LassoIcon,
  MoveIcon,
  RotateCwIcon,
  RotateCcwIcon,
  ZoomInIcon,
  ZoomOutIcon,
  FilterIcon,
  XIcon,
} from "lucide-react"
import { Slider } from "~/components/ui/slider"
import { cn } from "~/lib/utils"
import MosaicCanvas from "~/components/mosaic-canvas"
import { ImageFilterPanel } from "~/components/image-filter-panel"
import { applyImageFilter, type FilterType } from "~/utils/image-filter-utils"

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
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const [tool, setTool] = useState(props.isMosaicMode ? "eraser" : "brush")
  const [color, setColor] = useState("#000000") // ブラシの初期色
  const [brushSize, setBrushSize] = useState<number>(20)
  const [scale, setScale] = useState<number>(1)
  const [translateX, setTranslateX] = useState<number>(0)
  const [translateY, setTranslateY] = useState<number>(0)

  // パン操作用の状態
  const [isPanning, setIsPanning] = useState<boolean>(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [panStartTranslate, setPanStartTranslate] = useState<{
    x: number
    y: number
  }>({ x: 0, y: 0 })
  // 描画状態の管理（パン操作との競合を防ぐため）
  const [isDrawing, setIsDrawing] = useState<boolean>(false)

  const [points, setPoints] = useState<{ x: number; y: number }[]>([]) // 状態としてポイントを保存
  const [canvasWidth, setCanvasWidth] = useState<number>(props.width || 240)
  const [canvasHeight, setCanvasHeight] = useState<number>(props.height || 360)
  const [backgroundColor] = useState("#fff")
  const [mosaicCanvasRef, setMosaicCanvasRef] =
    useState<HTMLCanvasElement | null>(null)

  // フィルター機能の状態
  const [brightness, setBrightness] = useState<number>(100)
  const [contrast, setContrast] = useState<number>(100)
  const [saturation, setSaturation] = useState<number>(100)
  const [hue, setHue] = useState<number>(0)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false)
  const [isAdvancedFilterPanelOpen, setIsAdvancedFilterPanelOpen] =
    useState<boolean>(false)
  const [appliedFilters, setAppliedFilters] = useState<
    { type: FilterType; intensity: number }[]
  >([])

  // フィルター適用前の元画像を保存
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(
    null,
  )

  // モザイクが適用されたかを追跡
  const [isMosaicApplied, setIsMosaicApplied] = useState<boolean>(false)

  // Canvas 描画状態の配列
  const [canvasStates, setCanvasStates] = useState<CanvasState[]>([])
  // 現在の Canvas の状態を示すインデックス
  const [stateIndex, setStateIndex] = useState<number>(0)

  const onChangeMosaicCanvasRef = (canvas: HTMLCanvasElement) => {
    setMosaicCanvasRef(canvas)
  }

  // フィルター値が変更されたときにプレビューと本体を更新
  useEffect(() => {
    updatePreview()
    applyFilterToCanvas()
  }, [brightness, contrast, saturation, hue, props.imageUrl])

  // 画像読み込み時に元画像データを保存
  useEffect(() => {
    if (props.imageUrl && imageCanvasRef.current) {
      const canvas = imageCanvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "Anonymous"
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // 元画像データを保存
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        setOriginalImageData(imageData)
      }
      img.src = props.imageUrl
    }
  }, [props.imageUrl])

  // 初回読み込み時にプレビューを更新
  useEffect(() => {
    if (props.imageUrl) {
      updatePreview()
    }
  }, [props.imageUrl])

  // プレビューキャンバスの参照を設定
  useEffect(() => {
    const canvas = previewCanvasRef.current
    if (canvas) {
      canvas.width = 200
      canvas.height = 200
    }
  }, [])

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

  // Safari対応: 基本フィルターをImageDataに適用する関数
  const applyBasicFilters = (
    data: Uint8ClampedArray,
    brightness: number,
    contrast: number,
    saturation: number,
    hue: number,
  ) => {
    const brightnessAdjust = brightness / 100
    const contrastAdjust = contrast / 100
    const saturationAdjust = saturation / 100
    const hueAdjust = (hue * Math.PI) / 180

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i]
      let g = data[i + 1]
      let b = data[i + 2]

      // 明度調整
      r = r * brightnessAdjust
      g = g * brightnessAdjust
      b = b * brightnessAdjust

      // コントラスト調整
      r = ((r / 255 - 0.5) * contrastAdjust + 0.5) * 255
      g = ((g / 255 - 0.5) * contrastAdjust + 0.5) * 255
      b = ((b / 255 - 0.5) * contrastAdjust + 0.5) * 255

      // 彩度調整
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      r = gray + (r - gray) * saturationAdjust
      g = gray + (g - gray) * saturationAdjust
      b = gray + (b - gray) * saturationAdjust

      // 色相調整（簡易版）
      if (hue !== 0) {
        const cosA = Math.cos(hueAdjust)
        const sinA = Math.sin(hueAdjust)

        const newR =
          r * (cosA + (1 - cosA) * 0.299) +
          g * ((1 - cosA) * 0.587 - sinA * 0.114) +
          b * ((1 - cosA) * 0.114 + sinA * 0.587)
        const newG =
          r * ((1 - cosA) * 0.299 + sinA * 0.114) +
          g * (cosA + (1 - cosA) * 0.587) +
          b * ((1 - cosA) * 0.114 - sinA * 0.299)
        const newB =
          r * ((1 - cosA) * 0.299 - sinA * 0.587) +
          g * ((1 - cosA) * 0.587 + sinA * 0.299) +
          b * (cosA + (1 - cosA) * 0.114)

        r = newR
        g = newG
        b = newB
      }

      // 値を0-255の範囲にクランプ
      data[i] = Math.max(0, Math.min(255, r))
      data[i + 1] = Math.max(0, Math.min(255, g))
      data[i + 2] = Math.max(0, Math.min(255, b))
    }
  }

  // プレビューキャンバスを更新する関数（Safari対応）
  const updatePreview = () => {
    const previewCanvas = previewCanvasRef.current
    if (!previewCanvas || !props.imageUrl) return

    const ctx = previewCanvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.onload = () => {
      // アスペクト比を維持してプレビューサイズを計算
      const aspectRatio = img.width / img.height
      const maxSize = 200

      let drawWidth = maxSize
      let drawHeight = maxSize
      let offsetX = 0
      let offsetY = 0

      if (aspectRatio > 1) {
        // 横長の画像
        drawHeight = maxSize / aspectRatio
        offsetY = (maxSize - drawHeight) / 2
      } else {
        // 縦長の画像
        drawWidth = maxSize * aspectRatio
        offsetX = (maxSize - drawWidth) / 2
      }

      // プレビューキャンバスのサイズを正しく設定
      previewCanvas.width = maxSize
      previewCanvas.height = maxSize

      // プレビューキャンバスをクリア
      ctx.clearRect(0, 0, maxSize, maxSize)

      // 一時キャンバスを作成して画像を描画
      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) return

      tempCanvas.width = drawWidth
      tempCanvas.height = drawHeight

      // 画像を一時キャンバスに描画
      tempCtx.drawImage(img, 0, 0, drawWidth, drawHeight)

      // フィルターが適用されている場合、ImageDataを使用してフィルターを適用
      if (
        brightness !== 100 ||
        contrast !== 100 ||
        saturation !== 100 ||
        hue !== 0
      ) {
        const imageData = tempCtx.getImageData(0, 0, drawWidth, drawHeight)
        applyBasicFilters(imageData.data, brightness, contrast, saturation, hue)
        tempCtx.putImageData(imageData, 0, 0)
      }

      // フィルター適用済みの画像をプレビューキャンバスに描画
      ctx.drawImage(tempCanvas, offsetX, offsetY)
    }
    img.src = props.imageUrl
  }

  // リアルタイムでキャンバスにフィルターを適用する関数（Safari対応）
  const applyFilterToCanvas = () => {
    if (!originalImageData) return

    const canvas = imageCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // フィルターが初期値と異なる場合のみ適用
    if (
      brightness !== 100 ||
      contrast !== 100 ||
      saturation !== 100 ||
      hue !== 0
    ) {
      // 一時キャンバスを作成して元画像データを復元
      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) return

      tempCanvas.width = originalImageData.width
      tempCanvas.height = originalImageData.height

      // 元画像データのコピーを作成
      const tempImageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height,
      )

      // フィルターを適用
      applyBasicFilters(
        tempImageData.data,
        brightness,
        contrast,
        saturation,
        hue,
      )

      // 一時キャンバスにフィルター適用済み画像を描画
      tempCtx.putImageData(tempImageData, 0, 0)

      // メインキャンバスをクリアして、フィルター適用済み画像をキャンバス全体に描画
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height)
    } else {
      // フィルターが初期値の場合は元画像データを復元
      // 一時キャンバスを作成して元画像データから描画
      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) return

      tempCanvas.width = originalImageData.width
      tempCanvas.height = originalImageData.height
      tempCtx.putImageData(originalImageData, 0, 0)

      // メインキャンバスをクリアして、元画像をキャンバス全体に描画
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height)
    }
  }

  // フィルターをリセットする関数
  const resetFilters = () => {
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setHue(0)

    // リセット後すぐにプレビューを更新
    setTimeout(() => {
      updatePreview()
    }, 0)
  }

  // フィルターを適用する関数（Safari対応）
  const applyFilter = () => {
    if (!originalImageData || !imageCanvasRef.current) {
      console.error("Original image data or canvas not found")
      return
    }

    const canvas = imageCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Canvas context not found")
      return
    }

    // 一時キャンバスを作成して元画像データを復元
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCanvas.width = originalImageData.width
    tempCanvas.height = originalImageData.height

    // 元画像データのコピーを作成
    const tempImageData = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      originalImageData.width,
      originalImageData.height,
    )

    // フィルターを適用
    applyBasicFilters(tempImageData.data, brightness, contrast, saturation, hue)

    // 一時キャンバスにフィルター適用済み画像を描画
    tempCtx.putImageData(tempImageData, 0, 0)

    // メインキャンバスをクリアして、フィルター適用済み画像をキャンバス全体に描画
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height)

    // フィルター適用後の新しい元画像データを保存（キャンバスサイズ）
    const newImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setOriginalImageData(newImageData)

    // フィルター値をリセット（見た目は変わらない）
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setHue(0)

    // 状態を保存
    saveCanvasState(canvas)

    // プレビューを更新（フィルターリセット後の状態で）
    setTimeout(() => {
      updatePreview()
    }, 0)

    console.log("Filter applied and made permanent")
  }

  // 高度なフィルターを適用する関数
  const handleAdvancedFilterApply = (
    filterType: FilterType,
    intensity: number,
  ) => {
    if (!imageCanvasRef.current) return

    const canvas = imageCanvasRef.current
    applyImageFilter(canvas, filterType, intensity)

    // 適用されたフィルターをリストに追加
    setAppliedFilters((prev) => [...prev, { type: filterType, intensity }])

    // 新しい元画像データを保存
    const ctx = canvas.getContext("2d")
    if (ctx) {
      setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height))
    }

    // プレビューを更新
    setTimeout(() => {
      updatePreview()
    }, 0)
  }

  // 全フィルターをリセットする関数
  const handleResetAllFilters = () => {
    if (!originalImageData || !imageCanvasRef.current) return

    const canvas = imageCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 一時キャンバスを作成して元画像データを復元
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCanvas.width = originalImageData.width
    tempCanvas.height = originalImageData.height
    tempCtx.putImageData(originalImageData, 0, 0)

    // メインキャンバスをクリアして、元画像をキャンバス全体に描画
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height)

    // フィルター状態をリセット
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setHue(0)
    setAppliedFilters([])

    // プレビューを更新
    setTimeout(() => {
      updatePreview()
    }, 0)
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

  // パン操作のハンドラー関数
  const handlePanStart = (clientX: number, clientY: number) => {
    setIsPanning(true)
    setPanStart({ x: clientX, y: clientY })
    setPanStartTranslate({ x: translateX, y: translateY })
  }

  const handlePanMove = (clientX: number, clientY: number) => {
    if (!isPanning) return
    const deltaX = clientX - panStart.x
    const deltaY = clientY - panStart.y
    setTranslateX(panStartTranslate.x + deltaX)
    setTranslateY(panStartTranslate.y + deltaY)
  }

  const handlePanEnd = () => {
    setIsPanning(false)
  }

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()

    if (tool === "select" || props.isMosaicMode) {
      const rect = e.currentTarget.getBoundingClientRect()
      const mouseX = e.clientX - rect.left - rect.width / 2
      const mouseY = e.clientY - rect.top - rect.height / 2

      const scaleFactor = 1.1
      const newScale = e.deltaY < 0 ? scale * scaleFactor : scale / scaleFactor
      const clampedScale = Math.max(0.1, Math.min(newScale, 5))

      const scaleChange = clampedScale / scale
      const newTranslateX = translateX - mouseX * (scaleChange - 1)
      const newTranslateY = translateY - mouseY * (scaleChange - 1)

      setScale(clampedScale)
      setTranslateX(newTranslateX)
      setTranslateY(newTranslateY)
    } else {
      const scaleFactor = 1.1
      const newScale = e.deltaY < 0 ? scale * scaleFactor : scale / scaleFactor
      setScale(Math.max(0.1, Math.min(newScale, 10)))
    }
  }

  const resetAssistedCanvas = () => {
    const assistedCanvas = assistedCanvasRef.current
    if (!assistedCanvas) return
    const ctx = assistedCanvas.getContext("2d")
    if (ctx) ctx.clearRect(0, 0, assistedCanvas.width, assistedCanvas.height)
  }

  // useEffect群は省略（既存のものと同じ）
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
      if (tool === "select") {
        return
      }

      // 描画開始を記録
      setIsDrawing(true)

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
        // モザイクが適用されたことを記録
        setIsMosaicApplied(true)
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
        // モザイクが適用されたことを記録
        setIsMosaicApplied(true)
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
        // 描画終了を記録
        setIsDrawing(false)

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

        if (!props.isMosaicMode && props.onChangeBrushImageBase64) {
          props.onChangeBrushImageBase64(brushCanvas.toDataURL())
        }
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleMouseMove)
      document.addEventListener("touchend", handleMouseUp)
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
    isDrawing,
  ])

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

    if (!props.imageUrl) return

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

  return (
    <section className="relative h-[100%] w-[100%] bg-gray-900">
      <div className="flex h-[100%] w-[100%]">
        {/* 左側ツールバー - Photoshop風 */}
        <div className="flex w-16 flex-col bg-gray-800 p-2 md:w-20">
          {/* 選択・移動ツール */}
          <Button
            className={cn(
              "mb-2 h-12 w-12 md:h-16 md:w-16",
              tool === "select"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600",
            )}
            size="icon"
            variant="ghost"
            onClick={() => setTool("select")}
          >
            <MoveIcon className="h-6 w-6" />
          </Button>
          {/* 区切り線 */}
          <div className="my-4 h-px bg-gray-600" />

          {/* フィルターツール */}
          <Button
            className={cn(
              "mb-2 h-12 w-12 md:h-16 md:w-16",
              isFilterPanelOpen
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600",
              // モザイクが適用された場合は無効化
              props.isMosaicMode &&
                isMosaicApplied &&
                "cursor-not-allowed opacity-50",
            )}
            size="icon"
            variant="ghost"
            disabled={props.isMosaicMode && isMosaicApplied}
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            title="基本フィルター"
          >
            <FilterIcon className="h-6 w-6" />
          </Button>

          {/* 高度なフィルターツール */}
          {/* <Button
            className={cn(
              "mb-2 h-12 w-12 md:h-16 md:w-16",
              isAdvancedFilterPanelOpen
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600",
              // モザイクが適用された場合は無効化
              props.isMosaicMode &&
                isMosaicApplied &&
                "cursor-not-allowed opacity-50",
            )}
            size="icon"
            variant="ghost"
            disabled={props.isMosaicMode && isMosaicApplied}
            onClick={() => setIsAdvancedFilterPanelOpen(true)}
            title="高度なフィルター"
          >
            <FilterIcon className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-purple-500 rounded-full" />
          </Button> */}

          {!props.isMosaicMode && (
            <Button
              className={cn(
                "mb-2 h-12 w-12 md:h-16 md:w-16",
                tool === "brush"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600",
              )}
              size="icon"
              variant="ghost"
              onClick={() => setTool("brush")}
            >
              <BrushIcon className="h-6 w-6" />
            </Button>
          )}

          {!props.isMosaicMode && (
            <Button
              className={cn(
                "mb-2 h-12 w-12 md:h-16 md:w-16",
                tool === "lasso"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600",
              )}
              size="icon"
              variant="ghost"
              onClick={() => setTool("lasso")}
            >
              <LassoIcon className="h-6 w-6" />
            </Button>
          )}

          <Button
            className={cn(
              "mb-2 h-12 w-12 md:h-16 md:w-16",
              tool === "eraser"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600",
            )}
            size="icon"
            variant="ghost"
            onClick={() => setTool("eraser")}
          >
            <EraserIcon className="h-6 w-6" />
          </Button>

          {props.isMosaicMode && (
            <Button
              className={cn(
                "mb-2 h-12 w-12 md:h-16 md:w-16",
                tool === "lasso-mosaic"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600",
              )}
              size="icon"
              variant="ghost"
              onClick={() => setTool("lasso-mosaic")}
            >
              <LassoIcon className="h-6 w-6" />
            </Button>
          )}

          {/* 拡大縮小ボタン */}
          <Button
            className="mb-2 h-12 w-12 bg-gray-700 text-gray-300 hover:bg-gray-600 md:h-16 md:w-16"
            size="icon"
            variant="ghost"
            onClick={() => setScale((prev) => Math.min(prev * 1.2, 5))}
          >
            <ZoomInIcon className="h-6 w-6" />
          </Button>

          <Button
            className="mb-2 h-12 w-12 bg-gray-700 text-gray-300 hover:bg-gray-600 md:h-16 md:w-16"
            size="icon"
            variant="ghost"
            onClick={() => setScale((prev) => Math.max(prev / 1.2, 0.1))}
          >
            <ZoomOutIcon className="h-6 w-6" />
          </Button>

          <div className="my-4 h-px bg-gray-600" />

          {/* アンドゥ・リドゥ */}
          <Button
            className="mb-2 h-12 w-12 bg-gray-700 text-gray-300 hover:bg-gray-600 md:h-16 md:w-16"
            size="icon"
            variant="ghost"
            onClick={handleUndo}
          >
            <RotateCcwIcon className="h-6 w-6" />
          </Button>

          <Button
            className="mb-2 h-12 w-12 bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 md:h-16 md:w-16"
            size="icon"
            variant="ghost"
            onClick={handleRedo}
            disabled={stateIndex >= canvasStates.length - 1}
          >
            <RotateCwIcon className="h-6 w-6" />
          </Button>

          {/* カラーピッカー */}
          {!props.isMosaicMode && props.isColorPicker && (
            <div className="mt-4">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-12 w-12 cursor-pointer rounded border-2 border-gray-600 md:h-16 md:w-16"
                title="ブラシの色を選択"
              />
            </div>
          )}

          {/* 閉じるボタン */}
          {props.onClose && (
            <>
              <div className="my-4 h-px bg-gray-600" />
              <Button
                className="h-12 w-12 bg-red-600 text-white hover:bg-red-700 md:h-16 md:w-16"
                size="icon"
                variant="ghost"
                onClick={props.onClose}
                title="閉じる"
              >
                <XIcon className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* メインキャンバスエリア */}
        <div className="flex flex-1 flex-col md:flex-row">
          <div
            className={cn(
              "flex h-[100%] flex-1 items-center justify-center overflow-hidden bg-gray-700",
              (tool === "select" || props.isMosaicMode) && "cursor-grab",
              (tool === "select" || props.isMosaicMode) &&
                isPanning &&
                "cursor-grabbing",
            )}
            onMouseDown={(e) => {
              if (tool === "select" && e.button === 0) {
                e.preventDefault()
                handlePanStart(e.clientX, e.clientY)
              } else if (props.isMosaicMode && (e.button === 2 || e.ctrlKey)) {
                e.preventDefault()
                handlePanStart(e.clientX, e.clientY)
              }
            }}
            onMouseMove={(e) => {
              if (isPanning) {
                handlePanMove(e.clientX, e.clientY)
              }
            }}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
            onTouchStart={(e) => {
              // モザイクモードでは描画操作を優先し、selectツールまたは描画中でない場合のみパンを許可
              if (
                tool === "select" ||
                (props.isMosaicMode &&
                  tool !== "eraser" &&
                  tool !== "lasso-mosaic")
              ) {
                if (e.touches.length === 1 && !isDrawing) {
                  e.preventDefault()
                  const touch = e.touches[0]
                  handlePanStart(touch.clientX, touch.clientY)
                }
              }
            }}
            onTouchMove={(e) => {
              if (isPanning && e.touches.length === 1 && !isDrawing) {
                e.preventDefault()
                const touch = e.touches[0]
                handlePanMove(touch.clientX, touch.clientY)
              }
            }}
            onTouchEnd={handlePanEnd}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div
              className="relative"
              style={{
                width: `${props.width}px`,
                height: `${props.height}px`,
                transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                transformOrigin: "center center",
              }}
              onWheel={handleWheel}
            >
              {/* キャンバス群 */}
              {props.isMosaicMode && props.imageUrl && (
                <MosaicCanvas
                  className="absolute left-0 top-0"
                  imageUrl={props.imageUrl}
                  mosaicSize={10}
                  width={props.width}
                  height={props.height}
                  onChangeCanvasRef={onChangeMosaicCanvasRef}
                  style={{
                    top: `${props.imageUrl ? (-1 * canvasHeight) / 2 : 0}px`,
                    left: `${props.imageUrl ? (-1 * canvasWidth) / 2 : 0}px`,
                  }}
                />
              )}

              {props.isBackground && (
                <canvas
                  ref={backgroundCanvasRef}
                  width={props.width}
                  height={props.height}
                  className="absolute left-0 top-0"
                  style={{
                    backgroundColor: backgroundColor,
                    top: `${props.imageUrl ? (-1 * canvasHeight) / 2 : 0}px`,
                    left: `${props.imageUrl ? (-1 * canvasWidth) / 2 : 0}px`,
                  }}
                />
              )}

              {props.imageUrl && (
                <canvas
                  ref={imageCanvasRef}
                  width={props.width}
                  height={props.height}
                  className="absolute left-0 top-0"
                  style={{
                    top: `${props.imageUrl ? (-1 * canvasHeight) / 2 : 0}px`,
                    left: `${props.imageUrl ? (-1 * canvasWidth) / 2 : 0}px`,
                  }}
                />
              )}

              <canvas
                ref={brushCanvasRef}
                width={props.width}
                height={props.height}
                className="absolute left-0 top-0"
                style={{
                  top: `${props.imageUrl ? (-1 * canvasHeight) / 2 : 0}px`,
                  left: `${props.imageUrl ? (-1 * canvasWidth) / 2 : 0}px`,
                }}
              />

              <canvas
                ref={assistedCanvasRef}
                width={props.width}
                height={props.height}
                className="absolute left-0 top-0 opacity-50"
                style={{
                  top: `${props.imageUrl ? (-1 * canvasHeight) / 2 : 0}px`,
                  left: `${props.imageUrl ? (-1 * canvasWidth) / 2 : 0}px`,
                }}
              />
            </div>
          </div>

          {/* 右側パネル - プレビューとフィルター (PCのみ) */}
          <div className="hidden w-80 flex-col bg-gray-800 p-4 md:flex">
            {/* プレビューエリア */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-bold text-gray-300">
                プレビュー
              </h3>
              <div className="aspect-square w-full overflow-hidden rounded-lg border border-gray-600 bg-gray-700">
                <canvas
                  ref={previewCanvasRef}
                  width={200}
                  height={200}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            {/* フィルターパネル */}
            {isFilterPanelOpen && (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-xs text-gray-400">
                    明度: {brightness}%
                  </div>
                  <Slider
                    value={[brightness]}
                    onValueChange={(value) => setBrightness(value[0])}
                    min={0}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="mb-2 text-xs text-gray-400">
                    コントラスト: {contrast}%
                  </div>
                  <Slider
                    value={[contrast]}
                    onValueChange={(value) => setContrast(value[0])}
                    min={0}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="mb-2 text-xs text-gray-400">
                    彩度: {saturation}%
                  </div>
                  <Slider
                    value={[saturation]}
                    onValueChange={(value) => setSaturation(value[0])}
                    min={0}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="mb-2 text-xs text-gray-400">色相: {hue}°</div>
                  <Slider
                    value={[hue]}
                    onValueChange={(value) => setHue(value[0])}
                    min={-180}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={applyFilter}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    適用
                  </Button>
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="flex-1 border-gray-600 "
                  >
                    リセット
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    resetFilters()
                    // 元画像に戻す
                    if (originalImageData && imageCanvasRef.current) {
                      const ctx = imageCanvasRef.current.getContext("2d")
                      if (ctx) {
                        ctx.putImageData(originalImageData, 0, 0)
                      }
                    }
                    setIsFilterPanelOpen(false)
                  }}
                  variant="outline"
                  className="w-full border-gray-600 "
                >
                  キャンセル
                </Button>
              </div>
            )}

            {/* ブラシサイズ調整 */}
            {(tool === "brush" || tool === "eraser") && (
              <div className="mt-6">
                <div className="mb-2 text-xs text-gray-400">
                  ブラシサイズ: {brushSize}px
                </div>
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* 決定・キャンセルボタン */}
        {props.isShowSubmitButton && (
          <div className="fixed bottom-0 left-0 z-50 flex w-full gap-1 bg-gray-900 p-2">
            {/* キャンセルボタン */}
            <Button
              className="h-14 flex-1 rounded-lg bg-gray-600 text-lg font-bold text-white shadow-lg hover:bg-gray-700"
              onClick={() => {
                // まずonCloseを呼び出す
                if (props.onClose) {
                  props.onClose()
                }

                // 確実にモーダルを閉じるため、Escapeキーイベントを発行
                const escEvent = new KeyboardEvent("keydown", {
                  key: "Escape",
                  keyCode: 27,
                  bubbles: true,
                  cancelable: true,
                })
                document.dispatchEvent(escEvent)
              }}
            >
              <XIcon className="mr-2 h-6 w-6" />
              キャンセル
            </Button>

            {/* 決定ボタン */}
            <Button
              className="h-14 flex-1 rounded-lg bg-blue-600 text-lg font-bold text-white shadow-lg hover:bg-blue-700"
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
          </div>
        )}
      </div>

      {/* 高度なフィルターパネル */}
      <ImageFilterPanel
        isOpen={isAdvancedFilterPanelOpen}
        onClose={() => setIsAdvancedFilterPanelOpen(false)}
        onApply={handleAdvancedFilterApply}
        onReset={handleResetAllFilters}
        appliedFilters={appliedFilters}
        originalImageData={originalImageData}
        canvasSize={{ width: canvasWidth, height: canvasHeight }}
      />
    </section>
  )
}
