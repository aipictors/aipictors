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

/** 長辺をこの大きさにして探す。640 は学習時と同じ、1024 は小さく写った所を拾う（モデルは入力の大きさを変えられる） */
const INPUT_SIZES = [640, 1024] as const
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

const DEFAULT_MIN_SCORE = 0.25
const MIN_SCORES: Partial<Record<AutoMosaicLabel, number>> = {
  anus: 0.15,
  penis: 0.22,
  vagina: 0.22,
}

type Detection = {
  label: AutoMosaicLabel
  score: number
  box: [number, number, number, number]
  coefs: Float32Array
}

export type AutoMosaicResult = {
  /** 画像と同じ大きさ。モザイクをかける所だけ不透明 */
  mask: HTMLCanvasElement
  /** box は元の画像の座標 [x1, y1, x2, y2] */
  detections: {
    label: AutoMosaicLabel
    score: number
    box: [number, number, number, number]
  }[]
}

type MosaicSession = {
  ort: typeof Ort
  session: Ort.InferenceSession
  /** WebGPU（GPU）で動いているか。false は wasm（CPU） */
  isGpu: boolean
}

let sessionPromise: Promise<MosaicSession> | null = null

/** WebGPU が使えるか（アダプターが取れるか） */
const canUseWebGpu = async () => {
  const gpu = (
    navigator as Navigator & {
      gpu?: { requestAdapter: () => Promise<unknown | null> }
    }
  ).gpu
  if (!gpu) return false
  try {
    return (await gpu.requestAdapter()) !== null
  } catch {
    return false
  }
}

/**
 * 検出のセッションを作る。WebGPU が使える端末は GPU で動かす（CPU の 10 倍ほど速い）。
 * 作れなければ同じ部品の wasm（CPU）で動かす
 */
const createSession = async (): Promise<MosaicSession> => {
  const isGpuAvailable = await canUseWebGpu()
  const ort: typeof Ort = await import(
    /* @vite-ignore */ `${ORT_BASE_URL}${isGpuAvailable ? "ort.webgpu.min.mjs" : "ort.wasm.min.mjs"}`
  )
  ort.env.wasm.wasmPaths = ORT_BASE_URL
  ort.env.logLevel = "error"
  if (isGpuAvailable) {
    try {
      const session = await ort.InferenceSession.create(MODEL_URL, {
        executionProviders: ["webgpu"],
        // 一部の処理が CPU に回る旨の警告を出さない
        logSeverityLevel: 3,
      })
      // 1 回目は GPU の準備（シェーダーの用意）で遅いので、画像を選ぶ前に両方の大きさで空回しする
      for (const size of INPUT_SIZES) {
        await runModel(ort, session, new Float32Array(3 * size * size), size)
      }
      return { ort, session, isGpu: true }
    } catch (error) {
      console.warn("auto mosaic: WebGPU is not available", error)
    }
  }
  const session = await ort.InferenceSession.create(MODEL_URL, {
    executionProviders: ["wasm"],
    logSeverityLevel: 3,
  })
  return { ort, session, isGpu: false }
}

const loadSession = () => {
  if (sessionPromise === null) {
    sessionPromise = createSession()
    // 失敗したら次の押下で読み直す
    sessionPromise.catch(() => {
      sessionPromise = null
    })
  }
  return sessionPromise
}

/** GPU で失敗したら（端末の GPU の不具合など）以後は CPU で動かす */
const fallbackToCpu = async (current: MosaicSession) => {
  const session = await current.ort.InferenceSession.create(MODEL_URL, {
    executionProviders: ["wasm"],
    logSeverityLevel: 3,
  })
  const next: MosaicSession = { ort: current.ort, session, isGpu: false }
  sessionPromise = Promise.resolve(next)
  return next
}

/** モデルを 1 回動かす。出力に数でない値が混じっていたら失敗として扱う（GPU の不具合対策） */
async function runModel(
  ort: typeof Ort,
  session: Ort.InferenceSession,
  input: Float32Array,
  size: number,
): Promise<{ predictions: Ort.Tensor; protos: Ort.Tensor }> {
  const outputs = await session.run({
    [session.inputNames[0]]: new ort.Tensor("float32", input, [
      1,
      3,
      size,
      size,
    ]),
  })
  const predictions = outputs[session.outputNames[0]]
  const protos = outputs[session.outputNames[1]]
  const pred = predictions.data as Float32Array
  for (let i = 0; i < pred.length; i += 997) {
    if (!Number.isFinite(pred[i])) throw new Error("invalid model output")
  }
  return { predictions, protos }
}

/**
 * 検出の部品（wasm 約 11MB〜21MB・モデル 5.9MB）を先に読み始める。押してから読むと 1 回目がとても遅い。
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
 * 分類ごとの確からしさの下限（minScore を渡したときは全部その値）
 * アヌスは小さく写ることが多く低めに出るので下げる。値は通報された作品と無修正の投稿で漏れと誤検出を数えて決めた
 */
export function minScoreForLabel(label: AutoMosaicLabel, override?: number) {
  if (override !== undefined) return override
  return MIN_SCORES[label] ?? DEFAULT_MIN_SCORE
}

/**
 * 画像に対して大きい範囲の検出に求める確からしさ（[画像に対する面積の割合, 下限]、大きい順）
 * 触手など性器に似た大きな形を低い確からしさで拾うと、画面の半分にモザイクがかかる。
 * 本物は大きく写っていても確からしさが高い（通報作品と無修正の投稿 93 枚で 13% で 0.60、24% で 0.83 が最小）ので、大きいほど下限を上げる
 */
const LARGE_AREA_MIN_SCORES: [number, number][] = [
  [0.35, 0.85],
  [0.2, 0.7],
  [0.1, 0.5],
]

/** 範囲の大きさ（画像に対する面積の割合 0〜1）で求める確からしさの下限（決まりがなければ 0） */
export function minScoreForArea(areaRatio: number) {
  return LARGE_AREA_MIN_SCORES.find(([ratio]) => areaRatio >= ratio)?.[1] ?? 0
}

/**
 * 触手を含む作品で、性器（ペニス）としては扱わない検出か
 * モデルは触手をペニスと見間違えやすい（公開済みの触手の R18 作品 150 枚で 175 件、多くは 0.3〜0.88）。
 * 確からしさが低いものと、画像の端から伸びているもの（触手は画面の外から入ってくる）を外すと、かかる面積が約 1/4 になる
 */
export function isTentacleLike(score: number, touchesEdge: boolean) {
  return score < 0.7 || (touchesEdge && score < 0.9)
}

/**
 * 脚を性器（ペニス）と見間違えた検出か
 * 太もも〜すねのような細長い肌色の形を 0.5 前後でペニスと見間違える（ドレスのスリットから出た脚など）。
 * 本物は細長く写っていても確からしさが高い（通報作品と無修正の投稿で縦横比 2.5 以上の本物は無し）ので、
 * 縦横比 2.5 以上で確からしさが 0.6 未満のものは外す。全年齢・R15 の公開作品 256 枚で外れるのは脚と人物だけ
 */
export function isLegLike(
  label: AutoMosaicLabel,
  score: number,
  width: number,
  height: number,
) {
  if (label !== "penis" || score >= 0.6) return false
  const long = Math.max(width, height)
  const short = Math.max(1e-6, Math.min(width, height))
  return long / short >= 2.5
}

/** 重なった検出はスコアの高い方だけ残す（大きさを変えて探した結果をまとめる） */
export function mergeDetections<
  T extends { score: number; box: Detection["box"] },
>(detections: T[]) {
  const sorted = [...detections].sort((a, b) => b.score - a.score)
  const kept: T[] = []
  for (const detection of sorted) {
    if (kept.some((k) => iou(k.box, detection.box) > 0.5)) continue
    kept.push(detection)
  }
  return kept
}

/**
 * 画像の範囲を検出してマスクを作る
 * 長辺 640 と 1024 の 2 回探してマスクを重ねる（1 枚に何人も描いた絵など、小さく写った所を 640 だけだと見落とす）
 * @param image 元の画像（読み込み済み）
 * @param options.includeNipples 乳首も対象にする（規約では不要なので既定はしない）
 */
export async function detectAutoMosaic(
  image: HTMLImageElement | HTMLCanvasElement,
  options: {
    includeNipples?: boolean
    minScore?: number
    /** 対象の分類を直接指定する（includeNipples より優先） */
    labels?: AutoMosaicLabel[]
    /** 触手を含む作品（触手らしいペニスの検出を外す） */
    tentacle?: boolean
  } = {},
): Promise<AutoMosaicResult> {
  let current = await loadSession()

  const width = image.width
  const height = image.height
  const targets = new Set<AutoMosaicLabel>(
    options.labels ??
      (options.includeNipples ? [...GENITAL_LABELS, "nipple"] : GENITAL_LABELS),
  )

  const maskCanvas = document.createElement("canvas")
  maskCanvas.width = width
  maskCanvas.height = height
  const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true })
  if (maskCtx === null) throw new Error("canvas is not supported")

  const found: AutoMosaicResult["detections"] = []
  for (const size of INPUT_SIZES) {
    const detect = (target: MosaicSession) =>
      detectAtSize(target, image, size, {
        targets,
        minScore: options.minScore,
        tentacle: options.tentacle,
        maskCtx,
      })
    let detections: AutoMosaicResult["detections"]
    try {
      detections = await detect(current)
    } catch (error) {
      if (!current.isGpu) throw error
      console.warn("auto mosaic: WebGPU failed, using CPU", error)
      current = await fallbackToCpu(current)
      detections = await detect(current)
    }
    found.push(...detections)
  }

  if (found.length > 0) {
    // 少しでも掛かった所は全部隠す（なめらかに広げた縁・2 回分の重なりをまとめて 0/255 にする）
    const full = maskCtx.getImageData(0, 0, width, height)
    for (let i = 3; i < full.data.length; i += 4) {
      full.data[i] = full.data[i] > 16 ? 255 : 0
    }
    maskCtx.putImageData(full, 0, 0)
  }

  return { mask: maskCanvas, detections: mergeDetections(found) }
}

/**
 * 長辺を size にして 1 回探し、見つかった範囲を maskCtx（元の画像の大きさ）に描き足す
 * @returns 見つかったもの（box は元の画像の座標）
 */
async function detectAtSize(
  { ort, session }: MosaicSession,
  image: HTMLImageElement | HTMLCanvasElement,
  size: number,
  options: {
    targets: Set<AutoMosaicLabel>
    minScore?: number
    tentacle?: boolean
    maskCtx: CanvasRenderingContext2D
  },
): Promise<AutoMosaicResult["detections"]> {
  const width = image.width
  const height = image.height

  // 長辺を size に縮めて（広げて）、余りは灰色で埋める（学習時と同じ）
  const ratio = size / Math.max(width, height)
  const scaledWidth = Math.round(width * ratio)
  const scaledHeight = Math.round(height * ratio)
  const padX = Math.floor((size - scaledWidth) / 2)
  const padY = Math.floor((size - scaledHeight) / 2)

  const inputCanvas = document.createElement("canvas")
  inputCanvas.width = size
  inputCanvas.height = size
  const inputCtx = inputCanvas.getContext("2d", { willReadFrequently: true })
  if (inputCtx === null) throw new Error("canvas is not supported")
  inputCtx.fillStyle = "rgb(114, 114, 114)"
  inputCtx.fillRect(0, 0, size, size)
  inputCtx.drawImage(image, padX, padY, scaledWidth, scaledHeight)
  const pixels = inputCtx.getImageData(0, 0, size, size).data
  inputCanvas.width = 0
  inputCanvas.height = 0

  const area = size * size
  const input = new Float32Array(area * 3)
  for (let i = 0; i < area; i++) {
    input[i] = pixels[i * 4] / 255
    input[i + area] = pixels[i * 4 + 1] / 255
    input[i + area * 2] = pixels[i * 4 + 2] / 255
  }

  const { predictions, protos } = await runModel(ort, session, input, size)
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
    if (!options.targets.has(label)) continue
    if (best < minScoreForLabel(label, options.minScore)) continue
    const cx = pred[a]
    const cy = pred[anchors + a]
    const w = pred[2 * anchors + a]
    const h = pred[3 * anchors + a]
    // 大きい範囲は、確からしさが高いときだけ（指定の下限を渡したときはその値だけ）
    if (
      options.minScore === undefined &&
      best < minScoreForArea((w * h) / (scaledWidth * scaledHeight))
    ) {
      continue
    }
    if (options.minScore === undefined && isLegLike(label, best, w, h)) {
      continue
    }
    if (options.tentacle && label === "penis") {
      // 余白を除いた画像の端（入力の 1% 以内）に接しているか
      const margin = size * 0.01
      const touchesEdge =
        cx - w / 2 <= padX + margin ||
        cy - h / 2 <= padY + margin ||
        cx + w / 2 >= padX + scaledWidth - margin ||
        cy + h / 2 >= padY + scaledHeight - margin
      if (isTentacleLike(best, touchesEdge)) continue
    }
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
  const detections = mergeDetections(candidates)
  if (detections.length === 0) return []

  // マスク（プロトタイプの解像度で作ってから広げる）
  const cellScale = maskWidth / size
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

  // 縁が残らないよう少し太らせる（入力 640 で約 8px。1024 でも元の画像に対して同じくらいの幅にする）
  const grown = dilate(
    binary,
    maskWidth,
    maskHeight,
    Math.max(2, Math.round((2 * size) / INPUT_SIZES[0])),
  )

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

  // 余白を除いた範囲を元の画像の大きさに引き伸ばして重ねる
  options.maskCtx.imageSmoothingEnabled = true
  options.maskCtx.drawImage(
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
  small.width = 0
  small.height = 0

  return detections.map((d) => ({
    label: d.label,
    score: d.score,
    box: [
      Math.max(0, (d.box[0] - padX) / ratio),
      Math.max(0, (d.box[1] - padY) / ratio),
      Math.min(width, (d.box[2] - padX) / ratio),
      Math.min(height, (d.box[3] - padY) / ratio),
    ],
  }))
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

/** 隠し方: モザイク・黒線（黒塗り）・白抜き（白塗り）・ぼかし */
export type MosaicStyle = "mosaic" | "black" | "white" | "blur"

export const MOSAIC_STYLES: MosaicStyle[] = ["mosaic", "black", "white", "blur"]

/** 濃さの段階（1 がいちばん弱い。弱くても規約の「拡大しても形が分からない」を満たす強さにしてある） */
export const MOSAIC_STRENGTH_MIN = 1
export const MOSAIC_STRENGTH_MAX = 5

/** モザイク: 長辺をいくつのマスに割るか（1 = 今までと同じ長辺の 1/100） */
const MOSAIC_DIVISIONS = [100, 75, 55, 40, 30]
/** ぼかし: いったん長辺を何 px まで縮めるか（小さいほど強い） */
const BLUR_LONG_SIDES = [48, 36, 28, 20, 14]

export const isMosaicStyle = (value: unknown): value is MosaicStyle =>
  typeof value === "string" && MOSAIC_STYLES.includes(value as MosaicStyle)

/** 濃さを変えられる隠し方（黒線・白抜きは塗りつぶすだけ） */
export const hasMosaicStrength = (style: MosaicStyle) =>
  style === "mosaic" || style === "blur"

const clampStrength = (strength: number) =>
  Math.min(
    MOSAIC_STRENGTH_MAX,
    Math.max(MOSAIC_STRENGTH_MIN, Math.round(strength) || 1),
  )

/** なめらかに縮める（一気に縮めると粗くなるので半分ずつ） */
function downscale(
  source: HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number,
) {
  let current: HTMLImageElement | HTMLCanvasElement = source
  let w = source.width
  let h = source.height
  while (w / 2 > width && h / 2 > height) {
    w = Math.round(w / 2)
    h = Math.round(h / 2)
    current = drawScaled(current, w, h)
  }
  return drawScaled(current, width, height)
}

function drawScaled(
  source: HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, width)
  canvas.height = Math.max(1, height)
  const ctx = canvas.getContext("2d")
  if (ctx === null) throw new Error("canvas is not supported")
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas
}

/** 画像全体をぼかしたキャンバス（ctx.filter は古い Safari で効かないので、縮めて広げる） */
function createBlurredCanvas(
  source: HTMLImageElement | HTMLCanvasElement,
  longSide: number,
) {
  const ratio = longSide / Math.max(source.width, source.height)
  const small = downscale(
    source,
    Math.max(1, Math.round(source.width * ratio)),
    Math.max(1, Math.round(source.height * ratio)),
  )
  // 一気に広げると菱形の模様が出るので 2 段で広げる
  const middle = drawScaled(small, small.width * 4, small.height * 4)
  return drawScaled(middle, source.width, source.height)
}

/**
 * 画像全体に隠し方をかけたキャンバス（マスクの所だけ切り抜いて重ねる）
 */
export function createMosaicEffectCanvas(
  source: HTMLImageElement | HTMLCanvasElement,
  style: MosaicStyle,
  strength: number,
): HTMLCanvasElement {
  const level = clampStrength(strength) - 1
  if (style === "mosaic") {
    return createPixelatedCanvas(source, MOSAIC_DIVISIONS[level])
  }
  if (style === "blur") {
    return createBlurredCanvas(source, BLUR_LONG_SIDES[level])
  }
  const canvas = document.createElement("canvas")
  canvas.width = source.width
  canvas.height = source.height
  const ctx = canvas.getContext("2d")
  if (ctx === null) throw new Error("canvas is not supported")
  ctx.fillStyle = style === "black" ? "#000" : "#fff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return canvas
}

/** 元の画像にマスクの範囲だけ隠し方をかけた画像 */
export function renderMosaicCanvas(
  source: HTMLImageElement | HTMLCanvasElement,
  mask: HTMLCanvasElement,
  style: MosaicStyle,
  strength: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = source.width
  canvas.height = source.height
  const ctx = canvas.getContext("2d")
  if (ctx === null) throw new Error("canvas is not supported")
  ctx.drawImage(source, 0, 0)
  const effect = createMosaicEffectCanvas(source, style, strength)
  ctx.drawImage(createMaskedMosaicLayer(effect, mask), 0, 0)
  effect.width = 0
  effect.height = 0
  return canvas
}

/** マスクに何か描いてあるか */
export function isMaskEmpty(mask: HTMLCanvasElement) {
  const small = downscale(
    mask,
    Math.min(mask.width, 256),
    Math.min(mask.height, 256),
  )
  const ctx = small.getContext("2d", { willReadFrequently: true })
  if (ctx === null) return true
  const data = ctx.getImageData(0, 0, small.width, small.height).data
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) return false
  }
  return true
}

/**
 * 検出した範囲がもう隠れているか（「自分でかけ済み」の確認に使う）
 *
 * 線画のような細い線（左右か上下の両隣より明るい・暗い 1 点）がどれだけ残っているかを数える。
 * モザイクはマスの中が同じ色、ぼかしはなだらか、黒塗り・白塗りは 1 色なので、細い線はほとんど無い。
 * 隠していない絵は輪郭や陰影の線が残る
 * @returns 細い線の点の割合（0〜1）。マスクが空なら 0
 */
export function measureMaskDetail(
  source: HTMLImageElement | HTMLCanvasElement,
  mask: HTMLCanvasElement,
  /** この範囲（元の画像の座標）だけ数える */
  box?: [number, number, number, number],
) {
  const input = prepareDetailInput(source, mask)
  return input === null ? 0 : measurePreparedDetail(input, box)
}

type DetailInput = {
  /** 元の画像 → 縮めた画像の倍率 */
  ratio: number
  width: number
  height: number
  sourceWidth: number
  sourceHeight: number
  luminance: Float32Array
  maskPixels: Uint8ClampedArray
}

/** 長辺 768 に縮めた明るさとマスク（検出ごとに縮め直すと重いので 1 枚に 1 回だけ作る） */
function prepareDetailInput(
  source: HTMLImageElement | HTMLCanvasElement,
  mask: HTMLCanvasElement,
): DetailInput | null {
  const ratio = Math.min(1, 768 / Math.max(source.width, source.height))
  const width = Math.max(1, Math.round(source.width * ratio))
  const height = Math.max(1, Math.round(source.height * ratio))
  const imageCtx = downscale(source, width, height).getContext("2d", {
    willReadFrequently: true,
  })
  const maskCtx = downscale(mask, width, height).getContext("2d", {
    willReadFrequently: true,
  })
  if (imageCtx === null || maskCtx === null) return null
  const pixels = imageCtx.getImageData(0, 0, width, height).data
  const maskPixels = maskCtx.getImageData(0, 0, width, height).data

  const luminance = new Float32Array(width * height)
  for (let p = 0; p < luminance.length; p++) {
    luminance[p] =
      pixels[p * 4] * 0.299 +
      pixels[p * 4 + 1] * 0.587 +
      pixels[p * 4 + 2] * 0.114
  }
  return {
    ratio,
    width,
    height,
    sourceWidth: source.width,
    sourceHeight: source.height,
    luminance,
    maskPixels,
  }
}

function measurePreparedDetail(
  {
    ratio,
    width,
    height,
    sourceWidth,
    sourceHeight,
    luminance,
    maskPixels,
  }: DetailInput,
  box?: [number, number, number, number],
) {
  const threshold = 20
  const isLine = (center: number, a: number, b: number) => {
    const da = center - a
    const db = center - b
    return (
      (da > threshold && db > threshold) || (da < -threshold && db < -threshold)
    )
  }

  const x1 = Math.max(1, Math.floor((box?.[0] ?? 0) * ratio))
  const y1 = Math.max(1, Math.floor((box?.[1] ?? 0) * ratio))
  const x2 = Math.min(width - 1, Math.ceil((box?.[2] ?? sourceWidth) * ratio))
  const y2 = Math.min(height - 1, Math.ceil((box?.[3] ?? sourceHeight) * ratio))

  // 範囲の縁（隠した所と隠していない所の境目の輪郭）は数えない。縁から r 点内側だけを見る
  const r = 3
  const isMasked = (p: number) => maskPixels[p * 4 + 3] >= 128
  const isInside = (p: number) =>
    isMasked(p) &&
    isMasked(Math.max(0, p - r)) &&
    isMasked(Math.min(luminance.length - 1, p + r)) &&
    isMasked(Math.max(0, p - r * width)) &&
    isMasked(Math.min(luminance.length - 1, p + r * width))

  let total = 0
  let lines = 0
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      const p = y * width + x
      if (!isInside(p)) continue
      total++
      const c = luminance[p]
      if (
        isLine(c, luminance[p - 1], luminance[p + 1]) ||
        isLine(c, luminance[p - width], luminance[p + width])
      ) {
        lines++
      }
    }
  }
  return total === 0 ? 0 : lines / total
}

/** これより細い線が多ければ「隠れていない」とみなす（試した画像で決めた値） */
export const UNHIDDEN_DETAIL_RATIO = 0.035

/** 輪郭がこれより多く（密度）、散らばっていれば（集中度がこれ未満）「隠れていない」とみなす（試した画像で決めた値） */
const UNHIDDEN_EDGE_DENSITY = 0.33
const UNHIDDEN_EDGE_CONCENTRATION = 0.6

/**
 * 範囲の中の輪郭の多さと散らばり方（線画の少ないリアルな絵の「自分でかけ済み」の確認に使う）
 *
 * - モザイク: 輪郭はマスの境目の決まった列・行にだけ出る（集中度が高い）
 * - 黒塗り・白塗り・ぼかし: 輪郭がほとんど無い（密度が低い）
 * - 隠していない絵: 肌の質感や陰影の輪郭が多く、いろいろな列・行に散らばる
 * @param luminance 明るさ（width×height）
 * @param box 調べる範囲（luminance の座標）。縁の影響を避けて真ん中の 7 割だけ見る
 * @returns density = 隣と明るさが 4 より違う所の割合、concentration = 輪郭の多い 1/4 の列（行）に集まっている割合。狭すぎれば null
 */
export function measureEdgeSpread(
  luminance: ArrayLike<number>,
  width: number,
  height: number,
  box: [number, number, number, number],
) {
  const cx = (box[0] + box[2]) / 2
  const cy = (box[1] + box[3]) / 2
  const halfWidth = (box[2] - box[0]) * 0.35
  const halfHeight = (box[3] - box[1]) * 0.35
  const x1 = Math.max(0, Math.floor(cx - halfWidth))
  const y1 = Math.max(0, Math.floor(cy - halfHeight))
  const x2 = Math.min(width, Math.floor(cx + halfWidth))
  const y2 = Math.min(height, Math.floor(cy + halfHeight))
  if (x2 - x1 < 6 || y2 - y1 < 6) return null

  const threshold = 4
  const columns = new Float64Array(x2 - x1 - 1)
  const rows = new Float64Array(y2 - y1 - 1)
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      const p = y * width + x
      if (x + 1 < x2 && Math.abs(luminance[p + 1] - luminance[p]) > threshold) {
        columns[x - x1]++
      }
      if (
        y + 1 < y2 &&
        Math.abs(luminance[p + width] - luminance[p]) > threshold
      ) {
        rows[y - y1]++
      }
    }
  }

  const sum = (values: Float64Array) => values.reduce((a, b) => a + b, 0)
  const concentration = (values: Float64Array) => {
    const total = sum(values)
    if (total === 0) return 1
    const top = [...values].sort((a, b) => b - a)
    const count = Math.max(1, Math.ceil(values.length / 4))
    return top.slice(0, count).reduce((a, b) => a + b, 0) / total
  }
  const pairs = columns.length * (y2 - y1) + rows.length * (x2 - x1)
  return {
    density: (sum(columns) + sum(rows)) / pairs,
    concentration: (concentration(columns) + concentration(rows)) / 2,
  }
}

/** 輪郭の多さと散らばり方から見て隠れていないか */
export function isEdgeSpreadUnhidden(
  spread: ReturnType<typeof measureEdgeSpread>,
) {
  return (
    spread !== null &&
    spread.density >= UNHIDDEN_EDGE_DENSITY &&
    spread.concentration < UNHIDDEN_EDGE_CONCENTRATION
  )
}

/**
 * 検出した範囲が隠れていないように見えるかを調べる関数を作る（「自分でかけ済み」の確認に使う）
 * 線画の細い線（measureMaskDetail）に加えて、リアルな絵向けに輪郭の散らばり方も見る。
 * 縮めた画像は 1 枚に 1 回だけ作り、検出ごとに使い回す
 */
export function createUnhiddenChecker(
  source: HTMLImageElement | HTMLCanvasElement,
  mask: HTMLCanvasElement,
) {
  const input = prepareDetailInput(source, mask)
  return (box: [number, number, number, number]) => {
    if (input === null) return false
    if (measurePreparedDetail(input, box) > UNHIDDEN_DETAIL_RATIO) return true
    const { ratio, width, height, luminance } = input
    return isEdgeSpreadUnhidden(
      measureEdgeSpread(luminance, width, height, [
        box[0] * ratio,
        box[1] * ratio,
        box[2] * ratio,
        box[3] * ratio,
      ]),
    )
  }
}

/** 検出した範囲が隠れていないように見えるか（1 か所だけ調べるとき） */
export function isRegionUnhidden(
  source: HTMLImageElement | HTMLCanvasElement,
  mask: HTMLCanvasElement,
  box: [number, number, number, number],
) {
  return createUnhiddenChecker(source, mask)(box)
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
