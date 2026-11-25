/**
 * アニメーション GIF を、アニメーションのまま WebP にする（作品・スタンプの投稿用）。
 *
 * canvas で WebP にすると 1 コマ目だけの静止画になってしまうので、GIF のコマを展開して
 * libwebp（wasm-webp）でアニメーション WebP に書き出す。GIF より軽くなり（同じ見た目で半分ほど）、
 * 縮小の Worker はアニメーション画像を元の画像のまま返すので、そのまま動いて表示される。
 * 変換の部品（wasm 約 480KB）は GIF を選んだときだけ読み込む。
 */

export type AnimatedGifOptions = {
  /** 長い辺の上限（px）。大きいときは縮める */
  maxSide: number
  /** WebP の画質（0〜100） */
  quality: number
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

/**
 * 展開する画素の合計（幅 × 高さ × コマ数）の上限。1 画素 4 バイトなので約 100MB。
 * 超えるときは縮めてから変換する（スマートフォンでメモリ切れで落ちないように）
 */
export const MAX_ANIMATION_PIXELS = 24_000_000

/** 読み込む GIF の大きさの上限（投稿できる画像と同じ） */
const MAX_GIF_BYTES = 32 * 1024 * 1024

/** 変換できなかったときに GIF のまま投稿してよい大きさ */
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
    targetContext.drawImage(source, 0, 0, nextWidth, nextHeight)
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
 * アニメーション GIF なら、アニメーション WebP の data URL を返す。
 * GIF 以外・1 コマだけの GIF は null（今まで通り静止画として扱う）。
 * WebP にできなかったとき・GIF のほうが軽いときは、縮める必要がなければ GIF のまま返す
 */
export async function toAnimatedWebpDataUrl(
  file: Blob,
  options: AnimatedGifOptions,
): Promise<string | null> {
  // GIF でなければ全体は読まない（スマートフォンで大きな写真を選んだとき遅くなる）
  const header = new Uint8Array(await file.slice(0, 6).arrayBuffer())
  if (!isGifBytes(header)) {
    return null
  }
  const buffer = await file.arrayBuffer()

  if (buffer.byteLength > MAX_GIF_BYTES) {
    throw new Error("GIF アニメーションが大きすぎます")
  }

  const { parseGIF, decompressFrame } = await import("gifuct-js")
  const gif = parseGIF(buffer)
  const imageFrames = gif.frames.filter((frame) => "image" in frame)
  if (imageFrames.length < 2) return null
  // コマは使うときに 1 枚ずつ展開する
  const frames = (function* () {
    for (const frame of imageFrames) {
      yield decompressFrame(frame, gif.gct, true) as unknown as GifFrame
    }
  })()

  const width = gif.lsd.width
  const height = gif.lsd.height
  const scale = toAnimationScale(
    width,
    height,
    imageFrames.length,
    options.maxSide,
  )
  const nextWidth = Math.max(1, Math.round(width * scale))
  const nextHeight = Math.max(1, Math.round(height * scale))
  const gifDataUrl = () =>
    blobToDataUrl(new Blob([buffer], { type: "image/gif" }))
  const canUseGif = scale === 1 && buffer.byteLength <= MAX_FALLBACK_GIF_BYTES

  let encoded: Uint8Array | null = null
  try {
    const module = await loadWebpModule()
    // 縮めるときは、全部のコマを元の大きさで持たないように 1 コマずつ縮める
    const vector = new module.VectorWebPAnimationFrame()
    try {
      for (const composed of composeGifFrames(frames, width, height)) {
        const frame =
          scale === 1
            ? composed
            : scaleFrame(composed, width, height, nextWidth, nextHeight)
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
    if (canUseGif) return gifDataUrl()
    throw new Error("GIF アニメーションを読み込めませんでした")
  }

  if (encoded === null || encoded.byteLength === 0) {
    if (canUseGif) return gifDataUrl()
    throw new Error("GIF アニメーションを読み込めませんでした")
  }
  if (canUseGif && encoded.byteLength >= buffer.byteLength) {
    return gifDataUrl()
  }
  return blobToDataUrl(
    new Blob([new Uint8Array(encoded)], { type: "image/webp" }),
  )
}
