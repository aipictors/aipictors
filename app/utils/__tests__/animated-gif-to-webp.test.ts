import { describe, expect, test } from "bun:test"
import { deflateSync, inflateSync } from "node:zlib"
import {
  composeGifFrames,
  type GifFrame,
  isAnimatedGifBytes,
  isAnimatedPngBytes,
  isAnimatedWebpBytes,
  isGifBytes,
  MAX_ANIMATION_PIXELS,
  readAnimatedWebpInfo,
  readPngChunks,
  splitApng,
  toAnimationScale,
  toCropRect,
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

const u32 = (value: number) => {
  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setUint32(0, value)
  return bytes
}

const concat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(
    parts.reduce((total, part) => total + part.length, 0),
  )
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

const chunk = (type: string, data: Uint8Array) => {
  const body = concat(ascii(type), data)
  return concat(u32(data.length), body, u32(Bun.hash.crc32(body)))
}

const PNG_SIGNATURE = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])

/** 幅 width・高さ height の RGBA の 1 色の画像の圧縮した中身 */
const solidPixels = (width: number, height: number, value: number) => {
  const row = new Uint8Array(1 + width * 4).fill(value)
  row[0] = 0
  return new Uint8Array(deflateSync(concat(...Array(height).fill(row))))
}

const fcTL = (props: {
  sequence: number
  width: number
  height: number
  left: number
  top: number
  delay: [number, number]
  disposeOp: number
  blendOp: number
}) => {
  const data = new Uint8Array(26)
  const view = new DataView(data.buffer)
  view.setUint32(0, props.sequence)
  view.setUint32(4, props.width)
  view.setUint32(8, props.height)
  view.setUint32(12, props.left)
  view.setUint32(16, props.top)
  view.setUint16(20, props.delay[0])
  view.setUint16(22, props.delay[1])
  data[24] = props.disposeOp
  data[25] = props.blendOp
  return chunk("fcTL", data)
}

/** 4×2 の 2 コマの APNG（2 コマ目は右下の 2×1 だけ） */
const sampleApng = () =>
  concat(
    PNG_SIGNATURE,
    chunk("IHDR", concat(u32(4), u32(2), Uint8Array.from([8, 6, 0, 0, 0]))),
    chunk("acTL", concat(u32(2), u32(0))),
    fcTL({
      sequence: 0,
      width: 4,
      height: 2,
      left: 0,
      top: 0,
      delay: [1, 10],
      disposeOp: 0,
      blendOp: 0,
    }),
    chunk("IDAT", solidPixels(4, 2, 10)),
    fcTL({
      sequence: 1,
      width: 2,
      height: 1,
      left: 2,
      top: 1,
      delay: [0, 0],
      disposeOp: 1,
      blendOp: 1,
    }),
    chunk("fdAT", concat(u32(2), solidPixels(2, 1, 200))),
    chunk("IEND", new Uint8Array(0)),
  )

describe("APNG", () => {
  test("acTL があれば APNG、普通の PNG・ほかの形式は違う", () => {
    const apng = sampleApng()
    expect(isAnimatedPngBytes(apng)).toBe(true)
    const still = concat(
      PNG_SIGNATURE,
      chunk("IHDR", concat(u32(1), u32(1), Uint8Array.from([8, 6, 0, 0, 0]))),
      chunk("IDAT", solidPixels(1, 1, 0)),
      chunk("IEND", new Uint8Array(0)),
    )
    expect(isAnimatedPngBytes(still)).toBe(false)
    expect(isAnimatedPngBytes(ascii("GIF89a...."))).toBe(false)
  })

  test("コマごとの普通の PNG に分ける（大きさ・位置・表示時間・fdAT を IDAT に）", () => {
    const result = splitApng(sampleApng())
    expect(result?.width).toBe(4)
    expect(result?.height).toBe(2)
    const [first, second] = result?.frames ?? []
    expect(first.delay).toBe(100)
    expect(second).toMatchObject({
      width: 2,
      height: 1,
      left: 2,
      top: 1,
      delay: 100,
      disposeOp: 1,
      blendOp: 1,
    })

    const chunks = readPngChunks(second.png)
    expect(chunks.map((item) => item.type)).toEqual(["IHDR", "IDAT", "IEND"])
    const view = new DataView(chunks[0].data.buffer, chunks[0].data.byteOffset)
    expect([view.getUint32(0), view.getUint32(4)]).toEqual([2, 1])
    // 連番を外した中身が、そのまま展開できる
    expect(Array.from(inflateSync(chunks[1].data))).toEqual([
      0,
      ...Array(8).fill(200),
    ])
    // CRC も正しい（ブラウザが読める）
    for (let offset = 8; offset < second.png.length; ) {
      const length = new DataView(second.png.buffer).getUint32(offset)
      const body = second.png.subarray(offset + 4, offset + 8 + length)
      const crc = new DataView(second.png.buffer).getUint32(offset + 8 + length)
      expect(crc).toBe(Bun.hash.crc32(body))
      offset += 12 + length
    }
  })

  test("アニメーションでない PNG は null", () => {
    const still = concat(
      PNG_SIGNATURE,
      chunk("IHDR", concat(u32(1), u32(1), Uint8Array.from([8, 6, 0, 0, 0]))),
      chunk("IDAT", solidPixels(1, 1, 0)),
      chunk("IEND", new Uint8Array(0)),
    )
    expect(splitApng(still)).toBeNull()
  })
})

describe("アニメーション WebP", () => {
  /** VP8X（アニメーションの印あり・幅 300・高さ 200）と ANMF 3 つ */
  const sampleWebp = (flags: number) => {
    const vp8x = new Uint8Array(10)
    vp8x[0] = flags
    vp8x.set([299 & 0xff, 299 >> 8, 0], 4)
    vp8x.set([199 & 0xff, 199 >> 8, 0], 7)
    const riffChunk = (type: string, data: Uint8Array) => {
      const size = new Uint8Array(4)
      new DataView(size.buffer).setUint32(0, data.length, true)
      return concat(
        ascii(type),
        size,
        data,
        data.length % 2 ? new Uint8Array(1) : new Uint8Array(0),
      )
    }
    const body = concat(
      ascii("WEBP"),
      riffChunk("VP8X", vp8x),
      riffChunk("ANIM", new Uint8Array(6)),
      riffChunk("ANMF", new Uint8Array(17)),
      riffChunk("ANMF", new Uint8Array(16)),
      riffChunk("ANMF", new Uint8Array(16)),
    )
    const size = new Uint8Array(4)
    new DataView(size.buffer).setUint32(0, body.length, true)
    return concat(ascii("RIFF"), size, body)
  }

  test("VP8X のアニメーションの印で見分ける", () => {
    expect(isAnimatedWebpBytes(sampleWebp(0x02))).toBe(true)
    expect(isAnimatedWebpBytes(sampleWebp(0x10))).toBe(false)
    expect(isAnimatedWebpBytes(ascii("RIFF....WEBPVP8 ...."))).toBe(false)
  })

  test("大きさとコマ数を読む", () => {
    expect(readAnimatedWebpInfo(sampleWebp(0x02))).toEqual({
      width: 300,
      height: 200,
      frameCount: 3,
    })
  })
})

describe("toCropRect", () => {
  test("crop がなければ全体", () => {
    expect(toCropRect(300, 200)).toEqual({
      x: 0,
      y: 0,
      width: 300,
      height: 200,
    })
  })

  test("正方形は短い辺に合わせて中央を切り抜く", () => {
    expect(toCropRect(300, 200, { width: 240, height: 240 })).toEqual({
      x: 50,
      y: 0,
      width: 200,
      height: 200,
    })
    expect(toCropRect(200, 300, { width: 240, height: 240 })).toEqual({
      x: 0,
      y: 50,
      width: 200,
      height: 200,
    })
  })

  test("横長（3:1）のヘッダー", () => {
    expect(toCropRect(600, 600, { width: 1200, height: 400 })).toEqual({
      x: 0,
      y: 200,
      width: 600,
      height: 200,
    })
    expect(toCropRect(1500, 300, { width: 1200, height: 400 })).toEqual({
      x: 300,
      y: 0,
      width: 900,
      height: 300,
    })
  })
})

describe("isAnimatedGifBytes", () => {
  /** 1×1 の GIF（グローバルの色表 2 色）を frames コマ */
  const gif = (frames: number) => {
    const header = concat(
      ascii("GIF89a"),
      Uint8Array.from([1, 0, 1, 0, 0x80, 0, 0]),
      new Uint8Array(6),
    )
    const gce = Uint8Array.from([0x21, 0xf9, 4, 0, 10, 0, 0, 0])
    const image = Uint8Array.from([
      0x2c, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 0x4c, 0x01, 0,
    ])
    return concat(
      header,
      ...Array.from({ length: frames }, () => concat(gce, image)),
      Uint8Array.from([0x3b]),
    )
  }

  test("2 コマ以上の GIF だけをアニメーションとみなす（1 コマの GIF は静止画）", () => {
    expect(isAnimatedGifBytes(gif(1))).toBe(false)
    expect(isAnimatedGifBytes(gif(2))).toBe(true)
    expect(isAnimatedGifBytes(ascii("RIFF....WEBP"))).toBe(false)
  })
})
