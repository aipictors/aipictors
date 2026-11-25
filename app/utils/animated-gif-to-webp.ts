/**
 * アニメーション画像（GIF・APNG・アニメーション WebP）を、アニメーションのまま WebP にする
 * （作品・スタンプ・プロフィールのアイコンとヘッダーの投稿用）。
 *
 * canvas で WebP にすると 1 コマ目だけの静止画になってしまうので、コマを展開して
 * libwebp（wasm-webp）でアニメーション WebP に書き出す。GIF より軽くなり（同じ見た目で半分ほど）、
 * 縮小の Worker はアニメーション画像を元の画像のまま返すので、そのまま動いて表示される。
 * 変換の部品（wasm 約 480KB）はアニメーション画像を選んだときだけ読み込む。
 */

export type AnimatedGifOptions = {
  /** 長い辺の上限（px）。大きいときは縮める */
  maxSide: number
  /** WebP の画質（0〜100） */
  quality: number
  /**
   * 指定すると、この縦横比で中央を切り抜き、この大きさ以内にする（アイコン・ヘッダー用。
   * アニメーションは切り抜きの画面で扱えないので、自動で中央を使う）
   */
  crop?: { width: number; height: number }
}

/** 作品の画像 */
export const WORK_ANIMATED_GIF_OPTIONS: AnimatedGifOptions = {
  maxSide: 2048,
  quality: 82,
}

/** スタンプ（表示は 240px ほど） */
export const STICKER_ANIMATED_GIF_OPTIONS: AnimatedGifOptions = {
  maxSide: 512,
  quality: 75,
}

/** プロフィールのアイコン（切り抜きの画面と同じ 240px の正方形） */
export const PROFILE_ICON_ANIMATED_OPTIONS: AnimatedGifOptions = {
  maxSide: 240,
  quality: 80,
  crop: { width: 240, height: 240 },
}

/** プロフィールのヘッダー（切り抜きの画面と同じ 1200×400） */
export const PROFILE_HEADER_ANIMATED_OPTIONS: AnimatedGifOptions = {
  maxSide: 1200,
  quality: 80,
  crop: { width: 1200, height: 400 },
}

/**
 * 展開する画素の合計（幅 × 高さ × コマ数）の上限。1 画素 4 バイトなので約 100MB。
 * 超えるときは縮めてから変換する（スマートフォンでメモリ切れで落ちないように）
 */
export const MAX_ANIMATION_PIXELS = 24_000_000

/** 読み込むアニメーション画像の大きさの上限（投稿できる画像と同じ） */
const MAX_GIF_BYTES = 32 * 1024 * 1024

/** 変換できなかったとき・変換しても軽くならないときに、元の形式のまま投稿してよい大きさ */
const MAX_FALLBACK_GIF_BYTES = 8 * 1024 * 1024

export type GifFrame = {
  dims: { left: number; top: number; width: number; height: number }
  /** コマの範囲の RGBA */
  patch: Uint8ClampedArray
  /** ミリ秒 */
  delay: number
  disposalType: number
}

export type RgbaFrame = { data: Uint8Array; duration: number }

/** 先頭のバイトで GIF か見分ける（拡張子や file.type は当てにしない） */
export const isGifBytes = (bytes: Uint8Array) =>
  bytes.length >= 6 &&
  String.fromCharCode(...bytes.subarray(0, 6)).match(/^GIF8[79]a$/) !== null

/** 先頭のバイトで PNG か見分ける */
export const isPngBytes = (bytes: Uint8Array) =>
  bytes.length >= 8 &&
  bytes[0] === 0x89 &&
  bytes[1] === 0x50 &&
  bytes[2] === 0x4e &&
  bytes[3] === 0x47

/** 先頭のバイトでアニメーション WebP か見分ける（VP8X のアニメーションの印） */
export const isAnimatedWebpBytes = (bytes: Uint8Array) =>
  bytes.length >= 21 &&
  String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
  String.fromCharCode(...bytes.subarray(8, 16)) === "WEBPVP8X" &&
  (bytes[20] & 0x02) !== 0

const readUint32 = (bytes: Uint8Array, offset: number) =>
  ((bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]) >>>
  0

const readUint16 = (bytes: Uint8Array, offset: number) =>
  (bytes[offset] << 8) | bytes[offset + 1]

const readUint24LE = (bytes: Uint8Array, offset: number) =>
  bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16)

/** アニメーション WebP の大きさとコマ数（RIFF のチャンクを数える。展開する前に大きさを確かめる） */
export const readAnimatedWebpInfo = (bytes: Uint8Array) => {
  const width = readUint24LE(bytes, 24) + 1
  const height = readUint24LE(bytes, 27) + 1
  let frameCount = 0
  let offset = 12
  while (offset + 8 <= bytes.length) {
    const type = String.fromCharCode(...bytes.subarray(offset, offset + 4))
    const size =
      bytes[offset + 4] |
      (bytes[offset + 5] << 8) |
      (bytes[offset + 6] << 16) |
      (bytes[offset + 7] << 24)
    if (type === "ANMF") frameCount++
    offset += 8 + size + (size % 2)
  }
  return { width, height, frameCount }
}

export type PngChunk = { type: string; data: Uint8Array }

/** PNG をチャンクに分ける（壊れていたら途中まで） */
export const readPngChunks = (bytes: Uint8Array): PngChunk[] => {
  const chunks: PngChunk[] = []
  let offset = 8
  while (offset + 12 <= bytes.length) {
    const length = readUint32(bytes, offset)
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8))
    const end = offset + 12 + length
    if (end > bytes.length) break
    chunks.push({ type, data: bytes.subarray(offset + 8, offset + 8 + length) })
    if (type === "IEND") break
    offset = end
  }
  return chunks
}

/** PNG の先頭のチャンクに acTL（アニメーションの印）があるか。IDAT より前にあるので先頭だけ見る */
export const isAnimatedPngBytes = (bytes: Uint8Array) => {
  if (!isPngBytes(bytes)) return false
  let offset = 8
  while (offset + 8 <= bytes.length) {
    const length = readUint32(bytes, offset)
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8))
    if (type === "acTL") return true
    if (type === "IDAT" || type === "IEND") return false
    offset += 12 + length
  }
  return false
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

const crc32 = (bytes: Uint8Array) => {
  let c = 0xffffffff
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const toPngChunkBytes = (type: string, data: Uint8Array) => {
  const out = new Uint8Array(12 + data.length)
  const view = new DataView(out.buffer)
  view.setUint32(0, data.length)
  out.set(
    Uint8Array.from(type, (c) => c.charCodeAt(0)),
    4,
  )
  out.set(data, 8)
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)))
  return out
}

export type ApngFrame = {
  width: number
  height: number
  left: number
  top: number
  /** ミリ秒 */
  delay: number
  /** 0: そのまま 1: 表示後に透明に戻す 2: 描く前の状態に戻す */
  disposeOp: number
  /** 0: 範囲を置き換える 1: 上に重ねる */
  blendOp: number
  /** このコマだけの PNG（ブラウザで読める形） */
  png: Uint8Array
}

/**
 * APNG を、コマごとの普通の PNG に分ける（IHDR の大きさをコマの大きさにし、fdAT を IDAT に戻す）。
 * アニメーションでなければ null
 */
export const splitApng = (
  bytes: Uint8Array,
): { width: number; height: number; frames: ApngFrame[] } | null => {
  const chunks = readPngChunks(bytes)
  const ihdr = chunks.find((chunk) => chunk.type === "IHDR")
  if (!ihdr || !chunks.some((chunk) => chunk.type === "acTL")) return null
  const width = readUint32(ihdr.data, 0)
  const height = readUint32(ihdr.data, 4)
  // パレット・透明色・色空間など、どのコマにも要るチャンク
  const shared = chunks.filter((chunk) =>
    ["PLTE", "tRNS", "gAMA", "cHRM", "sRGB", "iCCP", "sBIT"].includes(
      chunk.type,
    ),
  )
  type Pending = Omit<ApngFrame, "png"> & { data: Uint8Array[] }
  const pendings: Pending[] = []
  let current: Pending | null = null
  for (const chunk of chunks) {
    if (chunk.type === "fcTL") {
      const delayNumerator = readUint16(chunk.data, 20)
      const delayDenominator = readUint16(chunk.data, 22) || 100
      current = {
        width: readUint32(chunk.data, 4),
        height: readUint32(chunk.data, 8),
        left: readUint32(chunk.data, 12),
        top: readUint32(chunk.data, 16),
        delay: toFrameDuration((delayNumerator * 1000) / delayDenominator),
        disposeOp: chunk.data[24],
        blendOp: chunk.data[25],
        data: [],
      }
      pendings.push(current)
    } else if (chunk.type === "IDAT" && current !== null) {
      // fcTL より後の IDAT は 1 コマ目（前にあれば、アニメーションに含まれない代わりの画像）
      current.data.push(chunk.data)
    } else if (chunk.type === "fdAT" && current !== null) {
      current.data.push(chunk.data.subarray(4))
    }
  }
  const signature = bytes.subarray(0, 8)
  const frames = pendings
    .filter((pending) => pending.data.length > 0)
    .map(({ data, ...frame }): ApngFrame => {
      const header = ihdr.data.slice()
      new DataView(header.buffer).setUint32(0, frame.width)
      new DataView(header.buffer).setUint32(4, frame.height)
      const parts = [
        signature,
        toPngChunkBytes("IHDR", header),
        ...shared.map((chunk) => toPngChunkBytes(chunk.type, chunk.data)),
        ...data.map((part) => toPngChunkBytes("IDAT", part)),
        toPngChunkBytes("IEND", new Uint8Array(0)),
      ]
      const png = new Uint8Array(
        parts.reduce((total, part) => total + part.length, 0),
      )
      let offset = 0
      for (const part of parts) {
        png.set(part, offset)
        offset += part.length
      }
      return { ...frame, png }
    })
  return { width, height, frames }
}

/**
 * APNG のコマを順に重ねて、各コマの全体の画像を 1 枚ずつ返す（ブラウザの canvas で描く）
 */
async function* composeApngFrames(
  frames: ApngFrame[],
  width: number,
  height: number,
): AsyncGenerator<RgbaFrame> {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (context === null) throw new Error("Failed to get canvas context")
  try {
    for (const [index, frame] of frames.entries()) {
      const bitmap = await createImageBitmap(
        new Blob([new Uint8Array(frame.png)], { type: "image/png" }),
      )
      // 1 コマ目の「描く前の状態に戻す」は「透明に戻す」と同じ
      const disposeOp =
        index === 0 && frame.disposeOp === 2 ? 1 : frame.disposeOp
      const previous =
        disposeOp === 2 ? context.getImageData(0, 0, width, height) : null
      if (frame.blendOp === 0) {
        context.clearRect(frame.left, frame.top, frame.width, frame.height)
      }
      context.drawImage(bitmap, frame.left, frame.top)
      bitmap.close()
      yield {
        data: new Uint8Array(context.getImageData(0, 0, width, height).data),
        duration: frame.delay,
      }
      if (disposeOp === 1) {
        context.clearRect(frame.left, frame.top, frame.width, frame.height)
      } else if (previous !== null) {
        context.putImageData(previous, 0, 0)
      }
    }
  } finally {
    canvas.width = 0
  }
}

/**
 * 切り抜く範囲（元の画像の座標）。crop がなければ全体、あれば中央をその縦横比で
 */
export const toCropRect = (
  width: number,
  height: number,
  crop?: { width: number; height: number },
) => {
  if (!crop) return { x: 0, y: 0, width, height }
  const ratio = crop.width / crop.height
  const cropWidth = Math.min(width, Math.round(height * ratio))
  const cropHeight = Math.min(height, Math.round(cropWidth / ratio))
  return {
    x: Math.floor((width - cropWidth) / 2),
    y: Math.floor((height - cropHeight) / 2),
    width: cropWidth,
    height: cropHeight,
  }
}

/**
 * GIF のコマの表示時間。0〜10ms はブラウザが 100ms として表示するのに合わせる
 * （そのまま書き出すと、とても速く動いてしまう）
 */
export const toFrameDuration = (delay: number) =>
  delay <= 10 ? 100 : Math.round(delay)

/**
 * 縮小率。長い辺を maxSide 以内に、展開する画素の合計を MAX_ANIMATION_PIXELS 以内にする
 */
export const toAnimationScale = (
  width: number,
  height: number,
  frameCount: number,
  maxSide: number,
) =>
  Math.min(
    1,
    maxSide / Math.max(width, height),
    Math.sqrt(
      MAX_ANIMATION_PIXELS / (width * height * Math.max(1, frameCount)),
    ),
  )

/**
 * GIF のコマ（差分）を順に重ねて、各コマの全体の画像を 1 枚ずつ返す。
 * 全部のコマを一度に持つとメモリが足りなくなるので、使う側も 1 枚ずつ処理する。
 * disposal 2 は表示後にその範囲を透明に戻し、3 は描く前の状態に戻す
 */
export function* composeGifFrames(
  frames: Iterable<GifFrame>,
  width: number,
  height: number,
): Generator<RgbaFrame> {
  const canvas = new Uint8ClampedArray(width * height * 4)
  for (const frame of frames) {
    const { left, top, width: frameWidth, height: frameHeight } = frame.dims
    const previous = frame.disposalType === 3 ? canvas.slice() : null
    for (let y = 0; y < frameHeight; y++) {
      const canvasY = top + y
      if (canvasY < 0 || canvasY >= height) continue
      for (let x = 0; x < frameWidth; x++) {
        const canvasX = left + x
        if (canvasX < 0 || canvasX >= width) continue
        const source = (y * frameWidth + x) * 4
        if (frame.patch[source + 3] === 0) continue
        const target = (canvasY * width + canvasX) * 4
        canvas[target] = frame.patch[source]
        canvas[target + 1] = frame.patch[source + 1]
        canvas[target + 2] = frame.patch[source + 2]
        canvas[target + 3] = 255
      }
    }
    yield {
      data: new Uint8Array(canvas),
      duration: toFrameDuration(frame.delay),
    }
    if (frame.disposalType === 2) {
      for (let y = 0; y < frameHeight; y++) {
        const canvasY = top + y
        if (canvasY < 0 || canvasY >= height) continue
        const start = (canvasY * width + Math.max(0, left)) * 4
        const end = (canvasY * width + Math.min(width, left + frameWidth)) * 4
        canvas.fill(0, start, end)
      }
    } else if (previous !== null) {
      canvas.set(previous)
    }
  }
}

function scaleFrame(
  frame: RgbaFrame,
  width: number,
  height: number,
  rect: { x: number; y: number; width: number; height: number },
  nextWidth: number,
  nextHeight: number,
): RgbaFrame {
  const source = document.createElement("canvas")
  const target = document.createElement("canvas")
  try {
    source.width = width
    source.height = height
    target.width = nextWidth
    target.height = nextHeight
    const sourceContext = source.getContext("2d")
    const targetContext = target.getContext("2d")
    if (sourceContext === null || targetContext === null) {
      throw new Error("Failed to get canvas context")
    }
    sourceContext.putImageData(
      new ImageData(new Uint8ClampedArray(frame.data), width, height),
      0,
      0,
    )
    targetContext.imageSmoothingEnabled = true
    targetContext.imageSmoothingQuality = "high"
    targetContext.drawImage(
      source,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      0,
      0,
      nextWidth,
      nextHeight,
    )
    const scaled = targetContext.getImageData(0, 0, nextWidth, nextHeight)
    return {
      data: new Uint8Array(scaled.data.buffer),
      duration: frame.duration,
    }
  } finally {
    // 画素の領域をすぐ解放する
    source.width = 0
    target.width = 0
  }
}

type WebpModule = {
  VectorWebPAnimationFrame: new () => {
    push_back(frame: {
      duration: number
      data: Uint8Array
      config: { lossless: number; quality: number }
      has_config: boolean
    }): void
    delete(): void
  }
  encodeAnimation(
    width: number,
    height: number,
    hasAlpha: boolean,
    frames: unknown,
  ): Uint8Array | null
  decodeAnimation(
    data: Uint8Array,
    hasAlpha: boolean,
  ): { width: number; height: number; data: Uint8Array; duration: number }[]
}

let webpModule: Promise<WebpModule> | null = null

function loadWebpModule(): Promise<WebpModule> {
  if (webpModule === null) {
    webpModule = Promise.all([
      import("wasm-webp/dist/esm/webp-wasm.js"),
      import("wasm-webp/dist/esm/webp-wasm.wasm?url"),
    ]).then(([factory, wasm]) =>
      factory.default({ locateFile: () => wasm.default }),
    )
    // 読み込みに失敗したら次はやり直す
    webpModule.catch(() => {
      webpModule = null
    })
  }
  return webpModule
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }
      reject(new Error("Failed to read image"))
    }
    reader.onerror = () => reject(new Error("Failed to read image"))
    reader.readAsDataURL(blob)
  })

/**
 * GIF に 2 コマ以上あるか（画像の区切りを、拡張ブロックとデータを飛ばしながら数える。
 * 先頭だけでも 2 コマ目の区切りまで届けば分かる。サーバーの lib/animated-profile-image.ts と同じ）
 */
export const isAnimatedGifBytes = (bytes: Uint8Array) => {
  if (!isGifBytes(bytes) || bytes.length < 13) return false
  let offset = 13
  if (bytes[10] & 0x80) offset += 3 * 2 ** ((bytes[10] & 0x07) + 1)
  let frames = 0
  const skipSubBlocks = () => {
    while (offset < bytes.length) {
      const size = bytes[offset]
      offset += 1
      if (size === 0) return
      offset += size
    }
  }
  while (offset < bytes.length) {
    const marker = bytes[offset]
    if (marker === 0x2c) {
      frames += 1
      if (frames >= 2) return true
      const localFlags = bytes[offset + 9]
      offset += 10
      if (localFlags & 0x80) offset += 3 * 2 ** ((localFlags & 0x07) + 1)
      offset += 1
      skipSubBlocks()
    } else if (marker === 0x21) {
      offset += 2
      skipSubBlocks()
    } else {
      return false
    }
  }
  return false
}

/** アニメーション画像（2 コマ以上の GIF・APNG・アニメーション WebP）か、先頭だけ読んで調べる */
export const isAnimatedImageFile = async (file: Blob) => {
  const header = new Uint8Array(await file.slice(0, 256 * 1024).arrayBuffer())
  return (
    isAnimatedGifBytes(header) ||
    isAnimatedWebpBytes(header) ||
    isAnimatedPngBytes(header)
  )
}

type AnimationSource = {
  width: number
  height: number
  frameCount: number
  /** 元のファイルの形式（変換しないで使うとき） */
  type: "image/gif" | "image/png" | "image/webp"
  /** 各コマの全体の画像（1 枚ずつ取り出す） */
  frames: (module: WebpModule) => AsyncIterable<RgbaFrame> | Iterable<RgbaFrame>
}

/** 選んだファイルがアニメーション画像なら、コマを取り出す準備をする（違えば null） */
async function readAnimationSource(
  file: Blob,
): Promise<{ buffer: ArrayBuffer; source: AnimationSource } | null> {
  // 先頭だけ見て、アニメーションでなければ全体は読まない（スマートフォンで大きな写真を選んだとき遅くなる）
  // APNG の acTL は IDAT より前にあるが、その前に色空間などのチャンクが入ることがあるので少し多めに読む
  const header = new Uint8Array(await file.slice(0, 256 * 1024).arrayBuffer())
  const isGif = isGifBytes(header)
  const isWebp = isAnimatedWebpBytes(header)
  const isPng = isAnimatedPngBytes(header)
  if (!isGif && !isWebp && !isPng) return null

  const buffer = await file.arrayBuffer()
  if (buffer.byteLength > MAX_GIF_BYTES) {
    throw new Error("アニメーション画像が大きすぎます")
  }
  const bytes = new Uint8Array(buffer)

  if (isGif) {
    const { parseGIF, decompressFrame } = await import("gifuct-js")
    const gif = parseGIF(buffer)
    const imageFrames = gif.frames.filter((frame) => "image" in frame)
    if (imageFrames.length < 2) return null
    const width = gif.lsd.width
    const height = gif.lsd.height
    return {
      buffer,
      source: {
        width,
        height,
        frameCount: imageFrames.length,
        type: "image/gif",
        // コマは使うときに 1 枚ずつ展開する
        frames: () =>
          composeGifFrames(
            (function* () {
              for (const frame of imageFrames) {
                yield decompressFrame(
                  frame,
                  gif.gct,
                  true,
                ) as unknown as GifFrame
              }
            })(),
            width,
            height,
          ),
      },
    }
  }

  if (isPng) {
    const apng = splitApng(bytes)
    if (apng === null || apng.frames.length < 2) return null
    return {
      buffer,
      source: {
        width: apng.width,
        height: apng.height,
        frameCount: apng.frames.length,
        type: "image/png",
        frames: () => composeApngFrames(apng.frames, apng.width, apng.height),
      },
    }
  }

  const info = readAnimatedWebpInfo(bytes)
  if (info.frameCount < 2) return null
  // WebP は全部のコマを一度に展開するので、展開する前に大きさを確かめる
  if (info.width * info.height * info.frameCount > MAX_ANIMATION_PIXELS * 2) {
    throw new Error("アニメーション画像が大きすぎます")
  }
  return {
    buffer,
    source: {
      ...info,
      type: "image/webp",
      frames: (module) =>
        module.decodeAnimation(bytes, true).map((frame) => ({
          data: frame.data,
          duration: toFrameDuration(frame.duration),
        })),
    },
  }
}

/**
 * アニメーション画像（GIF・APNG・アニメーション WebP）なら、アニメーション WebP の data URL を返す。
 * それ以外・1 コマだけの画像は null（今まで通り静止画として扱う）。
 * 縮めも切り抜きもしないで済むとき、WebP にできなかったとき・元のほうが軽いときは、元の形式のまま返す
 */
export async function toAnimatedWebpDataUrl(
  file: Blob,
  options: AnimatedGifOptions,
): Promise<string | null> {
  const read = await readAnimationSource(file)
  if (read === null) return null
  const { buffer, source } = read
  const { width, height } = source

  const rect = toCropRect(width, height, options.crop)
  const isFullRect = rect.width === width && rect.height === height
  const scale = Math.min(
    toAnimationScale(
      rect.width,
      rect.height,
      source.frameCount,
      options.maxSide,
    ),
    options.crop ? options.crop.width / rect.width : 1,
  )
  const nextWidth = Math.max(1, Math.round(rect.width * scale))
  const nextHeight = Math.max(1, Math.round(rect.height * scale))
  const originalDataUrl = () =>
    blobToDataUrl(new Blob([buffer], { type: source.type }))
  const canUseOriginal =
    isFullRect && scale === 1 && buffer.byteLength <= MAX_FALLBACK_GIF_BYTES

  // アニメーション WebP は、そのまま使えるなら作り直さない（画質が落ちるだけ）
  if (source.type === "image/webp" && canUseOriginal) {
    return originalDataUrl()
  }

  let encoded: Uint8Array | null = null
  try {
    const module = await loadWebpModule()
    // 縮めるときは、全部のコマを元の大きさで持たないように 1 コマずつ縮める
    const vector = new module.VectorWebPAnimationFrame()
    try {
      for await (const composed of source.frames(module)) {
        const frame =
          isFullRect && scale === 1
            ? composed
            : scaleFrame(composed, width, height, rect, nextWidth, nextHeight)
        vector.push_back({
          duration: frame.duration,
          data: frame.data,
          config: { lossless: 0, quality: options.quality },
          has_config: true,
        })
      }
      encoded = module.encodeAnimation(nextWidth, nextHeight, true, vector)
    } finally {
      vector.delete()
    }
  } catch (error) {
    console.error("animated webp encode failed", error)
    if (canUseOriginal) return originalDataUrl()
    throw new Error("アニメーション画像を読み込めませんでした")
  }

  if (encoded === null || encoded.byteLength === 0) {
    if (canUseOriginal) return originalDataUrl()
    throw new Error("アニメーション画像を読み込めませんでした")
  }
  // APNG は軽くならなくても WebP にする（アプリの画像表示は APNG を動かせない）
  if (
    canUseOriginal &&
    source.type !== "image/png" &&
    encoded.byteLength >= buffer.byteLength
  ) {
    return originalDataUrl()
  }
  return blobToDataUrl(
    new Blob([new Uint8Array(encoded)], { type: "image/webp" }),
  )
}
