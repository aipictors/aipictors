import { describe, expect, test } from "bun:test"
import {
  composeGifFrames,
  type GifFrame,
  isGifBytes,
  MAX_ANIMATION_PIXELS,
  toAnimationScale,
  toFrameDuration,
} from "~/utils/animated-gif-to-webp"
import { toUploadImageType } from "~/utils/upload-public-image"

const ascii = (text: string) => Uint8Array.from(text, (c) => c.charCodeAt(0))

/** 1 色で塗ったコマ */
const solidFrame = (
  dims: GifFrame["dims"],
  rgb: [number, number, number],
  disposalType: number,
): GifFrame => {
  const patch = new Uint8ClampedArray(dims.width * dims.height * 4)
  for (let i = 0; i < patch.length; i += 4) {
    patch.set([...rgb, 255], i)
  }
  return { dims, patch, delay: 100, disposalType }
}

const pixel = (data: Uint8Array, width: number, x: number, y: number) =>
  Array.from(data.subarray((y * width + x) * 4, (y * width + x) * 4 + 4))

describe("isGifBytes", () => {
  test("GIF87a / GIF89a だけを GIF とみなす", () => {
    expect(isGifBytes(ascii("GIF89a...."))).toBe(true)
    expect(isGifBytes(ascii("GIF87a"))).toBe(true)
    expect(isGifBytes(ascii("RIFF....WEBP"))).toBe(false)
    expect(isGifBytes(ascii("GIF"))).toBe(false)
  })
})

describe("toFrameDuration", () => {
  test("10ms 以下はブラウザと同じく 100ms にする", () => {
    expect(toFrameDuration(0)).toBe(100)
    expect(toFrameDuration(10)).toBe(100)
    expect(toFrameDuration(20)).toBe(20)
    expect(toFrameDuration(180)).toBe(180)
  })
})

describe("toAnimationScale", () => {
  test("小さい GIF は縮めない", () => {
    expect(toAnimationScale(414, 414, 9, 512)).toBe(1)
  })

  test("長い辺を maxSide に合わせる", () => {
    expect(toAnimationScale(1024, 512, 2, 512)).toBe(0.5)
  })

  test("コマが多いときは展開する画素の合計を上限内にする", () => {
    const scale = toAnimationScale(1000, 1000, 100, 4096)
    const pixels = 1000 * scale * (1000 * scale) * 100
    expect(scale).toBeLessThan(1)
    expect(pixels).toBeLessThanOrEqual(MAX_ANIMATION_PIXELS + 1)
  })
})

describe("composeGifFrames", () => {
  test("差分のコマを前のコマに重ねる", () => {
    const frames = [
      solidFrame({ left: 0, top: 0, width: 2, height: 2 }, [255, 0, 0], 1),
      solidFrame({ left: 1, top: 1, width: 1, height: 1 }, [0, 0, 255], 1),
    ]
    const [first, second] = Array.from(composeGifFrames(frames, 2, 2))
    expect(pixel(first.data, 2, 1, 1)).toEqual([255, 0, 0, 255])
    expect(pixel(second.data, 2, 0, 0)).toEqual([255, 0, 0, 255])
    expect(pixel(second.data, 2, 1, 1)).toEqual([0, 0, 255, 255])
  })

  test("disposal 2 は表示後にその範囲を透明に戻す", () => {
    const frames = [
      solidFrame({ left: 0, top: 0, width: 1, height: 1 }, [255, 0, 0], 2),
      solidFrame({ left: 1, top: 0, width: 1, height: 1 }, [0, 255, 0], 1),
    ]
    const [, second] = Array.from(composeGifFrames(frames, 2, 1))
    expect(pixel(second.data, 2, 0, 0)).toEqual([0, 0, 0, 0])
    expect(pixel(second.data, 2, 1, 0)).toEqual([0, 255, 0, 255])
  })

  test("disposal 3 は描く前の状態に戻す", () => {
    const frames = [
      solidFrame({ left: 0, top: 0, width: 1, height: 1 }, [255, 0, 0], 1),
      solidFrame({ left: 0, top: 0, width: 1, height: 1 }, [0, 255, 0], 3),
      solidFrame({ left: 1, top: 0, width: 1, height: 1 }, [0, 0, 255], 1),
    ]
    const [, second, third] = Array.from(composeGifFrames(frames, 2, 1))
    expect(pixel(second.data, 2, 0, 0)).toEqual([0, 255, 0, 255])
    expect(pixel(third.data, 2, 0, 0)).toEqual([255, 0, 0, 255])
  })

  test("透明の画素は下のコマを残す", () => {
    const top = solidFrame(
      { left: 0, top: 0, width: 1, height: 1 },
      [0, 0, 255],
      1,
    )
    top.patch[3] = 0
    const frames = [
      solidFrame({ left: 0, top: 0, width: 1, height: 1 }, [255, 0, 0], 1),
      top,
    ]
    const [, second] = Array.from(composeGifFrames(frames, 1, 1))
    expect(pixel(second.data, 1, 0, 0)).toEqual([255, 0, 0, 255])
  })
})

describe("toUploadImageType", () => {
  test("data URL の先頭で形式を決める", () => {
    expect(toUploadImageType("data:image/gif;base64,R0lGOD")).toBe("image/gif")
    expect(toUploadImageType("data:image/webp;base64,UklGR")).toBe("image/webp")
    expect(toUploadImageType("data:image/jpeg;base64,/9j/")).toBe("image/jpeg")
    expect(toUploadImageType("data:image/png;base64,iVBOR")).toBe("image/png")
  })

  test("本文の base64 に webp などの文字が入っていても先頭だけを見る", () => {
    expect(toUploadImageType("data:image/png;base64,AAwebpAAgifAA")).toBe(
      "image/png",
    )
  })
})
