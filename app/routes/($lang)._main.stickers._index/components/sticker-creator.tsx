import type React from "react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import { Separator } from "~/components/ui/separator"
import {
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  EyeOff,
  Lock,
  MoveDiagonal2,
  Plus,
  Redo2,
  RotateCcw,
  Trash2,
  Undo2,
  Unlock,
  Upload,
  X,
} from "lucide-react"
import {
  stickerAssets,
  type StickerAssetCategory,
} from "~/routes/($lang)._main.stickers._index/components/sticker-assets"

const CANVAS_SIZE = 512

type LayerType = "image" | "text"

type LayerBase = {
  id: string
  type: LayerType
  name: string
  visible: boolean
  locked: boolean
  x: number
  y: number
  scale: number
  rotate: number
  width: number
  height: number
}

type ImageLayer = LayerBase & {
  type: "image"
  src: string
}

type TextLayer = LayerBase & {
  type: "text"
  text: string
  fontSize: number
  fontFamily: string
  color: string
  strokeColor: string
  strokeWidth: number
  vertical: boolean
}

type Layer = ImageLayer | TextLayer

type DragMode = "move" | "scale" | "rotate"

type PanelDragMode = "left" | "right"

type PanelDragState = {
  mode: PanelDragMode
  startX: number
  startLeftWidth: number
  startRightWidth: number
}

type DragState = {
  baseLayers: Layer[]
  layerId: string
  mode: DragMode
  startX: number
  startY: number
  startScale: number
  startRotate: number
  startLayerX: number
  startLayerY: number
  startDistance: number
  startAngle: number
}

type HistoryState = {
  past: Layer[][]
  present: Layer[]
  future: Layer[][]
}

const fontFamilies = [
  { label: "丸み", value: "'M PLUS Rounded 1c', system-ui" },
  { label: "ゴシック", value: "'Noto Sans JP', system-ui" },
  { label: "明朝", value: "'Noto Serif JP', serif" },
  { label: "手書き風", value: "'Yomogi', system-ui" },
]

export function StickerCreator() {
  const [activeCategory, setActiveCategory] =
    useState<StickerAssetCategory>("japanese")
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null)
  const [textInput, setTextInput] = useState("")
  const [backgroundEnabled, setBackgroundEnabled] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [isOpen, setIsOpen] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<
    "assets" | "layers" | "text" | "export"
  >("assets")
  const canvasId = useId()
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [canvasPixelSize, setCanvasPixelSize] = useState<number>(CANVAS_SIZE)
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: [],
    future: [],
  })

  const [leftPanelWidth, setLeftPanelWidth] = useState(320)
  const [rightPanelWidth, setRightPanelWidth] = useState(320)

  const layers = history.present
  const layersRef = useRef(layers)
  const dragRef = useRef<DragState | null>(null)
  const panelDragRef = useRef<PanelDragState | null>(null)

  useEffect(() => {
    layersRef.current = layers
  }, [layers])

  useEffect(() => {
    const element = canvasRef.current
    if (!element) return

    const update = () => {
      const rect = element.getBoundingClientRect()
      setCanvasPixelSize(Math.max(1, rect.width))
    }

    update()

    const ro = new ResizeObserver(() => update())
    ro.observe(element)
    return () => ro.disconnect()
  }, [isOpen])

  const canvasScale = canvasPixelSize / CANVAS_SIZE
  const toCanvasPx = (value: number) => value * canvasScale
  const clampToCanvas = (value: number) =>
    Math.max(0, Math.min(CANVAS_SIZE, value))
  const clampPanelWidth = (value: number) => Math.max(240, Math.min(520, value))

  const commitLayers = (next: Layer[]) => {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: next,
      future: [],
    }))
  }

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  const activeLayer = useMemo(
    () => layers.find((layer) => layer.id === activeLayerId) ?? null,
    [layers, activeLayerId],
  )

  const addImageLayer = async (src: string) => {
    try {
      const { width, height } = await resolveImageSize(src)
      const maxSide = 240
      const scale = Math.min(1, maxSide / Math.max(width, height))
      const id = crypto.randomUUID()
      const newLayer: ImageLayer = {
        id,
        type: "image",
        name: "image",
        visible: true,
        locked: false,
        x: CANVAS_SIZE / 2,
        y: CANVAS_SIZE / 2,
        scale: 1,
        rotate: 0,
        width: Math.max(24, Math.round(width * scale)),
        height: Math.max(24, Math.round(height * scale)),
        src,
      }
      commitLayers([...layersRef.current, newLayer])
      setActiveLayerId(id)
    } catch (error) {
      console.error("Failed to load image", error)
    }
  }

  const addTextLayer = () => {
    if (!textInput.trim()) return
    const id = crypto.randomUUID()
    const newLayer: TextLayer = {
      id,
      type: "text",
      name: "text",
      visible: true,
      locked: false,
      x: CANVAS_SIZE / 2,
      y: CANVAS_SIZE / 2,
      scale: 1,
      rotate: 0,
      width: 260,
      height: 140,
      text: textInput.trim(),
      fontSize: 64,
      fontFamily: fontFamilies[0]?.value ?? "system-ui",
      color: "#000000",
      strokeColor: "#ffffff",
      strokeWidth: 2,
      vertical: false,
    }
    commitLayers([...layersRef.current, newLayer])
    setActiveLayerId(id)
    setTextInput("")
  }

  const onUploadImage = (file: File) => {
    const url = URL.createObjectURL(file)
    addImageLayer(url)
  }

  const updateLayer = (id: string, patch: Partial<Layer>) => {
    const next = layersRef.current.map(
      (layer): Layer =>
        layer.id === id ? ({ ...layer, ...patch } as Layer) : layer,
    )
    layersRef.current = next
    setHistory((prev) => ({
      ...prev,
      present: next,
    }))
  }

  const commitLayerPatch = (id: string, patch: Partial<Layer>) => {
    const next = layersRef.current.map(
      (layer): Layer =>
        layer.id === id ? ({ ...layer, ...patch } as Layer) : layer,
    )
    layersRef.current = next
    commitLayers(next)
  }

  const removeLayer = (id: string) => {
    const next = layersRef.current.filter((layer) => layer.id !== id)
    commitLayers(next)
    if (activeLayerId === id) {
      setActiveLayerId(next.at(-1)?.id ?? null)
    }
  }

  const moveLayer = (id: string, direction: "up" | "down") => {
    const index = layersRef.current.findIndex((layer) => layer.id === id)
    if (index === -1) return
    const next = [...layersRef.current]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= next.length) return
    const [item] = next.splice(index, 1)
    next.splice(targetIndex, 0, item)
    commitLayers(next)
  }

  const handleUndo = () => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev
      const previous = prev.past[prev.past.length - 1]
      const newPast = prev.past.slice(0, -1)
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      }
    })
  }

  const handleRedo = () => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev
      const next = prev.future[0]
      const newFuture = prev.future.slice(1)
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      }
    })
  }

  const handlePointerDown = (
    event: React.PointerEvent<HTMLElement>,
    layer: Layer,
    mode: DragMode,
  ) => {
    if (layer.locked) return
    event.stopPropagation()
    setActiveLayerId(layer.id)
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    const canvasElement = canvasRef.current ?? document.getElementById(canvasId)
    if (!canvasElement) return
    const rect = canvasElement.getBoundingClientRect()
    const scale = rect.width / CANVAS_SIZE
    const centerX = rect.left + layer.x * scale
    const centerY = rect.top + layer.y * scale
    const startX = event.clientX
    const startY = event.clientY
    const startDistance = Math.hypot(startX - centerX, startY - centerY)
    const startAngle = Math.atan2(startY - centerY, startX - centerX)

    dragRef.current = {
      baseLayers: layersRef.current,
      layerId: layer.id,
      mode,
      startX,
      startY,
      startScale: layer.scale,
      startRotate: layer.rotate,
      startLayerX: layer.x,
      startLayerY: layer.y,
      startDistance,
      startAngle,
    }
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (panelDragRef.current) {
      const { mode, startX, startLeftWidth, startRightWidth } =
        panelDragRef.current
      const deltaX = event.clientX - startX
      if (mode === "left") {
        setLeftPanelWidth(clampPanelWidth(startLeftWidth + deltaX))
      }
      if (mode === "right") {
        setRightPanelWidth(clampPanelWidth(startRightWidth - deltaX))
      }
      return
    }
    if (!dragRef.current) return
    const {
      mode,
      startX,
      startY,
      startScale,
      startRotate,
      startLayerX,
      startLayerY,
      startDistance,
      startAngle,
      layerId,
    } = dragRef.current
    const deltaX = event.clientX - startX
    const deltaY = event.clientY - startY

    if (mode === "move") {
      const canvasElement =
        canvasRef.current ?? document.getElementById(canvasId)
      if (!canvasElement) return
      const rect = canvasElement.getBoundingClientRect()
      const scale = rect.width / CANVAS_SIZE

      updateLayer(layerId, {
        x: clampToCanvas(startLayerX + deltaX / scale),
        y: clampToCanvas(startLayerY + deltaY / scale),
      })
      return
    }

    const canvasElement = canvasRef.current ?? document.getElementById(canvasId)
    if (!canvasElement) return
    const rect = canvasElement.getBoundingClientRect()
    const scale = rect.width / CANVAS_SIZE
    const centerX = rect.left + startLayerX * scale
    const centerY = rect.top + startLayerY * scale

    if (mode === "scale") {
      const currentDistance = Math.hypot(
        event.clientX - centerX,
        event.clientY - centerY,
      )
      const nextScale = Math.min(
        5,
        Math.max(0.2, (startScale * currentDistance) / startDistance),
      )
      updateLayer(layerId, { scale: nextScale })
    }

    if (mode === "rotate") {
      const currentAngle = Math.atan2(
        event.clientY - centerY,
        event.clientX - centerX,
      )
      const deltaAngle = currentAngle - startAngle
      const nextRotate = startRotate + (deltaAngle * 180) / Math.PI
      updateLayer(layerId, { rotate: nextRotate })
    }
  }

  const handlePointerUp = () => {
    if (panelDragRef.current) {
      panelDragRef.current = null
      return
    }
    if (!dragRef.current) return
    const baseLayers = dragRef.current.baseLayers
    const nextLayers = layersRef.current
    dragRef.current = null
    if (nextLayers !== baseLayers) {
      setHistory((prev) => ({
        past: [...prev.past, baseLayers],
        present: nextLayers,
        future: [],
      }))
    }
  }

  const handlePanelResizePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    mode: PanelDragMode,
  ) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    panelDragRef.current = {
      mode,
      startX: event.clientX,
      startLeftWidth: leftPanelWidth,
      startRightWidth: rightPanelWidth,
    }
  }

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [])

  const exportCanvas = async (format: "png" | "webp") => {
    const canvas = document.createElement("canvas")
    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (backgroundEnabled) {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    }

    const orderedLayers = [...layers].filter((layer) => layer.visible)

    for (const layer of orderedLayers) {
      ctx.save()
      ctx.translate(layer.x, layer.y)
      ctx.rotate((layer.rotate * Math.PI) / 180)
      ctx.scale(layer.scale, layer.scale)

      if (layer.type === "image") {
        const img = await loadImage(layer.src)
        ctx.drawImage(
          img,
          -layer.width / 2,
          -layer.height / 2,
          layer.width,
          layer.height,
        )
      }

      if (layer.type === "text") {
        ctx.fillStyle = layer.color
        ctx.font = `${layer.fontSize}px ${layer.fontFamily}`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        if (layer.strokeWidth > 0) {
          ctx.strokeStyle = layer.strokeColor
          ctx.lineWidth = layer.strokeWidth
        }
        if (layer.vertical) {
          const chars = layer.text.split("")
          const totalHeight = chars.length * layer.fontSize
          let startY = -totalHeight / 2 + layer.fontSize / 2
          chars.forEach((char) => {
            if (layer.strokeWidth > 0) {
              ctx.strokeText(char, 0, startY)
            }
            ctx.fillText(char, 0, startY)
            startY += layer.fontSize
          })
        } else {
          if (layer.strokeWidth > 0) {
            ctx.strokeText(layer.text, 0, 0)
          }
          ctx.fillText(layer.text, 0, 0)
        }
      }
      ctx.restore()
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `sticker.${format}`
        link.click()
        URL.revokeObjectURL(url)
      },
      `image/${format}`,
      0.95,
    )
  }

  if (!isOpen) {
    return (
      <section className="rounded-xl border bg-background p-4">
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            className="w-full justify-between"
            onClick={() => setIsOpen(true)}
          >
            スタンプを作成する
            <Plus className="h-5 w-5" />
          </Button>
          <p className="text-muted-foreground text-xs">
            素材を追加してドラッグ・回転・拡大縮小ができます。
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold text-lg">スタンプ作成ツール</h2>
          <p className="text-muted-foreground text-sm">
            素材を追加してドラッグ・回転・拡大縮小ができます。
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          閉じる
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <aside
          className="hidden flex-col gap-3 rounded-xl border bg-background p-4 lg:flex"
          style={{ width: `${leftPanelWidth}px` }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">素材一覧</h3>
            <label className="flex items-center gap-2 text-muted-foreground text-xs">
              <Upload className="h-4 w-4" />
              画像追加
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    onUploadImage(file)
                    event.currentTarget.value = ""
                  }
                }}
              />
            </label>
          </div>

          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">カテゴリ</Label>
            <Select
              value={activeCategory}
              onValueChange={(value) =>
                setActiveCategory(value as StickerAssetCategory)
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="japanese">Japanese</SelectItem>
                <SelectItem value="hudemoji">Hudemoji</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="effect">Effect</SelectItem>
                <SelectItem value="parts">Parts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid max-h-[640px] grid-cols-2 gap-2 overflow-auto pr-1">
            {stickerAssets[activeCategory].map((url) => (
              <button
                key={url}
                type="button"
                className="rounded-lg border bg-zinc-800/60 p-2 transition-colors hover:border-primary"
                onClick={() => void addImageLayer(url)}
              >
                <img src={url} alt="" className="w-full" />
              </button>
            ))}
          </div>
        </aside>

        <div
          // biome-ignore lint/nursery/useSortedClasses: keep order for readability
          className="hidden h-[calc(100vh-220px)] w-2 shrink-0 cursor-col-resize select-none touch-none rounded bg-border/70 hover:bg-border lg:block"
          onPointerDown={(event) => handlePanelResizePointerDown(event, "left")}
        />

        <div className="min-w-0 space-y-4 lg:flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/20 p-3">
            <div className="flex flex-wrap items-center gap-3">
              <Label className="text-sm">背景</Label>
              <Switch
                checked={backgroundEnabled}
                onCheckedChange={setBackgroundEnabled}
              />
              <Input
                type="color"
                value={backgroundColor}
                onChange={(event) => setBackgroundColor(event.target.value)}
                className="h-9 w-14 p-1"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => exportCanvas("png")}
              >
                <Download className="mr-1 h-4 w-4" />
                保存
              </Button>
              <Separator
                orientation="vertical"
                className="hidden h-6 sm:block"
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={handleUndo}
                disabled={!canUndo}
              >
                <span className="sr-only">Undo</span>
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleRedo}
                disabled={!canRedo}
              >
                <span className="sr-only">Redo</span>
                <Redo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (activeLayerId) {
                    removeLayer(activeLayerId)
                  }
                }}
                disabled={!activeLayerId}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                削除
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-xl border bg-background p-4">
            <div
              id={canvasId}
              ref={canvasRef}
              className="relative aspect-square w-full max-w-[768px] overflow-hidden rounded-lg border"
              style={{
                backgroundColor: backgroundEnabled
                  ? backgroundColor
                  : "transparent",
                backgroundImage: backgroundEnabled
                  ? "none"
                  : "linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }}
              onPointerDown={() => setActiveLayerId(null)}
            >
              {layers
                .filter((layer) => layer.visible)
                .map((layer) => {
                  const strokeWidthPx =
                    layer.type === "text" ? layer.strokeWidth * canvasScale : 0
                  return (
                    <div
                      key={layer.id}
                      // biome-ignore lint/nursery/useSortedClasses: keep order for readability
                      className="absolute left-0 top-0 select-none touch-none"
                      style={{
                        transform: `translate(${toCanvasPx(layer.x)}px, ${toCanvasPx(layer.y)}px)`,
                        transformOrigin: "top left",
                      }}
                    >
                      <div
                        className={
                          "relative" +
                          (layer.id === activeLayerId
                            ? " outline-2 outline-primary outline-offset-2"
                            : "")
                        }
                        style={{
                          transform: `translate(-50%, -50%) rotate(${layer.rotate}deg) scale(${layer.scale})`,
                          transformOrigin: "center",
                        }}
                        onPointerDown={(event) => {
                          setActiveLayerId(layer.id)
                          handlePointerDown(event, layer, "move")
                        }}
                      >
                        {layer.type === "image" ? (
                          <img
                            src={layer.src}
                            alt={layer.name}
                            className="block"
                            style={{
                              width: `${toCanvasPx(layer.width)}px`,
                              height: `${toCanvasPx(layer.height)}px`,
                            }}
                            draggable={false}
                          />
                        ) : (
                          <div
                            style={{
                              width: `${toCanvasPx(layer.width)}px`,
                              height: `${toCanvasPx(layer.height)}px`,
                              fontSize: `${toCanvasPx(layer.fontSize)}px`,
                              fontFamily: layer.fontFamily,
                              color: layer.color,
                              writingMode: layer.vertical
                                ? "vertical-rl"
                                : "horizontal-tb",
                              textShadow:
                                layer.strokeWidth > 0
                                  ? `0 0 ${strokeWidthPx}px ${layer.strokeColor}, 0 0 ${
                                      strokeWidthPx * 2
                                    }px ${layer.strokeColor}`
                                  : undefined,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              lineHeight: "1.1",
                              padding: "2px",
                            }}
                          >
                            {layer.text}
                          </div>
                        )}
                        {layer.id === activeLayerId && !layer.locked && (
                          <>
                            <button
                              type="button"
                              // biome-ignore lint/nursery/useSortedClasses: keep order for readability
                              className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full border bg-background shadow"
                              onPointerDown={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                removeLayer(layer.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              // biome-ignore lint/nursery/useSortedClasses: keep order for readability
                              className="absolute right-1 top-1 h-6 w-6 rounded-full border bg-background shadow"
                              onPointerDown={(event) =>
                                handlePointerDown(event, layer, "rotate")
                              }
                            >
                              <RotateCcw className="mx-auto h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              // biome-ignore lint/nursery/useSortedClasses: keep order for readability
                              className="absolute bottom-1 right-1 h-6 w-6 rounded-full border bg-background shadow"
                              onPointerDown={(event) =>
                                handlePointerDown(event, layer, "scale")
                              }
                            >
                              <MoveDiagonal2 className="mx-auto h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>

            <p className="text-muted-foreground text-xs">
              レイヤーをドラッグで移動。右上で回転、右下で拡大縮小。
            </p>
          </div>

          <div className="rounded-xl border bg-background p-4 lg:hidden">
            <Tabs
              value={mobilePanel}
              onValueChange={(v) => setMobilePanel(v as typeof mobilePanel)}
            >
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="assets">素材</TabsTrigger>
                <TabsTrigger value="layers">レイヤー</TabsTrigger>
                <TabsTrigger value="text">文字</TabsTrigger>
                <TabsTrigger value="export">出力</TabsTrigger>
              </TabsList>
              <TabsContent value="assets" className="mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">素材一覧</h3>
                  <label className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Upload className="h-4 w-4" />
                    画像追加
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) {
                          onUploadImage(file)
                          event.currentTarget.value = ""
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="mt-3 space-y-1">
                  <Label className="text-muted-foreground text-xs">
                    カテゴリ
                  </Label>
                  <Select
                    value={activeCategory}
                    onValueChange={(value) =>
                      setActiveCategory(value as StickerAssetCategory)
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="hudemoji">Hudemoji</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="effect">Effect</SelectItem>
                      <SelectItem value="parts">Parts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-3 grid max-h-[50vh] grid-cols-3 gap-2 overflow-auto pr-1">
                  {stickerAssets[activeCategory].map((url) => (
                    <button
                      key={url}
                      type="button"
                      className="rounded-lg border bg-zinc-800/60 p-2 transition-colors hover:border-primary"
                      onClick={() => void addImageLayer(url)}
                    >
                      <img src={url} alt="" className="w-full" />
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="layers" className="mt-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">レイヤー</h3>
                  <div className="space-y-2">
                    {layers.map((layer, index) => (
                      <div
                        key={layer.id}
                        className={
                          "flex items-center justify-between gap-2 rounded-lg border px-2 py-1 " +
                          (layer.id === activeLayerId
                            ? "border-primary"
                            : "border-transparent")
                        }
                      >
                        <div className="flex flex-1 items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 overflow-hidden"
                            onClick={() => setActiveLayerId(layer.id)}
                          >
                            <span className="sr-only">Select layer</span>
                            {layer.type === "image" ? (
                              <img
                                src={layer.src}
                                alt=""
                                className="h-9 w-9 rounded object-cover"
                                draggable={false}
                              />
                            ) : (
                              <div
                                // biome-ignore lint/nursery/useSortedClasses: keep order for readability
                                className="grid h-9 w-9 place-items-center rounded bg-muted text-[10px] font-semibold"
                              >
                                T
                              </div>
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(event) => {
                              event.stopPropagation()
                              commitLayerPatch(layer.id, {
                                visible: !layer.visible,
                              })
                            }}
                          >
                            {layer.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(event) => {
                              event.stopPropagation()
                              commitLayerPatch(layer.id, {
                                locked: !layer.locked,
                              })
                            }}
                          >
                            {layer.locked ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </Button>
                          {layer.type === "text" && (
                            <span className="truncate text-xs">
                              {layer.text}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(event) => {
                              event.stopPropagation()
                              moveLayer(layer.id, "up")
                            }}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(event) => {
                              event.stopPropagation()
                              moveLayer(layer.id, "down")
                            }}
                            disabled={index === layers.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(event) => {
                              event.stopPropagation()
                              removeLayer(layer.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {layers.length === 0 && (
                      <p className="text-muted-foreground text-xs">
                        まだレイヤーがありません
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">テキスト</h3>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={textInput}
                      onChange={(event) => setTextInput(event.target.value)}
                      placeholder="テキストを入力"
                    />
                    <Button onClick={addTextLayer} className="shrink-0">
                      追加
                    </Button>
                  </div>
                  {activeLayer?.type === "text" ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">文字サイズ</Label>
                          <Input
                            type="number"
                            value={activeLayer.fontSize}
                            onChange={(event) =>
                              updateLayer(activeLayer.id, {
                                fontSize: Number(event.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">フォント</Label>
                          <select
                            className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                            value={activeLayer.fontFamily}
                            onChange={(event) =>
                              updateLayer(activeLayer.id, {
                                fontFamily: event.target.value,
                              })
                            }
                          >
                            {fontFamilies.map((font) => (
                              <option key={font.value} value={font.value}>
                                {font.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">文字色</Label>
                          <Input
                            type="color"
                            value={activeLayer.color}
                            onChange={(event) =>
                              updateLayer(activeLayer.id, {
                                color: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">縁取り色</Label>
                          <Input
                            type="color"
                            value={activeLayer.strokeColor}
                            onChange={(event) =>
                              updateLayer(activeLayer.id, {
                                strokeColor: event.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">縁取り幅</Label>
                          <Input
                            type="number"
                            value={activeLayer.strokeWidth}
                            onChange={(event) =>
                              updateLayer(activeLayer.id, {
                                strokeWidth: Number(event.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <Switch
                            checked={activeLayer.vertical}
                            onCheckedChange={(value) =>
                              updateLayer(activeLayer.id, { vertical: value })
                            }
                          />
                          <Label className="text-xs">縦書き</Label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      テキストレイヤーを選択すると編集できます
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="export" className="mt-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">出力</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <Label className="text-sm">背景</Label>
                    <Switch
                      checked={backgroundEnabled}
                      onCheckedChange={setBackgroundEnabled}
                    />
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(event) =>
                        setBackgroundColor(event.target.value)
                      }
                      className="h-9 w-14 p-1"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => exportCanvas("png")}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      保存
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div
          // biome-ignore lint/nursery/useSortedClasses: keep order for readability
          className="hidden h-[calc(100vh-220px)] w-2 shrink-0 cursor-col-resize select-none touch-none rounded bg-border/70 hover:bg-border lg:block"
          onPointerDown={(event) =>
            handlePanelResizePointerDown(event, "right")
          }
        />

        <aside
          className="hidden flex-col gap-4 rounded-xl border bg-background p-4 lg:flex"
          style={{ width: `${rightPanelWidth}px` }}
        >
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">レイヤー</h3>
            <div className="space-y-2">
              {layers.map((layer, index) => (
                <div
                  key={layer.id}
                  className={
                    "flex items-center justify-between gap-2 rounded-lg border px-2 py-1 " +
                    (layer.id === activeLayerId
                      ? "border-primary"
                      : "border-transparent")
                  }
                >
                  <div className="flex flex-1 items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 overflow-hidden"
                      onClick={() => setActiveLayerId(layer.id)}
                    >
                      <span className="sr-only">Select layer</span>
                      {layer.type === "image" ? (
                        <img
                          src={layer.src}
                          alt=""
                          className="h-9 w-9 rounded object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div
                          // biome-ignore lint/nursery/useSortedClasses: keep order for readability
                          className="grid h-9 w-9 place-items-center rounded bg-muted text-[10px] font-semibold"
                        >
                          T
                        </div>
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation()
                        commitLayerPatch(layer.id, {
                          visible: !layer.visible,
                        })
                      }}
                    >
                      {layer.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation()
                        commitLayerPatch(layer.id, {
                          locked: !layer.locked,
                        })
                      }}
                    >
                      {layer.locked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Unlock className="h-4 w-4" />
                      )}
                    </Button>
                    {layer.type === "text" && (
                      <span className="truncate text-xs">{layer.text}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation()
                        moveLayer(layer.id, "up")
                      }}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation()
                        moveLayer(layer.id, "down")
                      }}
                      disabled={index === layers.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation()
                        removeLayer(layer.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {layers.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  まだレイヤーがありません
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">テキスト</h3>
            <div className="flex flex-col gap-2">
              <Input
                value={textInput}
                onChange={(event) => setTextInput(event.target.value)}
                placeholder="テキストを入力"
              />
              <Button onClick={addTextLayer}>追加</Button>
            </div>

            {activeLayer?.type === "text" ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">文字サイズ</Label>
                  <Input
                    type="number"
                    value={activeLayer.fontSize}
                    onChange={(event) =>
                      updateLayer(activeLayer.id, {
                        fontSize: Number(event.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">フォント</Label>
                  <select
                    className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                    value={activeLayer.fontFamily}
                    onChange={(event) =>
                      updateLayer(activeLayer.id, {
                        fontFamily: event.target.value,
                      })
                    }
                  >
                    {fontFamilies.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">文字色</Label>
                    <Input
                      type="color"
                      value={activeLayer.color}
                      onChange={(event) =>
                        updateLayer(activeLayer.id, {
                          color: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">縁取り色</Label>
                    <Input
                      type="color"
                      value={activeLayer.strokeColor}
                      onChange={(event) =>
                        updateLayer(activeLayer.id, {
                          strokeColor: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">縁取り幅</Label>
                    <Input
                      type="number"
                      value={activeLayer.strokeWidth}
                      onChange={(event) =>
                        updateLayer(activeLayer.id, {
                          strokeWidth: Number(event.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={activeLayer.vertical}
                      onCheckedChange={(value) =>
                        updateLayer(activeLayer.id, { vertical: value })
                      }
                    />
                    <Label className="text-xs">縦書き</Label>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                テキストレイヤーを選択すると編集できます
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const resolveImageSize = async (src: string) => {
  const img = await loadImage(src)
  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
  }
}
