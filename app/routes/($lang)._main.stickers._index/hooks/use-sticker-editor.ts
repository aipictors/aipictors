import type React from "react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import type { StickerAssetCategory } from "~/routes/($lang)._main.stickers._index/components/sticker-assets"
import type {
  DragMode,
  DragState,
  HistoryState,
  ImageLayer,
  Layer,
  LayerEffects,
  PanelDragMode,
  PanelDragState,
} from "~/routes/($lang)._main.stickers._index/types/sticker-layer"
import { CANVAS_SIZE } from "~/routes/($lang)._main.stickers._index/utils/sticker-canvas-size"
import { normalizeHexColor } from "~/routes/($lang)._main.stickers._index/utils/sticker-color"
import { createStickerExportCanvas } from "~/routes/($lang)._main.stickers._index/utils/sticker-export-canvas"
import {
  pushStickerHistory,
  redoStickerHistory,
  undoStickerHistory,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-history"
import {
  createColorKeyTransparentObjectUrl,
  resolveImageSize,
  toCanvasSafeImageUrl,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-image"
import {
  createStickerImageLayer,
  createStickerTextLayer,
  moveStickerLayer,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-layers"
import {
  DEFAULT_TEXT_FONT_WEIGHT,
  fontFamilies,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-text-layout"

/**
 * スタンプ作成ツールの状態と操作
 */
export function useStickerEditor(props: { onClose?: () => void }) {
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
  const [isOpen, setIsOpen] = useState(props.onClose !== undefined)
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
    setHistory((prev) => pushStickerHistory(prev, next))
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
      const newLayer = createStickerImageLayer({
        src,
        width: Math.max(24, Math.round(width * scale)),
        height: Math.max(24, Math.round(height * scale)),
      })
      commitLayers([...layersRef.current, newLayer])
      setActiveLayerId(newLayer.id)
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
    const newLayer = createStickerTextLayer({
      text: textInput.trim(),
      fontFamily: newTextFontFamily,
      fontWeight: newTextFontWeight,
      vertical: newTextVertical,
    })
    commitLayers([...layersRef.current, newLayer])
    setActiveLayerId(newLayer.id)
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
    const next = moveStickerLayer(layersRef.current, id, direction)
    if (next === null) return
    commitLayers(next)
  }

  const handleUndo = () => {
    setHistory(undoStickerHistory)
  }

  const handleRedo = () => {
    setHistory(redoStickerHistory)
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

  const createExportCanvas = () =>
    createStickerExportCanvas({ layers, backgroundEnabled, backgroundColor })

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

  return {
    activeCategory,
    setActiveCategory,
    activeLayerId,
    setActiveLayerId,
    textInput,
    setTextInput,
    newTextFontFamily,
    setNewTextFontFamily,
    newTextFontWeight,
    setNewTextFontWeight,
    newTextVertical,
    setNewTextVertical,
    isRegisterDialogOpen,
    setIsRegisterDialogOpen,
    registerImageBase64,
    setRegisterImageBase64,
    isRegisterPreparing,
    backgroundEnabled,
    setBackgroundEnabled,
    backgroundColor,
    setBackgroundColor,
    isOpen,
    setIsOpen,
    mobilePanel,
    setMobilePanel,
    canvasId,
    canvasRef,
    colorRemovalBusy,
    colorRemovalError,
    setColorRemovalError,
    colorRemovalAllBusy,
    leftPanelWidth,
    rightPanelWidth,
    layers,
    canvasScale,
    toCanvasPx,
    scheduleColorRemoval,
    canUndo,
    canRedo,
    activeLayer,
    addImageLayer,
    getImageLayerSrc,
    applyColorRemovalToLayer,
    clearColorRemovalForLayer,
    applyColorRemovalToAllImageLayers,
    addTextLayer,
    onUploadImage,
    updateLayer,
    updateLayerEffects,
    commitLayerEffects,
    commitLayerPatch,
    removeLayer,
    duplicateLayer,
    moveLayer,
    handleUndo,
    handleRedo,
    handlePointerDown,
    handlePanelResizePointerDown,
    exportCanvas,
    openRegisterDialog,
  }
}

export type StickerEditor = ReturnType<typeof useStickerEditor>
