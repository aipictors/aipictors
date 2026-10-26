import type { UserModel, UserModelBaseModel } from "~/lib/user-models/types"

/**
 * 生成リクエストの model に入れるチェックポイント名
 */
export const toUserCheckpointModelName = (id: string): string => {
  return `user/${id}.safetensors`
}

/**
 * プロンプトの <lora:NAME:weight> に入れる LoRA 名
 */
export const toUserLoraName = (id: string): string => {
  return `user_${id}`
}

/**
 * LoRA 名がユーザーモデルなら ID を返す
 */
export const parseUserLoraName = (name: string): string | null => {
  const match = name.match(/^user_([A-Za-z0-9_-]+)$/)
  return match ? match[1] : null
}

/**
 * 生成画面のモデル種別（サイズ・VAE の既定値に使う）
 */
export const toGenerationModelType = (
  baseModel: UserModelBaseModel,
): string => {
  if (baseModel === "SD1.5") {
    return "SD1"
  }
  return "SDXL"
}

/**
 * 推奨ウェイトを LoRA の範囲（生成画面のスライダーと同じ -1〜1）に丸める
 */
export const normalizeLoraWeight = (
  weight: number | null | undefined,
): number => {
  if (typeof weight !== "number" || !Number.isFinite(weight)) {
    return 0.8
  }
  return Math.round(Math.min(Math.max(weight, -1), 1) * 100) / 100
}

/**
 * 生成画面で選択中のユーザーチェックポイント（ローカルストレージに保存）
 */
export type SelectedUserCheckpoint = {
  id: string
  name: string
  baseModel: UserModelBaseModel
  thumbnailUrl: string | null
  /**
   * 選択前の公式モデル（解除時に戻す）
   */
  officialModelId: string
}

export const toSelectedUserCheckpoint = (
  model: Pick<UserModel, "id" | "name" | "baseModel" | "thumbnailUrl">,
  officialModelId: string,
): SelectedUserCheckpoint => {
  return {
    id: model.id,
    name: model.name,
    baseModel: model.baseModel,
    thumbnailUrl: model.thumbnailUrl,
    officialModelId,
  }
}

/**
 * トリガーワード（カンマ区切り）を配列にする
 */
export const splitTriggerWords = (
  text: string | null | undefined,
): string[] => {
  if (!text) return []
  return text
    .split(/[,、\n]/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0)
}

export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  )
  const value = bytes / 1024 ** index
  return `${value >= 100 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`
}

export const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "--"
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}秒`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分${Math.round(seconds % 60)}秒`
  return `${Math.floor(minutes / 60)}時間${minutes % 60}分`
}

export const formatCount = (count: number): string => {
  if (!Number.isFinite(count)) return "0"
  if (count >= 10000)
    return `${(count / 10000).toFixed(count >= 100000 ? 0 : 1)}万`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}
