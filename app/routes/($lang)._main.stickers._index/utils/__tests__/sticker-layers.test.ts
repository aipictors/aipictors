import { describe, expect, test } from "bun:test"
import type { Layer } from "~/routes/($lang)._main.stickers._index/types/sticker-layer"
import {
  createStickerImageLayer,
  createStickerTextLayer,
  moveStickerLayer,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-layers"

const layersOf = (...names: string[]) =>
  names.map((name) => ({ id: name })) as Layer[]

const idsOf = (layers: Layer[] | null) =>
  layers === null ? null : layers.map((layer) => layer.id)

describe("createStickerImageLayer", () => {
  test("キャンバスの中央に置く", () => {
    const layer = createStickerImageLayer({ src: "a.png", width: 10, height: 20 })
    expect(layer.x).toBe(256)
    expect(layer.y).toBe(256)
    expect(layer.width).toBe(10)
    expect(layer.height).toBe(20)
    expect(layer.colorThreshold).toBe(40)
  })
})

describe("createStickerTextLayer", () => {
  test("使えない太さは直す", () => {
    const layer = createStickerTextLayer({
      text: "あ",
      fontFamily: "'Yomogi', system-ui",
      fontWeight: 900,
      vertical: false,
    })
    expect(layer.fontWeight).toBe(400)
    expect(layer.width).toBe(260)
  })

  test("縦書きは文字数に合わせた大きさにする", () => {
    const layer = createStickerTextLayer({
      text: "あいう",
      fontFamily: "'Noto Sans JP', system-ui",
      fontWeight: 700,
      vertical: true,
    })
    expect(layer.fontWeight).toBe(700)
    expect(layer.width).toBe(82)
    expect(layer.height).toBe(223)
  })
})

describe("moveStickerLayer", () => {
  const layers = layersOf("a", "b", "c")

  test("前後に動かす", () => {
    expect(idsOf(moveStickerLayer(layers, "b", "up"))).toEqual(["b", "a", "c"])
    expect(idsOf(moveStickerLayer(layers, "b", "down"))).toEqual(["a", "c", "b"])
  })

  test("端やないものは null", () => {
    expect(moveStickerLayer(layers, "a", "up")).toBeNull()
    expect(moveStickerLayer(layers, "c", "down")).toBeNull()
    expect(moveStickerLayer(layers, "z", "up")).toBeNull()
  })

  test("元の配列は書き換えない", () => {
    moveStickerLayer(layers, "b", "up")
    expect(idsOf(layers)).toEqual(["a", "b", "c"])
  })
})
