import type {
  UserModelBaseModel,
  UserModelKind,
  UserModelRating,
} from "~/lib/user-models/types"

export const USER_MODEL_BASE_MODELS: {
  value: UserModelBaseModel
  label: string
}[] = [
  { value: "SDXL", label: "SDXL" },
  { value: "ILLUSTRIOUS", label: "Illustrious" },
  { value: "NOOBAI", label: "NoobAI" },
  { value: "PONY", label: "Pony" },
  { value: "SD1.5", label: "SD 1.5" },
  { value: "OTHER", label: "その他" },
]

export const USER_MODEL_KINDS: {
  value: UserModelKind
  label: string
  description: string
}[] = [
  {
    value: "LORA",
    label: "LoRA",
    description: "画風やキャラクターを追加する小さなモデル（最大 400MB）",
  },
  {
    value: "CHECKPOINT",
    label: "Checkpoint",
    description: "絵柄のベースになるモデル本体（最大 7.5GB）",
  },
]

export const USER_MODEL_RATINGS: {
  value: UserModelRating
  label: string
}[] = [
  { value: "G", label: "全年齢" },
  { value: "R15", label: "R-15" },
  { value: "R18", label: "R-18" },
  { value: "R18G", label: "R-18G" },
]

/**
 * 種類ごとのサイズ上限（バイト）
 */
export const USER_MODEL_MAX_BYTES: Record<UserModelKind, number> = {
  LORA: 400 * 1024 * 1024,
  CHECKPOINT: 7.5 * 1024 * 1024 * 1024,
}

/**
 * 1 パートのサイズ（API が partSize を返したらそちらを優先）
 */
export const USER_MODEL_PART_SIZE = 50 * 1024 * 1024

/**
 * プランごとの登録上限（表示用の既定値。実際の上限は API が返す limit）
 */
export const USER_MODEL_PLAN_LIMITS = {
  FREE: 1,
  LITE: 3,
  STANDARD: 10,
  PREMIUM: 30,
} as const

export const baseModelLabel = (value: string): string => {
  return (
    USER_MODEL_BASE_MODELS.find((item) => item.value === value)?.label ?? value
  )
}

export const kindLabel = (value: string): string => {
  return USER_MODEL_KINDS.find((item) => item.value === value)?.label ?? value
}

export const ratingLabel = (value: string): string => {
  return USER_MODEL_RATINGS.find((item) => item.value === value)?.label ?? value
}
