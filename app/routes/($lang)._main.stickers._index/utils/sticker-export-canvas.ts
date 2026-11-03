import type { Layer } from "~/routes/($lang)._main.stickers._index/types/sticker-layer"
import { CANVAS_SIZE } from "~/routes/($lang)._main.stickers._index/utils/sticker-canvas-size"
import { normalizeHexColor } from "~/routes/($lang)._main.stickers._index/utils/sticker-color"
import {
  createColorKeyTransparentCanvas,
  loadImage,
  toCanvasSafeImageUrl,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-image"
import {
  buildCssFilter,
  clampNumber,
  hashStringToUint32,
  mulberry32,
  normalizeLayerEffects,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-layer-effects"
import {
  splitLines,
  toVerticalColumns,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-text-layout"

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

export const createStickerExportCanvas = async (props: {
  layers: Layer[]
  backgroundEnabled: boolean
  backgroundColor: string
}) => {
  const canvas = document.createElement("canvas")
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  if (props.backgroundEnabled) {
    ctx.fillStyle = props.backgroundColor
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  }

  const orderedLayers = [...props.layers].filter((layer) => layer.visible)

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
