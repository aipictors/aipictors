import type {
  UserModelBaseModel,
  UserModelKind,
  UserModelRating,
  UserModelReportReason,
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
  // チェックポイントだけ（LoRA は生成で使えない）
  { value: "MOSS", label: "MOSS Image" },
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
    description:
      "絵柄のベースになるモデル本体（最大 7.5GB、サブスクなら 10GB）",
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
 * 種類ごとのサイズ上限（バイト。無料プラン）
 */
export const USER_MODEL_MAX_BYTES: Record<UserModelKind, number> = {
  LORA: 400 * 1024 * 1024,
  CHECKPOINT: 7.5 * 1024 * 1024 * 1024,
}

/**
 * サブスク（LITE / STANDARD / PREMIUM）の人のチェックポイントの上限（バイト）。
 * MOSS Image の派生の bf16 は 9.5GB 前後ある（API の defaultSubscriberCheckpointMaxBytes と同じ）
 */
export const USER_MODEL_SUBSCRIBER_CHECKPOINT_MAX_BYTES =
  10 * 1024 * 1024 * 1024

/**
 * プランごとの 1 ファイルの上限（バイト）。プランが分からないときは無料プランの上限
 */
export const userModelMaxBytes = (
  kind: UserModelKind,
  planType?: string | null,
): number =>
  kind === "CHECKPOINT" && planType && planType !== "FREE"
    ? USER_MODEL_SUBSCRIBER_CHECKPOINT_MAX_BYTES
    : USER_MODEL_MAX_BYTES[kind]

/**
 * ベースモデルの候補（MOSS Image はチェックポイントだけ）
 */
export const userModelBaseModelsFor = (kind: UserModelKind) =>
  USER_MODEL_BASE_MODELS.filter(
    (item) => kind === "CHECKPOINT" || item.value !== "MOSS",
  )

/**
 * 1 パートのサイズ（API が partSize を返したらそちらを優先）
 */
export const USER_MODEL_PART_SIZE = 50 * 1024 * 1024

/**
 * プランごとの登録上限（表示用の既定値。実際の上限は API が返す limitBytes）
 * 1 か月（JST）に登録できるファイルの合計サイズ（GB）。個数は無制限。
 * 枠は毎月 1 日に戻る（登録したモデルは削除できない）
 */
export const USER_MODEL_PLAN_LIMITS = {
  FREE: 10,
  LITE: 30,
  STANDARD: 60,
  PREMIUM: 150,
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

export const USER_MODEL_REPORT_REASONS: {
  value: UserModelReportReason
  label: string
}[] = [
  { value: "COPYRIGHT", label: "権利侵害・無断転載" },
  { value: "REAL_PERSON", label: "実在の人物を再現している" },
  { value: "ILLEGAL", label: "違法・有害な内容" },
  { value: "WRONG_RATING", label: "年齢区分が正しくない" },
  { value: "BROKEN", label: "壊れている・生成に使えない" },
  { value: "SPAM", label: "スパム・宣伝" },
  { value: "OTHER", label: "その他" },
]

export const reportReasonLabel = (value: string): string => {
  return (
    USER_MODEL_REPORT_REASONS.find((item) => item.value === value)?.label ??
    value
  )
}
