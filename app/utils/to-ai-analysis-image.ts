/**
 * 投稿画面の「AI でタイトル・タグを作る」に渡す画像を作る。
 *
 * 前はタイトル用・タグ用それぞれで、元の解像度のまま Image → canvas.toDataURL（画面が止まる）で
 * JPEG にし、数十 MB の文字列の SHA-256 を毎回計算してからアップロードしていた。
 * AI が見るのは長辺 1,536px 程度で足りるので縮小してから書き出し、
 * 同じ画像はタイトル用・タグ用で 1 回だけ変換・アップロードする。
 */

/** AI に渡す画像の長辺（px） */
export const AI_ANALYSIS_IMAGE_MAX_SIDE = 1536

/** 縮小後の大きさ（元が小さいときはそのまま） */
export const toAiAnalysisImageSize = (width: number, height: number) => {
  const longSide = Math.max(width, height)
  if (longSide <= AI_ANALYSIS_IMAGE_MAX_SIDE || longSide <= 0) {
    return { width, height }
  }
  const scale = AI_ANALYSIS_IMAGE_MAX_SIDE / longSide
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

const decode = async (src: string) => {
  const img = new Image()
  img.src = src
  await img.decode()
  return img
}

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode"))),
      "image/jpeg",
      0.85,
    )
  })

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Failed to read image"))
    reader.onerror = () => reject(new Error("Failed to read image"))
    reader.readAsDataURL(blob)
  })

/** 画像（data URL / URL）を、AI に渡す縮小 JPEG の data URL にする */
export const toAiAnalysisJpegDataUrl = async (src: string) => {
  const img = await decode(src)
  const size = toAiAnalysisImageSize(img.naturalWidth, img.naturalHeight)
  const canvas = document.createElement("canvas")
  canvas.width = size.width
  canvas.height = size.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas context not available")
  ctx.drawImage(img, 0, 0, size.width, size.height)
  const blob = await canvasToBlob(canvas)
  canvas.width = 0
  canvas.height = 0
  return blobToDataUrl(blob)
}

/** 元の画像 → アップロードした URL。直近の数枚だけ覚える（元の文字列が大きいので増やさない） */
const uploadedUrlCache = new Map<string, Promise<string>>()
const MAX_CACHE = 4

/**
 * 画像を縮小 JPEG にしてアップロードし URL を返す。同じ画像は 1 回だけ。
 * 失敗したときは覚えない（次に押したときにやり直す）
 */
export const getAiAnalysisImageUrl = (
  src: string,
  upload: (jpegDataUrl: string) => Promise<string>,
): Promise<string> => {
  const cached = uploadedUrlCache.get(src)
  if (cached) return cached
  const promise = toAiAnalysisJpegDataUrl(src).then(upload)
  uploadedUrlCache.set(src, promise)
  promise.catch(() => {
    if (uploadedUrlCache.get(src) === promise) uploadedUrlCache.delete(src)
  })
  while (uploadedUrlCache.size > MAX_CACHE) {
    const oldest = uploadedUrlCache.keys().next().value
    if (oldest === undefined) break
    uploadedUrlCache.delete(oldest)
  }
  return promise
}
