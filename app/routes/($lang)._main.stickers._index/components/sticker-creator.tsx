import type React from "react"
import { useEffect, useId, useMemo, useRef, useState } from "react"

import "@fontsource/m-plus-rounded-1c/400.css"
import "@fontsource/m-plus-rounded-1c/100.css"
import "@fontsource/m-plus-rounded-1c/300.css"
import "@fontsource/m-plus-rounded-1c/500.css"
import "@fontsource/m-plus-rounded-1c/700.css"
import "@fontsource/m-plus-rounded-1c/800.css"
import "@fontsource/m-plus-rounded-1c/900.css"
import "@fontsource/noto-sans-jp/400.css"
import "@fontsource/noto-sans-jp/100.css"
import "@fontsource/noto-sans-jp/200.css"
import "@fontsource/noto-sans-jp/300.css"
import "@fontsource/noto-sans-jp/500.css"
import "@fontsource/noto-sans-jp/600.css"
import "@fontsource/noto-sans-jp/700.css"
import "@fontsource/noto-sans-jp/800.css"
import "@fontsource/noto-sans-jp/900.css"
import "@fontsource/noto-serif-jp/400.css"
import "@fontsource/noto-serif-jp/200.css"
import "@fontsource/noto-serif-jp/300.css"
import "@fontsource/noto-serif-jp/500.css"
import "@fontsource/noto-serif-jp/600.css"
import "@fontsource/noto-serif-jp/700.css"
import "@fontsource/noto-serif-jp/800.css"
import "@fontsource/noto-serif-jp/900.css"
import "@fontsource/yomogi/400.css"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
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
  Loader2,
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
import { toast } from "sonner"
import {
  stickerAssets,
  type StickerAssetCategory,
} from "~/routes/($lang)._main.stickers._index/components/sticker-assets"
import { AddStickerDialog } from "~/routes/($lang)._main.posts.$post._index/components/add-sticker-dialog"

const CANVAS_SIZE = 512

const isRemoteHttpUrl = (src: string) =>
  src.startsWith("https://") || src.startsWith("http://")

const toCanvasSafeImageUrl = (src: string) => {
  if (!isRemoteHttpUrl(src)) return src
  return `/api/proxy-image?url=${encodeURIComponent(src)}`
}

type LayerType = "image" | "text"

type LayerSparkleEffect = {
  enabled?: boolean
  intensity?: number
}

type LayerEffects = {
  blur?: number
  invert?: boolean
  sparkle?: LayerSparkleEffect
}

const clampNumber = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const normalizeLayerEffects = (effects?: LayerEffects) => {
  const blur = clampNumber(effects?.blur ?? 0, 0, 20)
  const invert = effects?.invert ?? false
  const sparkleEnabled = effects?.sparkle?.enabled ?? false
  const sparkleIntensity = clampNumber(effects?.sparkle?.intensity ?? 0.6, 0, 1)
  return {
    blur,
    invert,
    sparkle: {
      enabled: sparkleEnabled,
      intensity: sparkleIntensity,
    },
  }
}

const buildCssFilter = (effects?: LayerEffects) => {
  const e = normalizeLayerEffects(effects)
  const parts: string[] = []
  if (e.blur > 0) parts.push(`blur(${e.blur}px)`)
  if (e.invert) parts.push("invert(1)")
  return parts.length === 0 ? undefined : parts.join(" ")
}

const hashStringToUint32 = (value: string) => {
  // FNV-1a
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const mulberry32 = (seed: number) => {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const drawSparklesOnCanvas = (props: {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  layerId: string
  intensity: number
}) => {
  const intensity = clampNumber(props.intensity, 0, 1)
  if (intensity <= 0) return

  const rand = mulberry32(hashStringToUint32(props.layerId))
  const area = Math.max(1, props.width * props.height)
  const normalizedArea = area / (CANVAS_SIZE * CANVAS_SIZE)
  const count = Math.round((8 + intensity * 28) * normalizedArea)
  if (count <= 0) return

  const ctx = props.ctx
  const prevComposite = ctx.globalCompositeOperation
  ctx.globalCompositeOperation = "lighter"

  const minSide = Math.max(1, Math.min(props.width, props.height))
  const baseSize = minSide * (0.03 + 0.05 * intensity)

  const drawStar = (x: number, y: number, size: number, alpha: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rand() * Math.PI)
    ctx.fillStyle = `rgba(255,255,255,${alpha})`
    ctx.beginPath()
    ctx.moveTo(0, -size)
    ctx.lineTo(size * 0.35, -size * 0.35)
    ctx.lineTo(size, 0)
    ctx.lineTo(size * 0.35, size * 0.35)
    ctx.lineTo(0, size)
    ctx.lineTo(-size * 0.35, size * 0.35)
    ctx.lineTo(-size, 0)
    ctx.lineTo(-size * 0.35, -size * 0.35)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  for (let i = 0; i < count; i += 1) {
    const x = (rand() - 0.5) * props.width
    const y = (rand() - 0.5) * props.height
    const size = baseSize * (0.4 + rand() * 0.9)
    const alpha = 0.15 + 0.45 * intensity * rand()
    drawStar(x, y, size, alpha)
  }

  ctx.globalCompositeOperation = prevComposite
}

type LayerBase = {
  id: string
  type: LayerType
  name: string
  visible: boolean
  locked: boolean
  effects?: LayerEffects
  x: number
  y: number
  scale: number
  rotate: number
  width: number
  height: number
  flipX?: boolean
  flipY?: boolean
  scaleX?: number
  scaleY?: number
  // degrees
  skewX?: number
  skewY?: number
}

type ImageLayer = LayerBase & {
  type: "image"
  src: string
  removeColorBackground?: boolean
  colorKey?: string
  colorThreshold?: number
  transparentSrc?: string
}

type TextLayer = LayerBase & {
  type: "text"
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: number
  color: string
  strokeColor: string
  strokeWidth: number
  vertical: boolean
}

type Layer = ImageLayer | TextLayer

function LayerSparkleOverlay(props: { layerId: string; intensity: number }) {
  const intensity = clampNumber(props.intensity, 0, 1)
  const sparkles = useMemo(() => {
    if (intensity <= 0) return []
    const rand = mulberry32(hashStringToUint32(props.layerId))
    const count = Math.round(6 + intensity * 22)
    const items: Array<{
      x: number
      y: number
      size: number
      rot: number
      opacity: number
    }> = []
    for (let i = 0; i < count; i += 1) {
      items.push({
        x: rand() * 100,
        y: rand() * 100,
        size: 6 + rand() * 14,
        rot: rand() * 360,
        opacity: 0.2 + rand() * 0.45,
      })
    }
    return items
  }, [props.layerId, intensity])

  if (sparkles.length === 0) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ mixBlendMode: "screen" }}
    >
      {sparkles.map((s, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: stable by seed; index is fine here
          key={i}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
            backgroundColor: `rgba(255,255,255,${s.opacity})`,
            clipPath:
              "polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%)",
            filter: "drop-shadow(0 0 6px rgba(255,255,255,0.55))",
          }}
        />
      ))}
    </div>
  )
}

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

type FontFamilyOption = {
  label: string
  value: string
  weights: number[]
}

const fontFamilies: FontFamilyOption[] = [
  {
    label: "丸み",
    value: "'M PLUS Rounded 1c', system-ui",
    weights: [400, 700, 900],
  },
  {
    label: "ゴシック",
    value: "'Noto Sans JP', system-ui",
    weights: [400, 700, 900],
  },
  {
    label: "明朝",
    value: "'Noto Serif JP', serif",
    weights: [400, 700, 900],
  },
  { label: "手書き風", value: "'Yomogi', system-ui", weights: [400] },
]

const DEFAULT_TEXT_FONT_WEIGHT = 400

const getFontWeightsForFamily = (fontFamily: string) => {
  return (
    fontFamilies.find((f) => f.value === fontFamily)?.weights ?? [
      DEFAULT_TEXT_FONT_WEIGHT,
    ]
  )
}

const normalizeFontWeightForFamily = (props: {
  fontFamily: string
  fontWeight: number
}) => {
  const weights = getFontWeightsForFamily(props.fontFamily)
  if (weights.length === 0) return DEFAULT_TEXT_FONT_WEIGHT
  if (weights.includes(props.fontWeight)) return props.fontWeight

  // 近いウェイトへスナップ（スライダー100刻みでもフォント側が未対応の値があり得るため）
  let nearest = weights[0] ?? DEFAULT_TEXT_FONT_WEIGHT
  let nearestDiff = Math.abs(nearest - props.fontWeight)
  for (const weight of weights) {
    const diff = Math.abs(weight - props.fontWeight)
    if (diff < nearestDiff) {
      nearest = weight
      nearestDiff = diff
    }
  }
  return nearest
}

const clampFontWeight = (weight: number) =>
  Math.max(100, Math.min(900, Math.round(weight / 100) * 100))

const splitLines = (text: string) => text.split(/\r?\n/)

const toVerticalColumns = (text: string) => {
  const lines = splitLines(text)
  if (lines.length <= 1) return lines

  // 1行=1文字（例: あ\nい\nう…）の場合は、ユーザーが期待する
  // 「1列で縦に積む」表現として扱う（CSSだと改行が列送りになってしまうため）。
  const isSingleGlyphLines = lines.every((line) => Array.from(line).length <= 1)
  if (!isSingleGlyphLines) return lines

  const joined = lines.map((line) => (line.length === 0 ? "　" : line)).join("")
  return [joined]
}

const normalizeVerticalPreviewText = (text: string) => {
  const cols = toVerticalColumns(text)
  // 1列に正規化された場合のみ改行を除去
  if (cols.length === 1) return cols[0] ?? ""
  return text
}

const computeTextLayerBox = (props: {
  text: string
  fontSize: number
  vertical: boolean
}) => {
  const fontSize = Math.max(8, props.fontSize)
  const padding = 12
  const lineHeight = fontSize * 1.1

  if (props.vertical) {
    const columns = toVerticalColumns(props.text)
    const columnCount = Math.max(1, columns.length)
    const glyphCounts = columns.map((col) => Array.from(col).length)
    const maxGlyphs = Math.max(1, ...glyphCounts)

    const width = Math.round(columnCount * lineHeight + padding)
    const height = Math.round(maxGlyphs * lineHeight + padding)

    return {
      width: Math.max(48, Math.min(CANVAS_SIZE, width)),
      height: Math.max(48, Math.min(CANVAS_SIZE, height)),
    }
  }

  // 横書きは従来の箱をベースにしつつ、複数行の場合は高さだけ少し伸ばす
  const lines = splitLines(props.text)
  const lineCount = Math.max(1, lines.length)
  const height = Math.round(Math.max(140, lineCount * lineHeight + padding))
  return {
    width: 260,
    height: Math.max(48, Math.min(CANVAS_SIZE, height)),
  }
}

const ensureFontLoaded = async (props: {
  fontFamily: string
  fontSize: number
  fontWeight: number
}) => {
  if (typeof document === "undefined") return
  if (!document.fonts?.load) return

  const cssFont = `${Math.max(1, Math.round(props.fontWeight))} ${Math.max(
    1,
    Math.round(props.fontSize),
  )}px ${props.fontFamily}`
  try {
    await Promise.race([
      document.fonts.load(cssFont),
      new Promise<void>((resolve) => setTimeout(resolve, 800)),
    ])
  } catch {
    // ignore
  }
}

const getCanvasBaselineOffsetInLineBox = (props: {
  ctx: CanvasRenderingContext2D
  lineHeight: number
  fontSize: number
}) => {
  // CSSのline-heightは (line-height - (ascent+descent)) の余白を上下に半分ずつ配る。
  // Canvasはbaseline座標で描画できるので、line box topからのbaselineオフセットを推定する。
  const sample = "あ"
  const metrics = props.ctx.measureText(sample)
  const ascent =
    metrics.actualBoundingBoxAscent > 0
      ? metrics.actualBoundingBoxAscent
      : props.fontSize * 0.8
  const descent =
    metrics.actualBoundingBoxDescent > 0
      ? metrics.actualBoundingBoxDescent
      : props.fontSize * 0.2
  const emHeight = ascent + descent
  const leading = Math.max(0, props.lineHeight - emHeight)
  return ascent + leading / 2
}

const drawMultilineText = (props: {
  ctx: CanvasRenderingContext2D
  text: string
  lineHeight: number
  draw: (line: string, x: number, y: number) => void
}) => {
  const lines = splitLines(props.text)
  const count = lines.length
  const totalHeight = (count - 1) * props.lineHeight
  const startY = -totalHeight / 2

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? ""
    props.draw(line, 0, startY + i * props.lineHeight)
  }
}

const drawVerticalText = (props: {
  ctx: CanvasRenderingContext2D
  text: string
  columnAdvance: number
  lineHeight: number
  baselineOffset: number
  draw: (glyph: string, x: number, y: number) => void
}) => {
  // CSS writing-mode: vertical-rl 相当
  // - 改行(\n)は「列」
  // - 列は右→左に進む
  const columns = toVerticalColumns(props.text)
  const columnCount = columns.length
  const totalWidth = (columnCount - 1) * props.columnAdvance
  const startX = totalWidth / 2

  const glyphCounts = columns.map((col) => Array.from(col).length)
  const maxGlyphs = Math.max(1, ...glyphCounts)
  const blockHeight = maxGlyphs * props.lineHeight
  const startTop = -blockHeight / 2

  for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
    const colText = columns[colIndex] ?? ""
    const glyphs = Array.from(colText)
    const x = startX - colIndex * props.columnAdvance

    for (let i = 0; i < glyphs.length; i += 1) {
      const glyph = glyphs[i] ?? ""
      const y = startTop + props.baselineOffset + i * props.lineHeight
      props.draw(glyph, x, y)
    }
  }
}

export function StickerCreator () {
  const [activeCategory, setActiveCategory] =
    useState<StickerAssetCategory>("japanese")
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null)
  const [textInput, setTextInput] = useState("")
  const [newTextFontFamily, setNewTextFontFamily] = useState(
    fontFamilies[0]?.value ?? "system-ui",
  )
  const [newTextFontWeight, setNewTextFontWeight] = useState<number>(
    DEFAULT_TEXT_FONT_WEIGHT,
  )
  const [newTextVertical, setNewTextVertical] = useState(false)

  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [registerImageBase64, setRegisterImageBase64] = useState("")
  const [isRegisterPreparing, setIsRegisterPreparing] = useState(false)
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

  const [colorRemovalBusy, setColorRemovalBusy] = useState<
    Record<string, boolean>
  >({})
  const [colorRemovalError, setColorRemovalError] = useState<string | null>(
    null,
  )
  const [colorRemovalAllBusy, setColorRemovalAllBusy] = useState(false)

  const colorRemovalBusyRef = useRef<Record<string, boolean>>({})
  const colorRemovalAllBusyRef = useRef(false)
  const colorRemovalDebounceRef = useRef<
    Record<string, ReturnType<typeof setTimeout> | null>
  >({})

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
    colorRemovalBusyRef.current = colorRemovalBusy
  }, [colorRemovalBusy])

  useEffect(() => {
    colorRemovalAllBusyRef.current = colorRemovalAllBusy
  }, [colorRemovalAllBusy])

  useEffect(() => {
    return () => {
      for (const timer of Object.values(colorRemovalDebounceRef.current)) {
        if (timer) {
          clearTimeout(timer)
        }
      }
    }
  }, [])

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

  const scheduleColorRemoval = (layerId: string) => {
    const prev = colorRemovalDebounceRef.current[layerId]
    if (prev) {
      clearTimeout(prev)
    }
    colorRemovalDebounceRef.current[layerId] = setTimeout(() => {
      if (colorRemovalAllBusyRef.current) return
      if (colorRemovalBusyRef.current[layerId] === true) return
      void applyColorRemovalToLayer(layerId)
    }, 350)
  }

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
      const { width, height } = await resolveImageSize(
        toCanvasSafeImageUrl(src),
      )
      const maxSide = 240
      const scale = Math.min(1, maxSide / Math.max(width, height))
      const id = crypto.randomUUID()
      const newLayer: ImageLayer = {
        id,
        type: "image",
        name: "image",
        visible: true,
        locked: false,
        effects: {
          blur: 0,
          invert: false,
          sparkle: { enabled: false, intensity: 0.6 },
        },
        x: CANVAS_SIZE / 2,
        y: CANVAS_SIZE / 2,
        scale: 1,
        rotate: 0,
        width: Math.max(24, Math.round(width * scale)),
        height: Math.max(24, Math.round(height * scale)),
        flipX: false,
        flipY: false,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
        src,
        removeColorBackground: false,
        colorKey: "#ffffff",
        colorThreshold: 40,
        transparentSrc: undefined,
      }
      commitLayers([...layersRef.current, newLayer])
      setActiveLayerId(id)
    } catch (error) {
      console.error("Failed to load image", error)
    }
  }

  const getImageLayerSrc = (layer: ImageLayer) => {
    if (!layer.removeColorBackground) return layer.src
    return layer.transparentSrc ?? layer.src
  }

  const applyColorRemovalToLayer = async (layerId: string) => {
    const target = layersRef.current.find(
      (layer): layer is ImageLayer =>
        layer.id === layerId && layer.type === "image",
    )
    if (!target) return

    setColorRemovalError(null)
    setColorRemovalBusy((prev) => ({ ...prev, [layerId]: true }))
    try {
      const threshold = Math.max(0, Math.min(160, target.colorThreshold ?? 40))
      const colorKey = normalizeHexColor(target.colorKey ?? "#ffffff")

      // まずはUI上のON/しきい値を即反映（履歴は増やさない）
      updateLayer(layerId, {
        removeColorBackground: true,
        colorKey,
        colorThreshold: threshold,
      })

      const transparentSrc = await createColorKeyTransparentObjectUrl({
        src: target.src,
        colorKey,
        threshold,
      })
      commitLayerPatch(layerId, {
        removeColorBackground: true,
        colorKey,
        colorThreshold: threshold,
        transparentSrc,
      })
    } catch (error) {
      console.error("Failed to apply color removal", error)
      updateLayer(layerId, { removeColorBackground: false })
      setColorRemovalError(
        "色透過に失敗しました（外部画像はCORS制約で処理できない場合があります）",
      )
    } finally {
      setColorRemovalBusy((prev) => ({ ...prev, [layerId]: false }))
    }
  }

  const clearColorRemovalForLayer = (layerId: string) => {
    commitLayerPatch(layerId, { removeColorBackground: false })
  }

  const applyColorRemovalToAllImageLayers = async (props: {
    colorKey: string
    threshold: number
  }) => {
    const baseLayers = layersRef.current
    const imageLayers = baseLayers.filter(
      (layer): layer is ImageLayer => layer.type === "image",
    )
    if (imageLayers.length === 0) return

    const colorKey = normalizeHexColor(props.colorKey)
    const threshold = Math.max(0, Math.min(160, props.threshold))

    setColorRemovalAllBusy(true)
    setColorRemovalError(null)

    let nextLayers: Layer[] = baseLayers
    let failed = 0
    for (const layer of imageLayers) {
      try {
        const transparentSrc = await createColorKeyTransparentObjectUrl({
          src: layer.src,
          colorKey,
          threshold,
        })
        nextLayers = nextLayers.map((current): Layer => {
          if (current.id !== layer.id || current.type !== "image")
            return current
          return {
            ...current,
            removeColorBackground: true,
            colorKey,
            colorThreshold: threshold,
            transparentSrc,
          }
        })
      } catch (error) {
        console.error("Failed to apply color removal", error)
        failed += 1
      }
    }

    commitLayers(nextLayers)
    setColorRemovalAllBusy(false)

    if (failed > 0) {
      setColorRemovalError(
        `一部の画像で色透過に失敗しました（${failed}件）。外部画像はCORS制約で処理できない場合があります。`,
      )
    }
  }

  const addTextLayer = () => {
    if (!textInput.trim()) return
    const box = computeTextLayerBox({
      text: textInput.trim(),
      fontSize: 64,
      vertical: newTextVertical,
    })
    const id = crypto.randomUUID()
    const fontWeight = normalizeFontWeightForFamily({
      fontFamily: newTextFontFamily,
      fontWeight: newTextFontWeight,
    })
    const newLayer: TextLayer = {
      id,
      type: "text",
      name: "text",
      visible: true,
      locked: false,
      effects: {
        blur: 0,
        invert: false,
        sparkle: { enabled: false, intensity: 0.6 },
      },
      x: CANVAS_SIZE / 2,
      y: CANVAS_SIZE / 2,
      scale: 1,
      rotate: 0,
      width: box.width,
      height: box.height,
      flipX: false,
      flipY: false,
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      skewY: 0,
      text: textInput.trim(),
      fontSize: 64,
      fontFamily: newTextFontFamily,
      fontWeight,
      color: "#000000",
      strokeColor: "#ffffff",
      strokeWidth: 2,
      vertical: newTextVertical,
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

  const updateLayerEffects = (id: string, patch: Partial<LayerEffects>) => {
    const current = layersRef.current.find((l) => l.id === id)
    const nextEffects: LayerEffects = {
      ...(current?.effects ?? {}),
      ...patch,
      sparkle: {
        ...(current?.effects?.sparkle ?? {}),
        ...(patch.sparkle ?? {}),
      },
    }
    updateLayer(id, { effects: nextEffects })
  }

  const commitLayerEffects = (id: string, patch: Partial<LayerEffects>) => {
    const current = layersRef.current.find((l) => l.id === id)
    const nextEffects: LayerEffects = {
      ...(current?.effects ?? {}),
      ...patch,
      sparkle: {
        ...(current?.effects?.sparkle ?? {}),
        ...(patch.sparkle ?? {}),
      },
    }
    commitLayerPatch(id, { effects: nextEffects })
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

  const duplicateLayer = (id: string) => {
    const source = layersRef.current.find((layer) => layer.id === id)
    if (!source) return

    const nextId = crypto.randomUUID()
    const offset = 16
    const nextLayer: Layer = {
      ...source,
      id: nextId,
      name: `${source.name} copy`,
      locked: false,
      x: clampToCanvas(source.x + offset),
      y: clampToCanvas(source.y + offset),
    }

    commitLayers([...layersRef.current, nextLayer])
    setActiveLayerId(nextId)
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

  const createExportCanvas = async () => {
    const canvas = document.createElement("canvas")
    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    if (backgroundEnabled) {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    }

    const orderedLayers = [...layers].filter((layer) => layer.visible)

    for (const layer of orderedLayers) {
      ctx.save()
      ctx.translate(layer.x, layer.y)
      ctx.rotate((layer.rotate * Math.PI) / 180)
      const sx = (layer.scaleX ?? 1) * layer.scale * (layer.flipX ? -1 : 1)
      const sy = (layer.scaleY ?? 1) * layer.scale * (layer.flipY ? -1 : 1)
      const skewX = ((layer.skewX ?? 0) * Math.PI) / 180
      const skewY = ((layer.skewY ?? 0) * Math.PI) / 180
      // shear matrix
      ctx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0)
      ctx.scale(sx, sy)

      const normalizedEffects = normalizeLayerEffects(layer.effects)
      const layerFilter = buildCssFilter(layer.effects) ?? "none"

      if (layer.type === "image") {
        const img = await loadImage(toCanvasSafeImageUrl(layer.src))
        const threshold = layer.colorThreshold ?? 40
        const colorKey = normalizeHexColor(layer.colorKey ?? "#ffffff")
        if (layer.removeColorBackground) {
          try {
            const processedCanvas = createColorKeyTransparentCanvas({
              img,
              colorKey,
              threshold,
            })
            ctx.filter = layerFilter
            ctx.drawImage(
              processedCanvas,
              -layer.width / 2,
              -layer.height / 2,
              layer.width,
              layer.height,
            )
          } catch (error) {
            console.error("Failed to process image for export", error)
            ctx.filter = layerFilter
            ctx.drawImage(
              img,
              -layer.width / 2,
              -layer.height / 2,
              layer.width,
              layer.height,
            )
          }
        } else {
          ctx.filter = layerFilter
          ctx.drawImage(
            img,
            -layer.width / 2,
            -layer.height / 2,
            layer.width,
            layer.height,
          )
        }

        // Sparkle overlay (not affected by blur/invert)
        ctx.filter = "none"
        if (normalizedEffects.sparkle.enabled) {
          drawSparklesOnCanvas({
            ctx,
            width: layer.width,
            height: layer.height,
            layerId: layer.id,
            intensity: normalizedEffects.sparkle.intensity,
          })
        }
      }

      if (layer.type === "text") {
        await ensureFontLoaded({
          fontFamily: layer.fontFamily,
          fontSize: layer.fontSize,
          fontWeight: layer.fontWeight,
        })

        ctx.filter = layerFilter
        ctx.fillStyle = layer.color
        ctx.font = `${Math.max(1, Math.round(layer.fontWeight))} ${layer.fontSize}px ${layer.fontFamily}`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        if (layer.strokeWidth > 0) {
          ctx.strokeStyle = layer.strokeColor
          ctx.lineWidth = layer.strokeWidth
        }
        if (layer.vertical) {
          const lineHeight = layer.fontSize * 1.1
          const columnAdvance = lineHeight
          ctx.textBaseline = "alphabetic"
          const baselineOffset = getCanvasBaselineOffsetInLineBox({
            ctx,
            lineHeight,
            fontSize: layer.fontSize,
          })
          drawVerticalText({
            ctx,
            text: layer.text,
            columnAdvance,
            lineHeight,
            baselineOffset,
            draw: (glyph, x, y) => {
              if (layer.strokeWidth > 0) {
                ctx.strokeText(glyph, x, y)
              }
              ctx.fillText(glyph, x, y)
            },
          })
        } else {
          const lineHeight = layer.fontSize * 1.1
          drawMultilineText({
            ctx,
            text: layer.text,
            lineHeight,
            draw: (line, x, y) => {
              if (layer.strokeWidth > 0) {
                ctx.strokeText(line, x, y)
              }
              ctx.fillText(line, x, y)
            },
          })
        }

        // Sparkle overlay (not affected by blur/invert)
        ctx.filter = "none"
        if (normalizedEffects.sparkle.enabled) {
          drawSparklesOnCanvas({
            ctx,
            width: layer.width,
            height: layer.height,
            layerId: layer.id,
            intensity: normalizedEffects.sparkle.intensity,
          })
        }
      }
      ctx.restore()
    }

    return canvas
  }

  const exportCanvas = async (format: "png" | "webp") => {
    const canvas = await createExportCanvas()
    if (!canvas) return

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

  const openRegisterDialog = async () => {
    setIsRegisterPreparing(true)
    try {
      const canvas = await createExportCanvas()
      if (!canvas) {
        toast("登録用画像の生成に失敗しました")
        return
      }
      const base64 = canvas.toDataURL("image/png")
      setRegisterImageBase64(base64)
      setIsRegisterDialogOpen(true)
    } catch (error) {
      console.error(error)
      toast("登録用画像の生成に失敗しました")
    } finally {
      setIsRegisterPreparing(false)
    }
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
      <AddStickerDialog
        open={isRegisterDialogOpen}
        onOpenChange={(open) => {
          setIsRegisterDialogOpen(open)
          if (!open) {
            setRegisterImageBase64("")
          }
        }}
        defaultImageBase64={registerImageBase64}
      />
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void openRegisterDialog()}
                disabled={isRegisterPreparing || layers.length === 0}
              >
                {isRegisterPreparing ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-1 h-4 w-4" />
                )}
                登録
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
                    duplicateLayer(activeLayerId)
                  }
                }}
                disabled={!activeLayerId}
              >
                複製
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
                  const normalizedEffects = normalizeLayerEffects(layer.effects)
                  const cssFilter = buildCssFilter(layer.effects)
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
                          transform: `translate(-50%, -50%) rotate(${layer.rotate}deg) skew(${layer.skewX ?? 0}deg, ${layer.skewY ?? 0}deg) scale(${(layer.scaleX ?? 1) * layer.scale * (layer.flipX ? -1 : 1)}, ${(layer.scaleY ?? 1) * layer.scale * (layer.flipY ? -1 : 1)})`,
                          transformOrigin: "center",
                        }}
                        onPointerDown={(event) => {
                          setActiveLayerId(layer.id)
                          handlePointerDown(event, layer, "move")
                        }}
                      >
                        <div className="relative">
                          {layer.type === "image" ? (
                            <img
                              src={getImageLayerSrc(layer)}
                              alt={layer.name}
                              className="block"
                              style={{
                                width: `${toCanvasPx(layer.width)}px`,
                                height: `${toCanvasPx(layer.height)}px`,
                                filter: cssFilter,
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
                                fontWeight: layer.fontWeight,
                                color: layer.color,
                                writingMode: layer.vertical
                                  ? "vertical-rl"
                                  : "horizontal-tb",
                                textOrientation: layer.vertical
                                  ? ("upright" as const)
                                  : undefined,
                                whiteSpace: layer.vertical
                                  ? ("nowrap" as const)
                                  : ("pre-wrap" as const),
                                WebkitTextStrokeWidth:
                                  layer.strokeWidth > 0
                                    ? `${strokeWidthPx}px`
                                    : undefined,
                                WebkitTextStrokeColor:
                                  layer.strokeWidth > 0
                                    ? layer.strokeColor
                                    : undefined,
                                paintOrder:
                                  layer.strokeWidth > 0
                                    ? ("stroke fill" as const)
                                    : undefined,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                lineHeight: "1.1",
                                padding: "2px",
                                filter: cssFilter,
                              }}
                            >
                              {layer.vertical
                                ? normalizeVerticalPreviewText(layer.text)
                                : layer.text}
                            </div>
                          )}
                          {normalizedEffects.sparkle.enabled && (
                            <LayerSparkleOverlay
                              layerId={layer.id}
                              intensity={normalizedEffects.sparkle.intensity}
                            />
                          )}
                        </div>
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
                  <p className="text-muted-foreground text-xs">
                    上にあるほど前面に表示されます
                  </p>
                  <div className="space-y-2">
                    {[...layers].reverse().map((layer, index) => {
                      const actualIndex = layers.length - 1 - index
                      return (
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
                                  src={
                                    layer.removeColorBackground
                                      ? (layer.transparentSrc ?? layer.src)
                                      : layer.src
                                  }
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
                                moveLayer(layer.id, "down")
                              }}
                              disabled={actualIndex === layers.length - 1}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(event) => {
                                event.stopPropagation()
                                moveLayer(layer.id, "up")
                              }}
                              disabled={actualIndex === 0}
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
                      )
                    })}
                    {layers.length === 0 && (
                      <p className="text-muted-foreground text-xs">
                        まだレイヤーがありません
                      </p>
                    )}
                  </div>

                  <div className="mt-4 space-y-3 rounded-lg border bg-background p-3">
                    <h4 className="font-semibold text-sm">画像</h4>
                    {colorRemovalError && (
                      <p className="text-destructive text-xs">
                        {colorRemovalError}
                      </p>
                    )}
                    {activeLayer?.type === "image" ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              commitLayerPatch(activeLayer.id, {
                                flipX: !activeLayer.flipX,
                              })
                            }
                          >
                            左右反転
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              commitLayerPatch(activeLayer.id, {
                                flipY: !activeLayer.flipY,
                              })
                            }
                          >
                            上下反転
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              commitLayerPatch(activeLayer.id, {
                                rotate: 0,
                                scale: 1,
                                scaleX: 1,
                                scaleY: 1,
                                skewX: 0,
                                skewY: 0,
                                flipX: false,
                                flipY: false,
                              })
                            }
                          >
                            変形リセット
                          </Button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs">横伸縮</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="range"
                                min={0.2}
                                max={3}
                                step={0.01}
                                value={activeLayer.scaleX ?? 1}
                                onChange={(event) =>
                                  updateLayer(activeLayer.id, {
                                    scaleX: Number(event.target.value),
                                  })
                                }
                              />
                              <Input
                                type="number"
                                min={0.2}
                                max={3}
                                step={0.01}
                                value={activeLayer.scaleX ?? 1}
                                onChange={(event) =>
                                  updateLayer(activeLayer.id, {
                                    scaleX: Number(event.target.value),
                                  })
                                }
                                className="w-20"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">縦伸縮</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="range"
                                min={0.2}
                                max={3}
                                step={0.01}
                                value={activeLayer.scaleY ?? 1}
                                onChange={(event) =>
                                  updateLayer(activeLayer.id, {
                                    scaleY: Number(event.target.value),
                                  })
                                }
                              />
                              <Input
                                type="number"
                                min={0.2}
                                max={3}
                                step={0.01}
                                value={activeLayer.scaleY ?? 1}
                                onChange={(event) =>
                                  updateLayer(activeLayer.id, {
                                    scaleY: Number(event.target.value),
                                  })
                                }
                                className="w-20"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs">歪み（X）</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="range"
                                min={-45}
                                max={45}
                                step={1}
                                value={activeLayer.skewX ?? 0}
                                onChange={(event) =>
                                  updateLayer(activeLayer.id, {
                                    skewX: Number(event.target.value),
                                  })
                                }
                              />
                              <Input
                                type="number"
                                min={-45}
                                max={45}
                                step={1}
                                value={activeLayer.skewX ?? 0}
                                onChange={(event) =>
                                  updateLayer(activeLayer.id, {
                                    skewX: Number(event.target.value),
                                  })
                                }
                                className="w-20"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">歪み（Y）</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="range"
                                min={-45}
                                max={45}
                                step={1}
                                value={activeLayer.skewY ?? 0}
                                onChange={(event) =>
                                  updateLayer(activeLayer.id, {
                                    skewY: Number(event.target.value),
                                  })
                                }
                              />
                              <Input
                                type="number"
                                min={-45}
                                max={45}
                                step={1}
                                value={activeLayer.skewY ?? 0}
                                onChange={(event) =>
                                  updateLayer(activeLayer.id, {
                                    skewY: Number(event.target.value),
                                  })
                                }
                                className="w-20"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={
                                activeLayer.removeColorBackground ?? false
                              }
                              onCheckedChange={(value) => {
                                if (!value) {
                                  clearColorRemovalForLayer(activeLayer.id)
                                  return
                                }
                                void applyColorRemovalToLayer(activeLayer.id)
                              }}
                              disabled={
                                colorRemovalAllBusy ||
                                colorRemovalBusy[activeLayer.id] === true
                              }
                            />
                            <Label className="text-xs">指定色を透過</Label>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            許容範囲: {activeLayer.colorThreshold ?? 40}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">透過する色</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={activeLayer.colorKey ?? "#ffffff"}
                              onChange={(event) =>
                                updateLayer(activeLayer.id, {
                                  colorKey: event.target.value,
                                })
                              }
                              className="h-9 w-14 p-1"
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={async () => {
                                const picked = await pickColorWithEyeDropper()
                                if (!picked) {
                                  setColorRemovalError(
                                    "スポイトが使えません（未対応ブラウザの可能性があります）",
                                  )
                                  return
                                }
                                updateLayer(activeLayer.id, {
                                  colorKey: picked,
                                })
                                if (activeLayer.removeColorBackground) {
                                  scheduleColorRemoval(activeLayer.id)
                                }
                              }}
                              disabled={
                                colorRemovalAllBusy ||
                                colorRemovalBusy[activeLayer.id] === true
                              }
                            >
                              スポイト
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">許容範囲</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="range"
                              min={0}
                              max={160}
                              value={activeLayer.colorThreshold ?? 40}
                              onChange={(event) => {
                                updateLayer(activeLayer.id, {
                                  colorThreshold: Number(event.target.value),
                                })
                                if (activeLayer.removeColorBackground) {
                                  scheduleColorRemoval(activeLayer.id)
                                }
                              }}
                            />
                            <Input
                              type="number"
                              min={0}
                              max={160}
                              value={activeLayer.colorThreshold ?? 40}
                              onChange={(event) => {
                                updateLayer(activeLayer.id, {
                                  colorThreshold: Number(event.target.value),
                                })
                                if (activeLayer.removeColorBackground) {
                                  scheduleColorRemoval(activeLayer.id)
                                }
                              }}
                              className="w-20"
                            />
                          </div>
                          <p className="text-muted-foreground text-xs">
                            透明にする色との近さ（色の差）の許容範囲です。0は完全一致のみ、上げるほど近い色も透明になります。
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              void applyColorRemovalToLayer(activeLayer.id)
                            }
                            disabled={
                              colorRemovalAllBusy ||
                              colorRemovalBusy[activeLayer.id] === true
                            }
                          >
                            {colorRemovalBusy[activeLayer.id]
                              ? "処理中…"
                              : "適用/更新"}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              void applyColorRemovalToAllImageLayers({
                                colorKey: activeLayer.colorKey ?? "#ffffff",
                                threshold: Math.max(
                                  0,
                                  Math.min(
                                    160,
                                    activeLayer.colorThreshold ?? 40,
                                  ),
                                ),
                              })
                            }
                            disabled={colorRemovalAllBusy}
                          >
                            {colorRemovalAllBusy
                              ? "全体に適用中…"
                              : "全画像レイヤーに適用"}
                          </Button>
                        </div>

                        <p className="text-muted-foreground text-xs">
                          アップロード画像はOK。外部画像はCORSの都合で失敗する場合があります。
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        画像レイヤーを選択すると色透過を使えます
                      </p>
                    )}
                  </div>

                  <div className="mt-4 space-y-3 rounded-lg border bg-background p-3">
                    <h4 className="font-semibold text-sm">エフェクト</h4>
                    {activeLayer ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              commitLayerPatch(activeLayer.id, {
                                flipX: !(activeLayer.flipX ?? false),
                              })
                            }
                          >
                            左右反転
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              commitLayerPatch(activeLayer.id, {
                                flipY: !(activeLayer.flipY ?? false),
                              })
                            }
                          >
                            上下反転
                          </Button>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">
                            ブラー（
                            {normalizeLayerEffects(activeLayer.effects).blur}
                            px）
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="range"
                              min={0}
                              max={20}
                              step={1}
                              value={
                                normalizeLayerEffects(activeLayer.effects).blur
                              }
                              onChange={(event) =>
                                updateLayerEffects(activeLayer.id, {
                                  blur: Number(event.target.value),
                                })
                              }
                            />
                            <Input
                              type="number"
                              min={0}
                              max={20}
                              step={1}
                              value={
                                normalizeLayerEffects(activeLayer.effects).blur
                              }
                              onChange={(event) =>
                                updateLayerEffects(activeLayer.id, {
                                  blur: Number(event.target.value),
                                })
                              }
                              className="w-20"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={
                                normalizeLayerEffects(activeLayer.effects)
                                  .invert
                              }
                              onCheckedChange={(value) =>
                                commitLayerEffects(activeLayer.id, {
                                  invert: value,
                                })
                              }
                            />
                            <Label className="text-xs">色反転</Label>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            画像/文字にフィルタ適用
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={
                                  normalizeLayerEffects(activeLayer.effects)
                                    .sparkle.enabled
                                }
                                onCheckedChange={(value) =>
                                  commitLayerEffects(activeLayer.id, {
                                    sparkle: {
                                      enabled: value,
                                      intensity: normalizeLayerEffects(
                                        activeLayer.effects,
                                      ).sparkle.intensity,
                                    },
                                  })
                                }
                              />
                              <Label className="text-xs">キラキラ</Label>
                            </div>
                            <span className="text-muted-foreground text-xs">
                              強さ:{" "}
                              {Math.round(
                                normalizeLayerEffects(activeLayer.effects)
                                  .sparkle.intensity * 100,
                              )}
                            </span>
                          </div>
                          {normalizeLayerEffects(activeLayer.effects).sparkle
                            .enabled && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={
                                  normalizeLayerEffects(activeLayer.effects)
                                    .sparkle.intensity
                                }
                                onChange={(event) =>
                                  updateLayerEffects(activeLayer.id, {
                                    sparkle: {
                                      intensity: Number(event.target.value),
                                    },
                                  })
                                }
                              />
                              <Input
                                type="number"
                                min={0}
                                max={1}
                                step={0.05}
                                value={
                                  normalizeLayerEffects(activeLayer.effects)
                                    .sparkle.intensity
                                }
                                onChange={(event) =>
                                  updateLayerEffects(activeLayer.id, {
                                    sparkle: {
                                      intensity: Number(event.target.value),
                                    },
                                  })
                                }
                                className="w-20"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        レイヤーを選択するとエフェクトを使えます
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">テキスト</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">追加時フォント</Label>
                      <select
                        className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                        value={newTextFontFamily}
                        onChange={(event) =>
                          (() => {
                            const nextFamily = event.target.value
                            setNewTextFontFamily(nextFamily)
                            setNewTextFontWeight((prev) =>
                              normalizeFontWeightForFamily({
                                fontFamily: nextFamily,
                                fontWeight: prev,
                              }),
                            )
                          })()
                        }
                      >
                        {fontFamilies.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        追加時太さ（{newTextFontWeight}）
                      </Label>
                      <input
                        type="range"
                        min={100}
                        max={900}
                        step={100}
                        value={newTextFontWeight}
                        disabled={
                          getFontWeightsForFamily(newTextFontFamily).length <= 1
                        }
                        onChange={(event) => {
                          const next = clampFontWeight(
                            Number(event.currentTarget.value),
                          )
                          setNewTextFontWeight(
                            normalizeFontWeightForFamily({
                              fontFamily: newTextFontFamily,
                              fontWeight: next,
                            }),
                          )
                        }}
                        className="w-full"
                      />
                      {getFontWeightsForFamily(newTextFontFamily).length <=
                        1 && (
                        <p className="text-muted-foreground text-xs">
                          このフォントは太さ変更に対応していません
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={newTextVertical}
                        onCheckedChange={setNewTextVertical}
                      />
                      <Label className="text-xs">追加時は縦書き</Label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Textarea
                      value={textInput}
                      onChange={(event) => setTextInput(event.target.value)}
                      placeholder="テキストを入力"
                      rows={3}
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
                              (() => {
                                const nextFontSize = Number(event.target.value)
                                if (activeLayer.vertical) {
                                  const box = computeTextLayerBox({
                                    text: activeLayer.text,
                                    fontSize: nextFontSize,
                                    vertical: true,
                                  })
                                  updateLayer(activeLayer.id, {
                                    fontSize: nextFontSize,
                                    width: box.width,
                                    height: box.height,
                                  })
                                  return
                                }
                                updateLayer(activeLayer.id, {
                                  fontSize: nextFontSize,
                                })
                              })()
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">フォント</Label>
                          <select
                            className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                            value={activeLayer.fontFamily}
                            onChange={(event) =>
                              (() => {
                                const nextFamily = event.target.value
                                updateLayer(activeLayer.id, {
                                  fontFamily: nextFamily,
                                  fontWeight: normalizeFontWeightForFamily({
                                    fontFamily: nextFamily,
                                    fontWeight: activeLayer.fontWeight,
                                  }),
                                })
                              })()
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
                      <div className="space-y-1">
                        <Label className="text-xs">
                          太さ（{activeLayer.fontWeight}）
                        </Label>
                        <input
                          type="range"
                          min={100}
                          max={900}
                          step={100}
                          value={activeLayer.fontWeight}
                          disabled={
                            getFontWeightsForFamily(activeLayer.fontFamily)
                              .length <= 1
                          }
                          onChange={(event) => {
                            const next = clampFontWeight(
                              Number(event.currentTarget.value),
                            )
                            updateLayer(activeLayer.id, {
                              fontWeight: normalizeFontWeightForFamily({
                                fontFamily: activeLayer.fontFamily,
                                fontWeight: next,
                              }),
                            })
                          }}
                          className="w-full"
                        />
                        {getFontWeightsForFamily(activeLayer.fontFamily)
                          .length <= 1 && (
                          <p className="text-muted-foreground text-xs">
                            このフォントは太さ変更に対応していません
                          </p>
                        )}
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
                              (() => {
                                const box = computeTextLayerBox({
                                  text: activeLayer.text,
                                  fontSize: activeLayer.fontSize,
                                  vertical: value,
                                })
                                updateLayer(activeLayer.id, {
                                  vertical: value,
                                  width: box.width,
                                  height: box.height,
                                })
                              })()
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
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void openRegisterDialog()}
                      disabled={isRegisterPreparing || layers.length === 0}
                    >
                      {isRegisterPreparing ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-1 h-4 w-4" />
                      )}
                      登録
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
            <p className="text-muted-foreground text-xs">
              上にあるほど前面に表示されます
            </p>
            <div className="space-y-2">
              {[...layers].reverse().map((layer, index) => {
                const actualIndex = layers.length - 1 - index
                return (
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
                            src={
                              layer.removeColorBackground
                                ? (layer.transparentSrc ?? layer.src)
                                : layer.src
                            }
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
                          duplicateLayer(layer.id)
                        }}
                      >
                        <span className="sr-only">Duplicate layer</span>
                        <span className="text-xs">⧉</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation()
                          moveLayer(layer.id, "down")
                        }}
                        disabled={actualIndex === layers.length - 1}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation()
                          moveLayer(layer.id, "up")
                        }}
                        disabled={actualIndex === 0}
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
                )
              })}
              {layers.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  まだレイヤーがありません
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">エフェクト</h3>
            {activeLayer ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      commitLayerPatch(activeLayer.id, {
                        flipX: !(activeLayer.flipX ?? false),
                      })
                    }
                  >
                    左右反転
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      commitLayerPatch(activeLayer.id, {
                        flipY: !(activeLayer.flipY ?? false),
                      })
                    }
                  >
                    上下反転
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">
                    ブラー（{normalizeLayerEffects(activeLayer.effects).blur}
                    px）
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={normalizeLayerEffects(activeLayer.effects).blur}
                      onChange={(event) =>
                        updateLayerEffects(activeLayer.id, {
                          blur: Number(event.target.value),
                        })
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      step={1}
                      value={normalizeLayerEffects(activeLayer.effects).blur}
                      onChange={(event) =>
                        updateLayerEffects(activeLayer.id, {
                          blur: Number(event.target.value),
                        })
                      }
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={
                        normalizeLayerEffects(activeLayer.effects).invert
                      }
                      onCheckedChange={(value) =>
                        commitLayerEffects(activeLayer.id, {
                          invert: value,
                        })
                      }
                    />
                    <Label className="text-xs">色反転</Label>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    画像/文字にフィルタ適用
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          normalizeLayerEffects(activeLayer.effects).sparkle
                            .enabled
                        }
                        onCheckedChange={(value) =>
                          commitLayerEffects(activeLayer.id, {
                            sparkle: {
                              enabled: value,
                              intensity: normalizeLayerEffects(
                                activeLayer.effects,
                              ).sparkle.intensity,
                            },
                          })
                        }
                      />
                      <Label className="text-xs">キラキラ</Label>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      強さ:{" "}
                      {Math.round(
                        normalizeLayerEffects(activeLayer.effects).sparkle
                          .intensity * 100,
                      )}
                    </span>
                  </div>

                  {normalizeLayerEffects(activeLayer.effects).sparkle
                    .enabled && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={
                          normalizeLayerEffects(activeLayer.effects).sparkle
                            .intensity
                        }
                        onChange={(event) =>
                          updateLayerEffects(activeLayer.id, {
                            sparkle: {
                              intensity: Number(event.target.value),
                            },
                          })
                        }
                      />
                      <Input
                        type="number"
                        min={0}
                        max={1}
                        step={0.05}
                        value={
                          normalizeLayerEffects(activeLayer.effects).sparkle
                            .intensity
                        }
                        onChange={(event) =>
                          updateLayerEffects(activeLayer.id, {
                            sparkle: {
                              intensity: Number(event.target.value),
                            },
                          })
                        }
                        className="w-20"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                レイヤーを選択するとエフェクトを使えます
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">テキスト</h3>
            <div className="flex flex-col gap-2">
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">追加時フォント</Label>
                  <select
                    className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                    value={newTextFontFamily}
                    onChange={(event) =>
                      (() => {
                        const nextFamily = event.target.value
                        setNewTextFontFamily(nextFamily)
                        setNewTextFontWeight((prev) =>
                          normalizeFontWeightForFamily({
                            fontFamily: nextFamily,
                            fontWeight: prev,
                          }),
                        )
                      })()
                    }
                  >
                    {fontFamilies.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">
                    追加時太さ（{newTextFontWeight}）
                  </Label>
                  <input
                    type="range"
                    min={100}
                    max={900}
                    step={100}
                    value={newTextFontWeight}
                    disabled={
                      getFontWeightsForFamily(newTextFontFamily).length <= 1
                    }
                    onChange={(event) => {
                      const next = clampFontWeight(
                        Number(event.currentTarget.value),
                      )
                      setNewTextFontWeight(
                        normalizeFontWeightForFamily({
                          fontFamily: newTextFontFamily,
                          fontWeight: next,
                        }),
                      )
                    }}
                    className="w-full"
                  />
                  {getFontWeightsForFamily(newTextFontFamily).length <= 1 && (
                    <p className="text-muted-foreground text-xs">
                      このフォントは太さ変更に対応していません
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={newTextVertical}
                    onCheckedChange={setNewTextVertical}
                  />
                  <Label className="text-xs">追加時は縦書き</Label>
                </div>
              </div>

              <Textarea
                value={textInput}
                onChange={(event) => setTextInput(event.target.value)}
                placeholder="テキストを入力"
                rows={3}
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
                      (() => {
                        const nextFontSize = Number(event.target.value)
                        if (activeLayer.vertical) {
                          const box = computeTextLayerBox({
                            text: activeLayer.text,
                            fontSize: nextFontSize,
                            vertical: true,
                          })
                          updateLayer(activeLayer.id, {
                            fontSize: nextFontSize,
                            width: box.width,
                            height: box.height,
                          })
                          return
                        }
                        updateLayer(activeLayer.id, {
                          fontSize: nextFontSize,
                        })
                      })()
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">フォント</Label>
                  <select
                    className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                    value={activeLayer.fontFamily}
                    onChange={(event) =>
                      (() => {
                        const nextFamily = event.target.value
                        updateLayer(activeLayer.id, {
                          fontFamily: nextFamily,
                          fontWeight: normalizeFontWeightForFamily({
                            fontFamily: nextFamily,
                            fontWeight: activeLayer.fontWeight,
                          }),
                        })
                      })()
                    }
                  >
                    {fontFamilies.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">
                    太さ（{activeLayer.fontWeight}）
                  </Label>
                  <input
                    type="range"
                    min={100}
                    max={900}
                    step={100}
                    value={activeLayer.fontWeight}
                    disabled={
                      getFontWeightsForFamily(activeLayer.fontFamily).length <=
                      1
                    }
                    onChange={(event) => {
                      const next = clampFontWeight(
                        Number(event.currentTarget.value),
                      )
                      updateLayer(activeLayer.id, {
                        fontWeight: normalizeFontWeightForFamily({
                          fontFamily: activeLayer.fontFamily,
                          fontWeight: next,
                        }),
                      })
                    }}
                    className="w-full"
                  />
                  {getFontWeightsForFamily(activeLayer.fontFamily).length <=
                    1 && (
                    <p className="text-muted-foreground text-xs">
                      このフォントは太さ変更に対応していません
                    </p>
                  )}
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
                        (() => {
                          const box = computeTextLayerBox({
                            text: activeLayer.text,
                            fontSize: activeLayer.fontSize,
                            vertical: value,
                          })
                          updateLayer(activeLayer.id, {
                            vertical: value,
                            width: box.width,
                            height: box.height,
                          })
                        })()
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

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">画像</h3>
            {colorRemovalError && (
              <p className="text-destructive text-xs">{colorRemovalError}</p>
            )}
            {activeLayer?.type === "image" ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      commitLayerPatch(activeLayer.id, {
                        flipX: !activeLayer.flipX,
                      })
                    }
                  >
                    左右反転
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      commitLayerPatch(activeLayer.id, {
                        flipY: !activeLayer.flipY,
                      })
                    }
                  >
                    上下反転
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      commitLayerPatch(activeLayer.id, {
                        rotate: 0,
                        scale: 1,
                        scaleX: 1,
                        scaleY: 1,
                        skewX: 0,
                        skewY: 0,
                        flipX: false,
                        flipY: false,
                      })
                    }
                  >
                    変形リセット
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">横伸縮</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="range"
                      min={0.2}
                      max={3}
                      step={0.01}
                      value={activeLayer.scaleX ?? 1}
                      onChange={(event) =>
                        updateLayer(activeLayer.id, {
                          scaleX: Number(event.target.value),
                        })
                      }
                    />
                    <Input
                      type="number"
                      min={0.2}
                      max={3}
                      step={0.01}
                      value={activeLayer.scaleX ?? 1}
                      onChange={(event) =>
                        updateLayer(activeLayer.id, {
                          scaleX: Number(event.target.value),
                        })
                      }
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">縦伸縮</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="range"
                      min={0.2}
                      max={3}
                      step={0.01}
                      value={activeLayer.scaleY ?? 1}
                      onChange={(event) =>
                        updateLayer(activeLayer.id, {
                          scaleY: Number(event.target.value),
                        })
                      }
                    />
                    <Input
                      type="number"
                      min={0.2}
                      max={3}
                      step={0.01}
                      value={activeLayer.scaleY ?? 1}
                      onChange={(event) =>
                        updateLayer(activeLayer.id, {
                          scaleY: Number(event.target.value),
                        })
                      }
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">歪み（X）</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="range"
                      min={-45}
                      max={45}
                      step={1}
                      value={activeLayer.skewX ?? 0}
                      onChange={(event) =>
                        updateLayer(activeLayer.id, {
                          skewX: Number(event.target.value),
                        })
                      }
                    />
                    <Input
                      type="number"
                      min={-45}
                      max={45}
                      step={1}
                      value={activeLayer.skewX ?? 0}
                      onChange={(event) =>
                        updateLayer(activeLayer.id, {
                          skewX: Number(event.target.value),
                        })
                      }
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">歪み（Y）</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="range"
                      min={-45}
                      max={45}
                      step={1}
                      value={activeLayer.skewY ?? 0}
                      onChange={(event) =>
                        updateLayer(activeLayer.id, {
                          skewY: Number(event.target.value),
                        })
                      }
                    />
                    <Input
                      type="number"
                      min={-45}
                      max={45}
                      step={1}
                      value={activeLayer.skewY ?? 0}
                      onChange={(event) =>
                        updateLayer(activeLayer.id, {
                          skewY: Number(event.target.value),
                        })
                      }
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={activeLayer.removeColorBackground ?? false}
                      onCheckedChange={(value) => {
                        if (!value) {
                          clearColorRemovalForLayer(activeLayer.id)
                          return
                        }
                        void applyColorRemovalToLayer(activeLayer.id)
                      }}
                      disabled={
                        colorRemovalAllBusy ||
                        colorRemovalBusy[activeLayer.id] === true
                      }
                    />
                    <Label className="text-xs">指定色を透過</Label>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    許容範囲: {activeLayer.colorThreshold ?? 40}
                  </span>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">透過する色</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={activeLayer.colorKey ?? "#ffffff"}
                      onChange={(event) =>
                        updateLayer(activeLayer.id, {
                          colorKey: event.target.value,
                        })
                      }
                      className="h-9 w-14 p-1"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        const picked = await pickColorWithEyeDropper()
                        if (!picked) {
                          setColorRemovalError(
                            "スポイトが使えません（未対応ブラウザの可能性があります）",
                          )
                          return
                        }
                        updateLayer(activeLayer.id, { colorKey: picked })
                        if (activeLayer.removeColorBackground) {
                          scheduleColorRemoval(activeLayer.id)
                        }
                      }}
                      disabled={
                        colorRemovalAllBusy ||
                        colorRemovalBusy[activeLayer.id] === true
                      }
                    >
                      スポイト
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">許容範囲</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="range"
                      min={0}
                      max={160}
                      value={activeLayer.colorThreshold ?? 40}
                      onChange={(event) => {
                        updateLayer(activeLayer.id, {
                          colorThreshold: Number(event.target.value),
                        })
                        if (activeLayer.removeColorBackground) {
                          scheduleColorRemoval(activeLayer.id)
                        }
                      }}
                    />
                    <Input
                      type="number"
                      min={0}
                      max={160}
                      value={activeLayer.colorThreshold ?? 40}
                      onChange={(event) => {
                        updateLayer(activeLayer.id, {
                          colorThreshold: Number(event.target.value),
                        })
                        if (activeLayer.removeColorBackground) {
                          scheduleColorRemoval(activeLayer.id)
                        }
                      }}
                      className="w-20"
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    透明にする色との近さ（色の差）の許容範囲です。0は完全一致のみ、上げるほど近い色も透明になります。
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      void applyColorRemovalToLayer(activeLayer.id)
                    }
                    disabled={
                      colorRemovalAllBusy ||
                      colorRemovalBusy[activeLayer.id] === true
                    }
                  >
                    {colorRemovalBusy[activeLayer.id] ? "処理中…" : "適用/更新"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      void applyColorRemovalToAllImageLayers({
                        colorKey: activeLayer.colorKey ?? "#ffffff",
                        threshold: Math.max(
                          0,
                          Math.min(160, activeLayer.colorThreshold ?? 40),
                        ),
                      })
                    }
                    disabled={colorRemovalAllBusy}
                  >
                    {colorRemovalAllBusy
                      ? "全体に適用中…"
                      : "全画像レイヤーに適用"}
                  </Button>
                </div>

                <p className="text-muted-foreground text-xs">
                  アップロード画像はOK。外部画像はCORSの都合で失敗する場合があります。
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                画像レイヤーを選択すると色透過を使えます
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

const normalizeHexColor = (value: string) => {
  const v = value.trim().toLowerCase()
  if (/^#[0-9a-f]{6}$/.test(v)) return v
  if (/^#[0-9a-f]{3}$/.test(v)) {
    const r = v[1]
    const g = v[2]
    const b = v[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return "#ffffff"
}

const hexToRgb = (hex: string) => {
  const h = normalizeHexColor(hex)
  const r = Number.parseInt(h.slice(1, 3), 16)
  const g = Number.parseInt(h.slice(3, 5), 16)
  const b = Number.parseInt(h.slice(5, 7), 16)
  return { r, g, b }
}

const pickColorWithEyeDropper = async (): Promise<string | null> => {
  const anyWindow = window as unknown as {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> }
  }
  if (!anyWindow.EyeDropper) return null

  try {
    const dropper = new anyWindow.EyeDropper()
    const result = await dropper.open()
    return normalizeHexColor(result.sRGBHex)
  } catch {
    // user canceled / permission denied
    return null
  }
}

const canvasToBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"))
          return
        }
        resolve(blob)
      },
      type,
      0.95,
    )
  })

const createColorKeyTransparentCanvas = (props: {
  img: HTMLImageElement
  colorKey: string
  threshold: number
}) => {
  const width = props.img.naturalWidth || props.img.width
  const height = props.img.naturalHeight || props.img.height
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2d context is not available")

  ctx.drawImage(props.img, 0, 0)

  let imageData: ImageData
  try {
    imageData = ctx.getImageData(0, 0, width, height)
  } catch {
    // CORSでtaintされると例外になる
    throw new Error("CORS blocked image processing")
  }

  const data = imageData.data
  const threshold = Math.max(0, Math.min(441, props.threshold))
  const feather = 16

  const key = hexToRgb(props.colorKey)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0
    const g = data[i + 1] ?? 0
    const b = data[i + 2] ?? 0
    const a = data[i + 3] ?? 255
    if (a === 0) continue

    const dr = key.r - r
    const dg = key.g - g
    const db = key.b - b
    const dist = Math.sqrt(dr * dr + dg * dg + db * db)

    if (dist <= threshold) {
      data[i + 3] = 0
      continue
    }

    if (dist <= threshold + feather) {
      const t = (dist - threshold) / feather
      const nextA = Math.round(a * Math.max(0, Math.min(1, t)))
      data[i + 3] = nextA
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

const createColorKeyTransparentObjectUrl = async (props: {
  src: string
  colorKey: string
  threshold: number
}) => {
  const img = await loadImage(toCanvasSafeImageUrl(props.src))
  const canvas = createColorKeyTransparentCanvas({
    img,
    colorKey: props.colorKey,
    threshold: props.threshold,
  })
  const blob = await canvasToBlob(canvas, "image/png")
  return URL.createObjectURL(blob)
}
