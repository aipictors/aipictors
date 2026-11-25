import {
  BrushIcon,
  EraserIcon,
  EyeIcon,
  HandIcon,
  LassoIcon,
  Loader2Icon,
  MaximizeIcon,
  MinusIcon,
  PlusIcon,
  Redo2Icon,
  SparklesIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  canvasToWebpDataUrl,
  createMaskedMosaicLayer,
  createPixelatedCanvas,
  detectAutoMosaic,
  loadMosaicImage,
  preloadAutoMosaic,
} from "~/utils/auto-mosaic"

type Props = {
  imageUrl: string
  onSubmit(dataUrl: string): void
  onClose(): void
  /** 自動モザイク（ベータ）のボタンを出す */
  isAutoMosaic?: boolean
  /** 年齢種別が R18 / R18G（投稿時に自動でモザイクがかかる旨を出す。胸部の選択はこのときだけ） */
  isR18?: boolean
}

type Tool = "brush" | "lasso" | "eraser" | "move"

type Point = { x: number; y: number }

/** 描いた操作（戻す・やり直すは最初から描き直す） */
type Operation =
  | { type: "brush" | "eraser"; width: number; points: Point[] }
  | { type: "lasso"; points: Point[] }
  | { type: "layer"; layer: HTMLCanvasElement }

type View = { scale: number; x: number; y: number }

const BRUSH_SIZE_KEY = "mosaic-editor-brush-size"
const TOOL_KEY = "mosaic-editor-tool"
const MIN_SCALE = 0.05
const MAX_SCALE = 8

const readNumber = (key: string, fallback: number) => {
  if (typeof window === "undefined") return fallback
  const value = Number(localStorage.getItem(key))
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const readTool = (): Tool => {
  if (typeof window === "undefined") return "brush"
  const value = localStorage.getItem(TOOL_KEY)
  return value === "lasso" || value === "eraser" ? value : "brush"
}

/**
 * 投稿画像にモザイクをかける画面（スマホ・PC 共通）
 * - 1 本指 / マウスで塗る、2 本指でつまんで拡大・ずらす、ホイールで拡大、スペース・右ドラッグでずらす
 * - 元の画像の上に「ピクセル化した画像を塗った層」を重ねて、決定のときに合成する
 */
export function MosaicEditor(props: Props): React.ReactNode {
  const t = useTranslation()

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const imageRef = useRef<HTMLImageElement | null>(null)
  const pixelatedRef = useRef<HTMLCanvasElement | null>(null)

  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [tool, setTool] = useState<Tool>(readTool)
  const [brushSize, setBrushSize] = useState(() =>
    readNumber(BRUSH_SIZE_KEY, 32),
  )
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 })
  const viewRef = useRef(view)
  viewRef.current = view

  const [operations, setOperations] = useState<Operation[]>([])
  const [redoStack, setRedoStack] = useState<Operation[]>([])
  const [isComparing, setIsComparing] = useState(false)
  const [isAutoRunning, setIsAutoRunning] = useState(false)
  const [isAutoNipples, setIsAutoNipples] = useState(false)
  // ブラシの丸の位置。動かすたびに画面全体を描き直さないよう、位置は直接書き換える
  const [isCursorVisible, setIsCursorVisible] = useState(false)
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const cursorPointRef = useRef<Point | null>(null)
  // ピクセル化した画像の塗りの模様（塗るたびに作り直さない）
  const patternRef = useRef<{
    ctx: CanvasRenderingContext2D
    source: HTMLCanvasElement
    pattern: CanvasPattern
  } | null>(null)
  const [isSpacePressed, setIsSpacePressed] = useState(false)

  // 進行中の操作（ポインタ）
  const pointersRef = useRef(new Map<number, Point>())

  const placeCursor = (element: HTMLDivElement | null, point: Point | null) => {
    if (!element || !point) return
    element.style.transform = `translate(${point.x}px, ${point.y}px)`
  }

  const setCursor = (point: Point | null) => {
    cursorPointRef.current = point
    placeCursor(cursorRef.current, point)
    setIsCursorVisible(point !== null)
  }
  const gestureRef = useRef<
    | { kind: "none" }
    | { kind: "draw"; pointerId: number; operation: Operation }
    | { kind: "pan"; pointerId: number; start: Point; view: View }
    | {
        kind: "pinch"
        distance: number
        center: Point
        view: View
      }
    | { kind: "wait" }
  >({ kind: "none" })

  useEffect(() => {
    setIsMounted(true)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = overflow
    }
  }, [])

  // 自動モザイクを押したときすぐ動くよう、検出の部品を先に読んでおく
  useEffect(() => {
    if (props.isAutoMosaic) preloadAutoMosaic()
  }, [props.isAutoMosaic])

  useEffect(() => {
    localStorage.setItem(BRUSH_SIZE_KEY, String(brushSize))
  }, [brushSize])

  useEffect(() => {
    if (tool !== "move") localStorage.setItem(TOOL_KEY, tool)
  }, [tool])

  /** 画面に収まる大きさにする */
  const fitView = useCallback(() => {
    const viewport = viewportRef.current
    const image = imageRef.current
    if (!viewport || !image) return
    const rect = viewport.getBoundingClientRect()
    const scale = Math.min(
      (rect.width - 16) / image.width,
      (rect.height - 16) / image.height,
    )
    setView({
      scale,
      x: (rect.width - image.width * scale) / 2,
      y: (rect.height - image.height * scale) / 2,
    })
  }, [])

  // 画像を読み込んで、ピクセル化した画像を用意する
  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)
    loadMosaicImage(props.imageUrl)
      .then((image) => {
        if (isCancelled) return
        imageRef.current = image
        pixelatedRef.current = createPixelatedCanvas(image)
        patternRef.current = null
        setSize({ width: image.width, height: image.height })
        setOperations([])
        setRedoStack([])
        setIsLoading(false)
      })
      .catch(() => {
        if (isCancelled) return
        toast.error(t("画像を読み込めませんでした", "Failed to load the image"))
        props.onClose()
      })
    return () => {
      isCancelled = true
    }
  }, [props.imageUrl])

  // キャンバスの大きさが決まったら元の画像を描いて全体を表示する
  useEffect(() => {
    const base = baseCanvasRef.current
    const image = imageRef.current
    if (!base || !image || size.width === 0) return
    base.getContext("2d")?.drawImage(image, 0, 0)
    fitView()
  }, [size, fitView])

  useEffect(() => {
    window.addEventListener("resize", fitView)
    return () => window.removeEventListener("resize", fitView)
  }, [fitView])

  const getPattern = (
    ctx: CanvasRenderingContext2D,
    source: HTMLCanvasElement,
  ) => {
    const cached = patternRef.current
    if (cached && cached.ctx === ctx && cached.source === source) {
      return cached.pattern
    }
    const pattern = ctx.createPattern(source, "no-repeat")
    if (pattern !== null) patternRef.current = { ctx, source, pattern }
    return pattern
  }

  /** 1 つの操作を層に描く */
  const drawOperation = (
    ctx: CanvasRenderingContext2D,
    operation: Operation,
    from = 0,
  ) => {
    const pixelated = pixelatedRef.current
    if (!pixelated) return
    ctx.save()
    if (operation.type === "layer") {
      ctx.globalCompositeOperation = "source-over"
      ctx.drawImage(operation.layer, 0, 0)
      ctx.restore()
      return
    }
    const pattern = getPattern(ctx, pixelated)
    if (pattern === null) {
      ctx.restore()
      return
    }
    const points = operation.points
    if (operation.type === "lasso") {
      if (points.length < 3) {
        ctx.restore()
        return
      }
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = pattern
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (const p of points.slice(1)) ctx.lineTo(p.x, p.y)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
      return
    }
    ctx.globalCompositeOperation =
      operation.type === "eraser" ? "destination-out" : "source-over"
    ctx.strokeStyle = operation.type === "eraser" ? "#000" : pattern
    ctx.fillStyle = ctx.strokeStyle
    ctx.lineWidth = operation.width
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    if (points.length === 1 || from === 0) {
      ctx.beginPath()
      ctx.arc(points[0].x, points[0].y, operation.width / 2, 0, Math.PI * 2)
      ctx.fill()
    }
    if (points.length > 1) {
      const start = Math.max(0, from - 1)
      ctx.beginPath()
      ctx.moveTo(points[start].x, points[start].y)
      for (const p of points.slice(start + 1)) ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }
    ctx.restore()
  }

  /** 操作の一覧から層を描き直す */
  const redrawOverlay = (list: Operation[]) => {
    const overlay = overlayCanvasRef.current
    const ctx = overlay?.getContext("2d")
    if (!overlay || !ctx) return
    ctx.clearRect(0, 0, overlay.width, overlay.height)
    for (const operation of list) drawOperation(ctx, operation)
  }

  const commitOperation = (operation: Operation) => {
    setOperations((prev) => [...prev, operation])
    setRedoStack([])
  }

  const undo = () => {
    if (operations.length === 0) return
    const next = operations.slice(0, -1)
    setRedoStack((prev) => [...prev, operations[operations.length - 1]])
    setOperations(next)
    redrawOverlay(next)
  }

  const redo = () => {
    if (redoStack.length === 0) return
    const operation = redoStack[redoStack.length - 1]
    const next = [...operations, operation]
    setRedoStack((prev) => prev.slice(0, -1))
    setOperations(next)
    redrawOverlay(next)
  }

  /** 画面上の位置 → 画像の位置 */
  const toImagePoint = (clientX: number, clientY: number): Point => {
    const rect = viewportRef.current?.getBoundingClientRect()
    const v = viewRef.current
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (clientX - rect.left - v.x) / v.scale,
      y: (clientY - rect.top - v.y) / v.scale,
    }
  }

  const toViewportPoint = (clientX: number, clientY: number): Point => {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  /** 画面上の点を中心に拡大・縮小する */
  const zoomAt = (center: Point, nextScale: number, base = viewRef.current) => {
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale))
    const worldX = (center.x - base.x) / base.scale
    const worldY = (center.y - base.y) / base.scale
    setView({
      scale,
      x: center.x - worldX * scale,
      y: center.y - worldY * scale,
    })
  }

  const zoomBy = (factor: number) => {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return
    zoomAt(
      { x: rect.width / 2, y: rect.height / 2 },
      viewRef.current.scale * factor,
    )
  }

  const clearPreview = () => {
    const preview = previewCanvasRef.current
    preview?.getContext("2d")?.clearRect(0, 0, preview.width, preview.height)
  }

  const drawLassoPreview = (points: Point[]) => {
    const preview = previewCanvasRef.current
    const ctx = preview?.getContext("2d")
    if (!preview || !ctx || points.length < 2) return
    ctx.clearRect(0, 0, preview.width, preview.height)
    const lineWidth = 2 / viewRef.current.scale
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (const p of points.slice(1)) ctx.lineTo(p.x, p.y)
    ctx.closePath()
    ctx.fillStyle = "rgba(59, 130, 246, 0.25)"
    ctx.fill()
    ctx.setLineDash([6 * lineWidth, 4 * lineWidth])
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = "#fff"
    ctx.stroke()
  }

  /** 描いている途中の操作を取り消す（2 本目の指が触れたとき） */
  const cancelDrawing = () => {
    const gesture = gestureRef.current
    if (gesture.kind !== "draw") return
    clearPreview()
    redrawOverlay(operations)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLoading) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const pointers = pointersRef.current
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.size === 2) {
      cancelDrawing()
      const [a, b] = [...pointers.values()]
      const center = toViewportPoint((a.x + b.x) / 2, (a.y + b.y) / 2)
      gestureRef.current = {
        kind: "pinch",
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        center,
        view: viewRef.current,
      }
      return
    }
    if (pointers.size > 2) return

    const isPan =
      tool === "move" || isSpacePressed || e.button === 1 || e.button === 2
    if (isPan) {
      gestureRef.current = {
        kind: "pan",
        pointerId: e.pointerId,
        start: { x: e.clientX, y: e.clientY },
        view: viewRef.current,
      }
      return
    }
    if (e.button !== 0) return

    const point = toImagePoint(e.clientX, e.clientY)
    const operation: Operation =
      tool === "lasso"
        ? { type: "lasso", points: [point] }
        : {
            type: tool === "eraser" ? "eraser" : "brush",
            width: brushSize / viewRef.current.scale,
            points: [point],
          }
    gestureRef.current = { kind: "draw", pointerId: e.pointerId, operation }
    if (operation.type !== "lasso") {
      const ctx = overlayCanvasRef.current?.getContext("2d")
      if (ctx) drawOperation(ctx, operation, 0)
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current
    if (pointers.has(e.pointerId)) {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    }
    setCursor(toViewportPoint(e.clientX, e.clientY))

    const gesture = gestureRef.current
    if (gesture.kind === "pinch" && pointers.size >= 2) {
      const [a, b] = [...pointers.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      const center = toViewportPoint((a.x + b.x) / 2, (a.y + b.y) / 2)
      const scale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, (gesture.view.scale * distance) / gesture.distance),
      )
      const worldX = (gesture.center.x - gesture.view.x) / gesture.view.scale
      const worldY = (gesture.center.y - gesture.view.y) / gesture.view.scale
      setView({
        scale,
        x: center.x - worldX * scale,
        y: center.y - worldY * scale,
      })
      return
    }
    if (gesture.kind === "pan" && gesture.pointerId === e.pointerId) {
      setView({
        ...gesture.view,
        x: gesture.view.x + e.clientX - gesture.start.x,
        y: gesture.view.y + e.clientY - gesture.start.y,
      })
      return
    }
    if (gesture.kind === "draw" && gesture.pointerId === e.pointerId) {
      const operation = gesture.operation
      if (operation.type === "layer") return
      // 合体したイベントも使って線をなめらかにする
      const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]
      const from = operation.points.length
      for (const event of events) {
        operation.points.push(toImagePoint(event.clientX, event.clientY))
      }
      if (operation.type === "lasso") {
        drawLassoPreview(operation.points)
      } else {
        const ctx = overlayCanvasRef.current?.getContext("2d")
        if (ctx) drawOperation(ctx, operation, from)
      }
    }
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current
    pointers.delete(e.pointerId)
    if (e.pointerType !== "mouse") setCursor(null)
    const gesture = gestureRef.current

    if (gesture.kind === "draw" && gesture.pointerId === e.pointerId) {
      const operation = gesture.operation
      if (operation.type === "lasso") {
        clearPreview()
        if (operation.points.length >= 3) {
          const ctx = overlayCanvasRef.current?.getContext("2d")
          if (ctx) drawOperation(ctx, operation)
          commitOperation(operation)
        }
      } else {
        commitOperation(operation)
      }
      gestureRef.current = { kind: "none" }
      return
    }
    if (gesture.kind === "pinch") {
      // 指が全部離れるまでは塗らない
      gestureRef.current =
        pointers.size === 0 ? { kind: "none" } : { kind: "wait" }
      return
    }
    if (pointers.size === 0) gestureRef.current = { kind: "none" }
  }

  // ホイールで拡大・縮小（passive では preventDefault できないので直接付ける）
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = viewport.getBoundingClientRect()
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002))
      zoomAt(
        { x: e.clientX - rect.left, y: e.clientY - rect.top },
        viewRef.current.scale * factor,
      )
    }
    viewport.addEventListener("wheel", onWheel, { passive: false })
    return () => viewport.removeEventListener("wheel", onWheel)
  }, [])

  // キーボード（PC）: Esc で閉じる、Ctrl+Z で戻す、スペースを押している間はずらす
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase()
      if (tag === "input" || tag === "textarea") return
      if (e.key === "Escape") {
        props.onClose()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault()
        redo()
      } else if (e.key === " ") {
        e.preventDefault()
        setIsSpacePressed(true)
      } else if (e.key === "b") setTool("brush")
      else if (e.key === "l") setTool("lasso")
      else if (e.key === "e") setTool("eraser")
      else if (e.key === "h") setTool("move")
      else if (e.key === "[") setBrushSize((v) => Math.max(4, v - 4))
      else if (e.key === "]") setBrushSize((v) => Math.min(160, v + 4))
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") setIsSpacePressed(false)
    }
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("keyup", onKeyUp)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("keyup", onKeyUp)
    }
  })

  const runAutoMosaic = async () => {
    const image = imageRef.current
    const pixelated = pixelatedRef.current
    if (!image || !pixelated || isAutoRunning) return
    setIsAutoRunning(true)
    try {
      const result = await detectAutoMosaic(image, {
        includeNipples: props.isR18 === true && isAutoNipples,
      })
      if (result.detections.length === 0) {
        toast(
          t(
            "モザイクが必要な所は見つかりませんでした。必要な所は手で塗ってください",
            "Nothing to mosaic was found. Please paint by hand if needed",
          ),
        )
        return
      }
      const operation: Operation = {
        type: "layer",
        layer: createMaskedMosaicLayer(pixelated, result.mask),
      }
      const ctx = overlayCanvasRef.current?.getContext("2d")
      if (ctx) drawOperation(ctx, operation)
      commitOperation(operation)
      toast(
        t(
          `${result.detections.length} か所にモザイクをかけました。足りない所は塗り足してください`,
          `Applied mosaic to ${result.detections.length} area(s). Paint more if needed`,
        ),
      )
    } catch (error) {
      console.error(error)
      toast.error(
        t(
          "自動モザイクに失敗しました。手で塗ってください",
          "Auto mosaic failed. Please paint by hand",
        ),
      )
    } finally {
      setIsAutoRunning(false)
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    const image = imageRef.current
    const overlay = overlayCanvasRef.current
    if (!image || !overlay || isSubmitting) return
    if (operations.length === 0) {
      props.onClose()
      return
    }
    const canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(image, 0, 0)
    ctx.drawImage(overlay, 0, 0)
    setIsSubmitting(true)
    try {
      props.onSubmit(await canvasToWebpDataUrl(canvas))
    } catch (error) {
      console.error(error)
      toast.error(t("画像を書き出せませんでした", "Failed to export the image"))
    } finally {
      canvas.width = 0
      canvas.height = 0
      setIsSubmitting(false)
    }
  }

  const isPanMode = tool === "move" || isSpacePressed
  const isBrushTool = tool === "brush" || tool === "eraser"

  const tools: { value: Tool; label: string; icon: React.ReactNode }[] = [
    {
      value: "brush",
      label: t("ブラシ", "Brush"),
      icon: <BrushIcon className="size-5" />,
    },
    {
      value: "lasso",
      label: t("囲む", "Lasso"),
      icon: <LassoIcon className="size-5" />,
    },
    {
      value: "eraser",
      label: t("消す", "Erase"),
      icon: <EraserIcon className="size-5" />,
    },
    {
      value: "move",
      label: t("移動", "Move"),
      icon: <HandIcon className="size-5" />,
    },
  ]

  const hint =
    tool === "lasso"
      ? t("なぞって囲んだ所にモザイク", "Draw around an area to mosaic it")
      : tool === "move"
        ? t("ドラッグで移動・2本指で拡大", "Drag to move, pinch to zoom")
        : null

  if (!isMounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[300] flex select-none flex-col bg-zinc-950 text-white">
      {/* 上: 閉じる・戻す・やり直す・完了 */}
      <div className="flex h-14 shrink-0 items-center gap-1 border-zinc-800 border-b px-2 pt-[env(safe-area-inset-top)]">
        <Button
          variant="ghost"
          size="icon"
          className="size-11 text-white hover:bg-zinc-800 hover:text-white"
          onClick={props.onClose}
          aria-label={t("閉じる", "Close")}
        >
          <XIcon className="size-6" />
        </Button>
        <div className="flex-1 truncate font-bold text-sm">
          {t("モザイク", "Mosaic")}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 text-white hover:bg-zinc-800 hover:text-white disabled:opacity-30"
          onClick={undo}
          disabled={operations.length === 0}
          aria-label={t("戻す", "Undo")}
          title={t("戻す（Ctrl+Z）", "Undo (Ctrl+Z)")}
        >
          <Undo2Icon className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 text-white hover:bg-zinc-800 hover:text-white disabled:opacity-30"
          onClick={redo}
          disabled={redoStack.length === 0}
          aria-label={t("やり直す", "Redo")}
          title={t("やり直す（Ctrl+Shift+Z）", "Redo (Ctrl+Shift+Z)")}
        >
          <Redo2Icon className="size-5" />
        </Button>
        <Button
          className="ml-1 h-10 rounded-full bg-blue-600 px-5 font-bold text-white hover:bg-blue-700"
          onClick={() => void submit()}
          disabled={isLoading || isSubmitting}
        >
          {isSubmitting && <Loader2Icon className="mr-1 size-4 animate-spin" />}
          {t("完了", "Done")}
        </Button>
      </div>

      {/* 中: 画像 */}
      <div
        ref={viewportRef}
        className={cn(
          "relative flex-1 touch-none overflow-hidden bg-zinc-800",
          isPanMode
            ? "cursor-grab"
            : isBrushTool
              ? "cursor-none"
              : "cursor-crosshair",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setCursor(null)
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className="absolute top-0 left-0 shadow-2xl"
          style={{
            width: size.width,
            height: size.height,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <canvas
            ref={baseCanvasRef}
            width={size.width}
            height={size.height}
            className="absolute inset-0"
          />
          <canvas
            ref={overlayCanvasRef}
            width={size.width}
            height={size.height}
            className={cn("absolute inset-0", isComparing && "invisible")}
          />
          <canvas
            ref={previewCanvasRef}
            width={size.width}
            height={size.height}
            className="absolute inset-0"
          />
        </div>

        {/* ブラシの大きさの丸 */}
        {isBrushTool && !isPanMode && isCursorVisible && !isLoading && (
          <div
            ref={(element) => {
              cursorRef.current = element
              placeCursor(element, cursorPointRef.current)
            }}
            className="pointer-events-none absolute top-0 left-0"
          >
            <div
              className="rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
              style={{
                width: brushSize,
                height: brushSize,
                marginLeft: -brushSize / 2,
                marginTop: -brushSize / 2,
              }}
            />
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2Icon className="size-8 animate-spin text-zinc-400" />
          </div>
        )}

        {/* 自動モザイク（ベータ） */}
        {props.isAutoMosaic && !isLoading && (
          <div
            className="-translate-x-1/2 absolute top-3 left-1/2 flex items-center gap-2 rounded-full bg-zinc-900/90 py-1 pr-3 pl-1 shadow-lg"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              className="h-9 rounded-full bg-blue-600 text-white hover:bg-blue-700"
              disabled={isAutoRunning}
              onClick={runAutoMosaic}
            >
              {isAutoRunning ? (
                <Loader2Icon className="mr-1 size-4 animate-spin" />
              ) : (
                <SparklesIcon className="mr-1 size-4" />
              )}
              {isAutoRunning
                ? t("検出中…", "Detecting…")
                : t("自動モザイク", "Auto mosaic")}
              <span className="ml-1 rounded bg-white/20 px-1 text-[10px]">
                β
              </span>
            </Button>
            {props.isR18 && (
              <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-xs">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={isAutoNipples}
                  onChange={(e) => setIsAutoNipples(e.target.checked)}
                />
                {t("胸部も", "Chest too")}
              </label>
            )}
          </div>
        )}
        {props.isR18 && !isLoading && (
          <p className="-translate-x-1/2 pointer-events-none absolute top-16 left-1/2 w-max max-w-[90%] rounded-full bg-emerald-600/90 px-3 py-1 text-center text-white text-xs shadow">
            {t(
              "R18 作品は投稿するときにも自動でモザイクがかかります",
              "R18 works are also mosaicked automatically when posting",
            )}
          </p>
        )}

        {/* 拡大・縮小・全体・比較 */}
        <div
          className="absolute right-3 bottom-3 flex flex-col gap-2"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full bg-zinc-900/90 shadow-lg active:bg-zinc-700"
            onPointerDown={() => setIsComparing(true)}
            onPointerUp={() => setIsComparing(false)}
            onPointerLeave={() => setIsComparing(false)}
            onPointerCancel={() => setIsComparing(false)}
            aria-label={t("押している間は元の画像", "Hold to see the original")}
            title={t("押している間は元の画像", "Hold to see the original")}
          >
            <EyeIcon className="size-5" />
          </button>
          <button
            type="button"
            className="hidden size-11 items-center justify-center rounded-full bg-zinc-900/90 shadow-lg hover:bg-zinc-700 md:flex"
            onClick={() => zoomBy(1.25)}
            aria-label={t("拡大", "Zoom in")}
          >
            <PlusIcon className="size-5" />
          </button>
          <button
            type="button"
            className="hidden size-11 items-center justify-center rounded-full bg-zinc-900/90 shadow-lg hover:bg-zinc-700 md:flex"
            onClick={() => zoomBy(0.8)}
            aria-label={t("縮小", "Zoom out")}
          >
            <MinusIcon className="size-5" />
          </button>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full bg-zinc-900/90 shadow-lg hover:bg-zinc-700"
            onClick={fitView}
            aria-label={t("全体を表示", "Fit to screen")}
            title={t("全体を表示", "Fit to screen")}
          >
            <MaximizeIcon className="size-5" />
          </button>
        </div>
      </div>

      {/* 下: ブラシの太さとツール */}
      <div className="shrink-0 border-zinc-800 border-t bg-zinc-900 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex h-12 max-w-xl items-center gap-3 px-4">
          {isBrushTool ? (
            <>
              <span className="w-14 shrink-0 text-xs text-zinc-400">
                {t("太さ", "Size")}
              </span>
              <Slider
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                aria-label={t("ブラシの太さ", "Brush size")}
                min={4}
                max={160}
                step={1}
                className="flex-1"
              />
              <div className="flex size-10 shrink-0 items-center justify-center">
                <div
                  className="rounded-full bg-white"
                  style={{
                    width: Math.max(4, Math.min(40, brushSize / 4)),
                    height: Math.max(4, Math.min(40, brushSize / 4)),
                  }}
                />
              </div>
            </>
          ) : (
            <span className="w-full text-center text-xs text-zinc-400">
              {hint}
            </span>
          )}
        </div>
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1 px-2 pb-2">
          {tools.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTool(item.value)}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-xs transition-colors",
                tool === item.value
                  ? "bg-blue-600 text-white"
                  : "text-zinc-300 hover:bg-zinc-800",
              )}
              aria-pressed={tool === item.value}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}
