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
 * - raw: 変換せずにそのまま送る（納品の GIF・APNG・WebP のアニメーション・動画）
 * - too-large: そのまま送るには大きすぎる
 * - unsupported: 送れない形式
 * allowMotion は納品の欄だけ true（メッセージや参考画像はこれまでどおり静止画）
 */
export const toRequestUploadPlan = (
  file: {
    type: string
    size: number
    name?: string
    /** PNG・WebP のうちアニメーションのもの（isAnimatedImageFile で先に調べる） */
    isAnimated?: boolean
  },
  allowMotion: boolean,
): "convert" | "raw" | "too-large" | "unsupported" => {
  const isGif =
    file.type === "image/gif" ||
    (file.isAnimated === true &&
      (file.type === "image/png" ||
        file.type === "image/apng" ||
        file.type === "image/webp"))
  const isVideo =
    REQUEST_VIDEO_TYPES.includes(file.type) ||
    // 端末によっては動画の type が空になるので、拡張子でも見分ける
    (file.type === "" && /\.(mp4|m4v|webm|mov)$/i.test(file.name ?? ""))
  if (allowMotion && (isGif || isVideo)) {
    return file.size > MAX_UPLOAD_FILE_BYTES ? "too-large" : "raw"
  }
  // SVG は画像の置き場から開くとスクリプトが動くので、静止画に変換して送る
  if (file.type.startsWith("image/")) return "convert"
  return "unsupported"
}

/**
 * そのまま送るファイルの Content-Type。type が空の動画は拡張子から決める
 * （空のままだと置き場で動画として配信されず、再生できない）
 */
export const toRequestRawUploadType = (file: {
  type: string
  name?: string
}): string => {
  if (file.type !== "") return file.type
  const ext = /\.([a-z0-9]+)$/i.exec(file.name ?? "")?.[1]?.toLowerCase()
  if (ext === "webm") return "video/webm"
  if (ext === "mov") return "video/quicktime"
  if (ext === "mp4" || ext === "m4v") return "video/mp4"
  return "application/octet-stream"
}
