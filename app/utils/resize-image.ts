type ResizeInfo = {
  base64: string
  width: number
  height: number
}

/** 同じ画像をもう一度デコードしないよう、読み終わった画像を少しの間だけ覚えておく時間 */
const DECODED_IMAGE_KEEP_MS = 5_000

let decodedImage: {
  src: string
  image: Promise<HTMLImageElement>
  timer: ReturnType<typeof setTimeout> | null
} | null = null

/**
 * 画像を読む。投稿では同じ元画像から小・大サムネイルと AI 評価用を続けて作るので、
 * 前は 1 回の投稿で元の解像度の画像を 5 回デコードしていた。直近の 1 枚だけ使い回す
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  if (decodedImage?.src === src) {
    if (decodedImage.timer !== null) clearTimeout(decodedImage.timer)
  } else {
    if (decodedImage?.timer) clearTimeout(decodedImage.timer)
    const image = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
    decodedImage = { src, image, timer: null }
    image.catch(() => {
      if (decodedImage?.image === image) decodedImage = null
    })
  }
  const current = decodedImage
  current.timer = setTimeout(() => {
    if (decodedImage === current) decodedImage = null
  }, DECODED_IMAGE_KEEP_MS)
  return current.image
}

/**
 * 画像のリサイズ
 * @param imageBase64 base64形式の画像
 * @param width 固定する幅（オプション）
 * @param height 固定する高さ（オプション）
 * @param ext 拡張子（オプション）
 * @returns リサイズされた画像のbase64形式
 */
export const resizeImage = async (
  imageBase64: string,
  width?: number,
  height?: number,
  ext?: string,
): Promise<ResizeInfo> => {
  const img = await loadImage(imageBase64)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (width) {
    canvas.width = width
    canvas.height = (img.height / img.width) * width
  } else if (height) {
    canvas.height = height
    canvas.width = (img.width / img.height) * height
  } else {
    throw new Error("Width or height must be specified")
  }

  if (!ctx) {
    throw new Error("Failed to get canvas context")
  }
  drawSmooth(ctx, img, canvas.width, canvas.height)
  return {
    base64: canvas.toDataURL(`image/${ext || "png"}`),
    width: canvas.width,
    height: canvas.height,
  }
}

/**
 * 一度に大きく縮めるとギザギザ・ボソボソになるので、半分ずつ縮めてから描く
 */
function drawSmooth(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
) {
  let source: CanvasImageSource = img
  let sourceWidth = img.width
  let sourceHeight = img.height
  while (sourceWidth / 2 >= width && sourceHeight / 2 >= height) {
    const step = document.createElement("canvas")
    step.width = Math.round(sourceWidth / 2)
    step.height = Math.round(sourceHeight / 2)
    const stepCtx = step.getContext("2d")
    if (!stepCtx) break
    stepCtx.imageSmoothingEnabled = true
    stepCtx.imageSmoothingQuality = "high"
    stepCtx.drawImage(source, 0, 0, step.width, step.height)
    source = step
    sourceWidth = step.width
    sourceHeight = step.height
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(source, 0, 0, width, height)
}

/**
 * 一覧用サムネイル。一覧では正方形などに切り抜いて表示するので、長い辺ではなく短い辺を shortSide にそろえる
 * （横長・縦長の画像で長い辺を固定すると、短い辺が小さくなり、切り抜いたときに拡大されてぼやける）。
 * 長い辺は maxLongSide まで。元の画像より大きくはしない
 */
export const resizeThumbnail = async (
  imageBase64: string,
  shortSide: number,
  maxLongSide: number,
  ext?: string,
): Promise<ResizeInfo> => {
  const img = await loadImage(imageBase64)
  const isLandscape = img.width >= img.height
  const long = isLandscape ? img.width : img.height
  const short = isLandscape ? img.height : img.width
  const scale = Math.min(1, shortSide / short, maxLongSide / long)
  const width = Math.max(1, Math.round(img.width * scale))
  return resizeImage(imageBase64, width, undefined, ext)
}
