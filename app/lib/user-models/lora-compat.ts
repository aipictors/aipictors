import type { UserModelBaseModel } from "~/lib/user-models/types"

/**
 * LoRA が効くモデルの系統。SD1.5 の LoRA は SD1.5 のモデルだけ、SDXL の LoRA は SDXL 系
 * （SDXL・Illustrious・NoobAI・Pony）のモデルだけで効く。合わない組み合わせは生成サーバーが黙って無視する
 */
export type LoraFamily = "SD1" | "SDXL"

/**
 * モデル側の系統。NONE は LoRA を使えないモデル（Gemini・FLUX・Z-Image などの DiT）
 */
export type CheckpointLoraFamily = LoraFamily | "NONE"

/**
 * 公式 LoRA のうち SDXL 用のもの。
 * 生成サーバーの LoRA ファイル（safetensors のヘッダーのキー名）で確かめた。
 * 公式 LoRA は SD1.5 のものが大半で、DB の sd 列は当てにならない（SDXL のものが SD1 になっている）。
 * SDXL の公式 LoRA を足したらここにも足す
 */
const OFFICIAL_SDXL_LORAS = new Set(["pictorchan_ilxl20", "deltamon_beta"])

const SDXL_NAME_PATTERN = /(^|[_\-\s])(sdxl|xl|ilxl|illustrious|noobai?|pony)/i

export const officialLoraFamily = (name: string): LoraFamily => {
  const normalized = name.replace(/\.safetensors$/i, "")
  if (OFFICIAL_SDXL_LORAS.has(normalized)) return "SDXL"
  if (SDXL_NAME_PATTERN.test(normalized)) return "SDXL"
  return "SD1"
}

/**
 * みんなのモデル（LoRA・チェックポイント）の系統。その他は分からないので null（警告しない）
 */
export const userModelLoraFamily = (
  baseModel: UserModelBaseModel | null | undefined,
): LoraFamily | null => {
  if (!baseModel || baseModel === "OTHER" || baseModel === "MOSS") return null
  if (baseModel === "SD1.5") return "SD1"
  return "SDXL"
}

/**
 * みんなのモデルのチェックポイントの系統。MOSS Image（DiT）は LoRA を使えない
 */
export const userCheckpointLoraFamily = (
  baseModel: UserModelBaseModel | null | undefined,
): CheckpointLoraFamily | null => {
  if (baseModel === "MOSS") return "NONE"
  return userModelLoraFamily(baseModel)
}

/**
 * 公式モデルの系統（type は ImageModelNode.type）
 */
export const officialCheckpointLoraFamily = (props: {
  type: string | null | undefined
  isDit: boolean
}): CheckpointLoraFamily | null => {
  if (props.isDit) return "NONE"
  if (props.type === "SD1") return "SD1"
  if (props.type === "SDXL") return "SDXL"
  if (
    props.type === "GEMINI" ||
    props.type === "FLUX" ||
    props.type === "SD5"
  ) {
    return "NONE"
  }
  return null
}

/**
 * 効くかどうか。どちらかが分からないときは null（警告しない）
 */
export const isLoraUsableWith = (
  lora: LoraFamily | null,
  checkpoint: CheckpointLoraFamily | null,
): boolean | null => {
  if (lora === null || checkpoint === null) return null
  return lora === checkpoint
}

export const loraFamilyLabel = (family: CheckpointLoraFamily): string => {
  if (family === "SD1") return "SD1.5"
  if (family === "SDXL") return "SDXL系"
  return "LoRA非対応"
}
