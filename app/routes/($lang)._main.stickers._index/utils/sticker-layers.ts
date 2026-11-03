import type {
  ImageLayer,
  Layer,
  TextLayer,
} from "~/routes/($lang)._main.stickers._index/types/sticker-layer"
import { CANVAS_SIZE } from "~/routes/($lang)._main.stickers._index/utils/sticker-canvas-size"
import {
  computeTextLayerBox,
  normalizeFontWeightForFamily,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-text-layout"

export const createStickerImageLayer = (props: {
  src: string
  width: number
  height: number
}): ImageLayer => ({
  id: crypto.randomUUID(),
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
  width: props.width,
  height: props.height,
  flipX: false,
  flipY: false,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
  src: props.src,
  removeColorBackground: false,
  colorKey: "#ffffff",
  colorThreshold: 40,
  transparentSrc: undefined,
})

export const createStickerTextLayer = (props: {
  text: string
  fontFamily: string
  fontWeight: number
  vertical: boolean
}): TextLayer => {
  const box = computeTextLayerBox({
    text: props.text,
    fontSize: 64,
    vertical: props.vertical,
  })
  return {
    id: crypto.randomUUID(),
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
    text: props.text,
    fontSize: 64,
    fontFamily: props.fontFamily,
    fontWeight: normalizeFontWeightForFamily({
      fontFamily: props.fontFamily,
      fontWeight: props.fontWeight,
    }),
    color: "#000000",
    strokeColor: "#ffffff",
    strokeWidth: 2,
    vertical: props.vertical,
  }
}

/**
 * 重なり順を一つ動かす。動かせないときは null
 */
export const moveStickerLayer = (
  layers: Layer[],
  id: string,
  direction: "up" | "down",
): Layer[] | null => {
  const index = layers.findIndex((layer) => layer.id === id)
  if (index === -1) return null
  const next = [...layers]
  const targetIndex = direction === "up" ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= next.length) return null
  const [item] = next.splice(index, 1)
  next.splice(targetIndex, 0, item)
  return next
}
