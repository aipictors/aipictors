import { MAX_UPLOAD_FILE_BYTES } from "~/utils/upload-public-image"

/** 納品で形式を保ったまま送れる動画の形式 */
export const REQUEST_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
]

/**
 * リクエストの画像欄に選ばれたファイルをどう送るか。
 * - convert: 静止画として webp に縮めて送る
 * - raw: 変換せずにそのまま送る（納品の GIF アニメ・動画）
 * - too-large: そのまま送るには大きすぎる
 * - unsupported: 送れない形式
 * allowMotion は納品の欄だけ true（メッセージや参考画像はこれまでどおり静止画）
 */
export const toRequestUploadPlan = (
  file: { type: string; size: number },
  allowMotion: boolean,
): "convert" | "raw" | "too-large" | "unsupported" => {
  const isGif = file.type === "image/gif"
  const isVideo = REQUEST_VIDEO_TYPES.includes(file.type)
  if (allowMotion && (isGif || isVideo)) {
    return file.size > MAX_UPLOAD_FILE_BYTES ? "too-large" : "raw"
  }
  // SVG は画像の置き場から開くとスクリプトが動くので、静止画に変換して送る
  if (file.type.startsWith("image/")) return "convert"
  return "unsupported"
}
