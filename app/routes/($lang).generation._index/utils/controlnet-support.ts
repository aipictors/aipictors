import { findDitModelLabel } from "~/routes/($lang).generation._index/utils/dit-models"

/**
 * そのモデルで ControlNet を使えるか
 *
 * 生成サーバーに置いてある ControlNet は SD1.5 と SDXL 用だけなので、
 * SD2 のモデル（SD2Scream・hakoMayD・hakoMayBoy）に付けると
 * KSampler の形が合わずにエラーになる。Z-Image などの DiT 系も対応していない。
 */
export const isControlNetSupportedModel = (props: {
  modelType: string | null | undefined
  modelName?: string | null
}): boolean => {
  if (props.modelType === "SD2") return false
  if (findDitModelLabel(props.modelName) !== null) return false
  return true
}

/**
 * ControlNet を使えないモデルのとき、画面に出す理由（使えるときは null）
 */
export const findControlNetUnsupportedLabel = (props: {
  modelType: string | null | undefined
  modelName?: string | null
}): string | null => {
  const ditLabel = findDitModelLabel(props.modelName)
  if (ditLabel !== null) return ditLabel
  if (props.modelType === "SD2") return "SD2"
  return null
}
