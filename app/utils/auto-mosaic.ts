// onnxruntime-web の package.json は型を exports に出していないので、同じ版の onnxruntime-common から型を取る
import type * as Ort from "onnxruntime-common"

/**
 * 自動モザイク（ベータ）
 * 性器などの範囲をブラウザの中で検出して、形に沿ったマスクを返す（サーバーは使わない）
 *
 * - モデル: アニメ絵向けのセグメンテーション（YOLO26n-seg、public/nsfw_model/README.md）
 * - onnxruntime-web は本番のビルドに wasm（約 11MB）を入れないよう CDN から読む
 */

const ORT_VERSION = "1.21.1"
const ORT_BASE_URL = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`
const MODEL_URL = "/nsfw_model/anime-nsfw-seg-yolo26n-v1.onnx"

const INPUT_SIZE = 640
const CLASS_COUNT = 7
const MASK_COEF_COUNT = 32

/** モデルの分類（並びはモデルのとおり） */
const LABELS = [
  "anus",
  "nipple",
  "penis",
  "vagina",
  "female face",
  "male face",
  "pubic hair",
] as const

export type AutoMosaicLabel = (typeof LABELS)[number]

const GENITAL_LABELS: AutoMosaicLabel[] = ["anus", "penis", "vagina"]

type Detection = {
  label: AutoMosaicLabel
  score: number
  box: [number, number, number, number]
  coefs: Float32Array
}

export type AutoMosaicResult = {
  /** 画像と同じ大きさ。モザイクをかける所だけ不透明 */
  mask: HTMLCanvasElement
  detections: { label: AutoMosaicLabel; score: number }[]
}

let sessionPromise: Promise<{
  ort: typeof Ort
  session: Ort.InferenceSession
}> | null = null

const loadSession = () => {
  if (sessionPromise === null) {
    sessionPromise = (async () => {
      const ort: typeof Ort = await import(
        /* @vite-ignore */ `${ORT_BASE_URL}ort.wasm.min.mjs`
      )
      ort.env.wasm.wasmPaths = ORT_BASE_URL
      const session = await ort.InferenceSession.create(MODEL_URL, {
        executionProviders: ["wasm"],
      })
      return { ort, session }
    })()
    // 失敗したら次の押下で読み直す
    sessionPromise.catch(() => {
      sessionPromise = null
    })
  }
  return sessionPromise
}

/**
 * 検出の部品（wasm 約 11MB・モデル 5.9MB）を先に読み始める。押してから読むと 1 回目がとても遅い。
 * データ節約モードの端末では読まない
 */
export function preloadAutoMosaic() {
  if (typeof window === "undefined") return
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection
  if (connection?.saveData) return
  loadSession().catch(() => {
    // 押したときにもう一度読む
  })
}

const iou = (a: Detection["box"], b: Detection["box"]) => {
  const x1 = Math.max(a[0], b[0])
  const y1 = Math.max(a[1], b[1])
  const x2 = Math.min(a[2], b[2])
  const y2 = Math.min(a[3], b[3])
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
  const areaA = (a[2] - a[0]) * (a[3] - a[1])
  const areaB = (b[2] - b[0]) * (b[3] - b[1])
  return inter / (areaA + areaB - inter + 1e-6)
}

/**
 * 画像の範囲を検出してマスクを作る
 * @param image 元の画像（読み込み済み）
 * @param options.includeNipples 乳首も対象にする（規約では不要なので既定はしない）
 */
export async function detectAutoMosaic(
  image: HTMLImageElement | HTMLCanvasElement,
  options: { includeNipples?: boolean; minScore?: number } = {},
): Promise<AutoMosaicResult> {
  const { ort, session } = await loadSession()

  const width = image.width
  const height = image.height
  const targets = new Set<AutoMosaicLabel>(
    options.includeNipples ? [...GENITAL_LABELS, "nipple"] : GENITAL_LABELS,
  )
  const minScore = options.minScore ?? 0.25

  // 長辺を 640 に縮めて、余りは灰色で埋める（学習時と同じ）
  const ratio = INPUT_SIZE / Math.max(width, height)
  const scaledWidth = Math.round(width * ratio)
  const scaledHeight = Math.round(height * ratio)
  const padX = Math.floor((INPUT_SIZE - scaledWidth) / 2)
  const padY = Math.floor((INPUT_SIZE - scaledHeight) / 2)

  const inputCanvas = document.createElement("canvas")
  inputCanvas.width = INPUT_SIZE
  inputCanvas.height = INPUT_SIZE
  const inputCtx = inputCanvas.getContext("2d", { willReadFrequently: true })
  if (inputCtx === null) throw new Error("canvas is not supported")
  inputCtx.fillStyle = "rgb(114, 114, 114)"
  inputCtx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE)
  inputCtx.drawImage(image, padX, padY, scaledWidth, scaledHeight)
  const pixels = inputCtx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data

  const area = INPUT_SIZE * INPUT_SIZE
  const input = new Float32Array(area * 3)
  for (let i = 0; i < area; i++) {
    input[i] = pixels[i * 4] / 255
    input[i + area] = pixels[i * 4 + 1] / 255
    input[i + area * 2] = pixels[i * 4 + 2] / 255
  }

  const outputs = await session.run({
    [session.inputNames[0]]: new ort.Tensor("float32", input, [
      1,
      3,
      INPUT_SIZE,
      INPUT_SIZE,
    ]),
  })
  const predictions = outputs[session.outputNames[0]]
  const protos = outputs[session.outputNames[1]]
  const pred = predictions.data as Float32Array
  const proto = protos.data as Float32Array
  const channels = predictions.dims[1]
  const anchors = predictions.dims[2]
  const maskHeight = protos.dims[2]
  const maskWidth = protos.dims[3]

  if (channels !== 4 + CLASS_COUNT + MASK_COEF_COUNT) {
    throw new Error("unexpected model output")
  }

  // 候補を集める（出力は [1, 4 + 分類 + 係数, anchors]）
  const candidates: Detection[] = []
  for (let a = 0; a < anchors; a++) {
    let best = 0
    let bestClass = 0
    for (let c = 0; c < CLASS_COUNT; c++) {
      const s = pred[(4 + c) * anchors + a]
      if (s > best) {
        best = s
        bestClass = c
      }
    }
    const label = LABELS[bestClass]
    if (best < minScore || !targets.has(label)) continue
    const cx = pred[a]
    const cy = pred[anchors + a]
    const w = pred[2 * anchors + a]
    const h = pred[3 * anchors + a]
    const coefs = new Float32Array(MASK_COEF_COUNT)
    for (let k = 0; k < MASK_COEF_COUNT; k++) {
      coefs[k] = pred[(4 + CLASS_COUNT + k) * anchors + a]
    }
    candidates.push({
      label,
      score: best,
      box: [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2],
      coefs,
    })
  }

  // 重なった候補はスコアの高い方だけ残す
  candidates.sort((a, b) => b.score - a.score)
  const detections: Detection[] = []
  for (const candidate of candidates) {
    if (detections.some((d) => iou(d.box, candidate.box) > 0.5)) continue
    detections.push(candidate)
  }

  // マスク（プロトタイプの解像度で作ってから広げる）
  const cellScale = maskWidth / INPUT_SIZE
  const binary = new Uint8Array(maskWidth * maskHeight)
  const protoArea = maskWidth * maskHeight
  for (const d of detections) {
    const x1 = Math.max(0, Math.floor(d.box[0] * cellScale))
    const y1 = Math.max(0, Math.floor(d.box[1] * cellScale))
    const x2 = Math.min(maskWidth, Math.ceil(d.box[2] * cellScale))
    const y2 = Math.min(maskHeight, Math.ceil(d.box[3] * cellScale))
    for (let y = y1; y < y2; y++) {
      for (let x = x1; x < x2; x++) {
        const p = y * maskWidth + x
        let v = 0
        for (let k = 0; k < MASK_COEF_COUNT; k++) {
          v += d.coefs[k] * proto[k * protoArea + p]
        }
        // sigmoid(v) > 0.5 と同じ
        if (v > 0) binary[p] = 1
      }
    }
  }

  // 縁が残らないよう少し太らせる（約 2 マス = 640 の画像で 8px）
  const grown = dilate(binary, maskWidth, maskHeight, 2)

  const maskCanvas = document.createElement("canvas")
  maskCanvas.width = width
  maskCanvas.height = height
  const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true })
  if (maskCtx === null) throw new Error("canvas is not supported")

  if (detections.length > 0) {
    const small = document.createElement("canvas")
    small.width = maskWidth
    small.height = maskHeight
    const smallCtx = small.getContext("2d")
    if (smallCtx === null) throw new Error("canvas is not supported")
    const smallData = smallCtx.createImageData(maskWidth, maskHeight)
    for (let p = 0; p < grown.length; p++) {
      smallData.data[p * 4 + 3] = grown[p] ? 255 : 0
    }
    smallCtx.putImageData(smallData, 0, 0)

    // 余白を除いた範囲を元の画像の大きさに引き伸ばす（なめらかに広げてから、少しでも掛かった所は全部隠す）
    maskCtx.imageSmoothingEnabled = true
    maskCtx.drawImage(
      small,
      padX * cellScale,
      padY * cellScale,
      scaledWidth * cellScale,
      scaledHeight * cellScale,
      0,
      0,
      width,
      height,
    )
    const full = maskCtx.getImageData(0, 0, width, height)
    for (let i = 3; i < full.data.length; i += 4) {
      full.data[i] = full.data[i] > 16 ? 255 : 0
    }
    maskCtx.putImageData(full, 0, 0)
  }

  return {
    mask: maskCanvas,
    detections: detections.map((d) => ({ label: d.label, score: d.score })),
  }
}

/** 2 値の画像を r マス太らせる */
function dilate(src: Uint8Array, width: number, height: number, r: number) {
  const dst = new Uint8Array(src.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!src[y * width + x]) continue
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= height) continue
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx
          if (xx < 0 || xx >= width) continue
          if (dx * dx + dy * dy > r * r + r) continue
          dst[yy * width + xx] = 1
        }
      }
    }
  }
  return dst
}

/** 画像を読み込む（キャンバスに描いて読み出せるよう crossOrigin を付ける） */
export function loadMosaicImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "Anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("image load failed"))
    image.src = src
  })
}

/**
 * 画像全体をピクセル化したキャンバス（長辺の 1/blockDivisions のマスを平均色で塗る。MosaicCanvas と同じ）
 * マスごとに fillRect すると数千回の描画になって遅いので、平均色を 1 マス 1 画素の小さな画像に書き、
 * ぼかさずに引き伸ばす（仕上がりは同じ）
 */
export function createPixelatedCanvas(
  source: HTMLImageElement | HTMLCanvasElement,
  blockDivisions = 100,
): HTMLCanvasElement {
  const width = source.width
  const height = source.height
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (ctx === null) throw new Error("canvas is not supported")
  ctx.drawImage(source, 0, 0, width, height)
  const block = Math.max(1, Math.ceil(Math.max(width, height) / blockDivisions))
  const data = ctx.getImageData(0, 0, width, height).data
  const columns = Math.ceil(width / block)
  const rows = Math.ceil(height / block)

  // マスごとの色の合計（1 行ずつ足していく）
  const sums = new Float64Array(columns * rows * 3)
  const counts = new Uint32Array(columns * rows)
  for (let y = 0; y < height; y++) {
    const rowOffset = Math.floor(y / block) * columns
    let i = y * width * 4
    for (let x = 0; x < width; x++, i += 4) {
      const cell = rowOffset + Math.floor(x / block)
      sums[cell * 3] += data[i]
      sums[cell * 3 + 1] += data[i + 1]
      sums[cell * 3 + 2] += data[i + 2]
      counts[cell]++
    }
  }

  const small = document.createElement("canvas")
  small.width = columns
  small.height = rows
  const smallCtx = small.getContext("2d")
  if (smallCtx === null) throw new Error("canvas is not supported")
  const averages = smallCtx.createImageData(columns, rows)
  for (let cell = 0; cell < counts.length; cell++) {
    const count = counts[cell] || 1
    averages.data[cell * 4] = Math.round(sums[cell * 3] / count)
    averages.data[cell * 4 + 1] = Math.round(sums[cell * 3 + 1] / count)
    averages.data[cell * 4 + 2] = Math.round(sums[cell * 3 + 2] / count)
    averages.data[cell * 4 + 3] = 255
  }
  smallCtx.putImageData(averages, 0, 0)

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(small, 0, 0, columns * block, rows * block)
  small.width = 0
  small.height = 0
  return canvas
}

/** マスクの不透明な所だけピクセル化した画像を残したレイヤー */
export function createMaskedMosaicLayer(
  pixelated: HTMLCanvasElement,
  mask: HTMLCanvasElement,
): HTMLCanvasElement {
  const layer = document.createElement("canvas")
  layer.width = pixelated.width
  layer.height = pixelated.height
  const ctx = layer.getContext("2d")
  if (ctx === null) throw new Error("canvas is not supported")
  ctx.drawImage(mask, 0, 0, layer.width, layer.height)
  ctx.globalCompositeOperation = "source-in"
  ctx.drawImage(pixelated, 0, 0)
  return layer
}

/** GIF・アニメーション WebP（キャンバスに描くと動きが消える） */
export function isAnimatedImageDataUrl(src: string) {
  if (src.startsWith("data:image/gif")) return true
  if (!src.startsWith("data:image/webp")) return false
  try {
    const start = src.indexOf(",") + 1
    return atob(src.slice(start, start + 400)).includes("ANIM")
  } catch {
    return false
  }
}

/**
 * 1 枚に自動モザイクをかける（見つからなければ dataUrl は null）
 */
export async function autoMosaicImage(
  src: string,
  options: { includeNipples?: boolean } = {},
): Promise<{ dataUrl: string | null; count: number }> {
  const image = await loadMosaicImage(src)
  const result = await detectAutoMosaic(image, options)
  if (result.detections.length === 0) return { dataUrl: null, count: 0 }
  const canvas = document.createElement("canvas")
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext("2d")
  if (ctx === null) throw new Error("canvas is not supported")
  ctx.drawImage(image, 0, 0)
  ctx.drawImage(
    createMaskedMosaicLayer(createPixelatedCanvas(image), result.mask),
    0,
    0,
  )
  return {
    dataUrl: await canvasToWebpDataUrl(canvas),
    count: result.detections.length,
  }
}

/**
 * キャンバスを WebP の data URL にする。toDataURL は書き出しが終わるまで画面が止まるので toBlob を使う
 * （WebP を書き出せないブラウザでは PNG になるのは toDataURL と同じ）
 */
export function canvasToWebpDataUrl(canvas: HTMLCanvasElement) {
  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob === null) {
        reject(new Error("Failed to encode image"))
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result)
        else reject(new Error("Failed to read image"))
      }
      reader.onerror = () => reject(new Error("Failed to read image"))
      reader.readAsDataURL(blob)
    }, "image/webp")
  })
}

const SENSITIVE_PROMPT_PATTERN =
  /\b(nsfw|nude|nudity|naked|nipples?|pussy|penis|vagina|vulva|sex|cum|cock|dick|explicit|uncensored|fellatio|anus|genitals?)\b|全裸|性器|ヌード/i

/** 生成情報のプロンプトが R18 らしいか（手元の文字を見るだけ） */
export function isSensitivePrompt(prompt: string | null | undefined) {
  return prompt ? SENSITIVE_PROMPT_PATTERN.test(prompt) : false
}
