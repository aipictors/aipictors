import type {
  UserModel,
  UserModelBaseModel,
  UserModelKind,
} from "~/lib/user-models/types"

export type ModelLibrarySection =
  | "official"
  | "community"
  | "mine"
  | "favorites"
  | "recent"

export type ModelLibrarySort = "popular" | "new" | "name"

export type ModelLibraryViewMode = "grid" | "list"

export type ModelLibraryFilters = {
  q: string
  kind: UserModelKind | null
  baseModel: UserModelBaseModel | null
  sort: ModelLibrarySort
  /**
   * みんなのモデルで R-18 も表示する
   */
  includeR18: boolean
}

export const defaultModelLibraryFilters: ModelLibraryFilters = {
  q: "",
  kind: null,
  baseModel: null,
  sort: "popular",
  includeR18: false,
}

/**
 * 公式のチェックポイント（生成画面の ImageModelContextFragment と同じ形）
 */
export type OfficialCheckpoint = {
  id: string
  name: string
  displayName: string | null
  type: string
  thumbnailImageURL: string | null
  prompts: string[]
  isNew?: boolean | null
  description?: string | null
}

/**
 * 公式の LoRA（生成画面の ImageLoraModelContextFragment と同じ形）
 */
export type OfficialLora = {
  id: string
  name: string
  description: string | null
  thumbnailImageURL: string | null
  genre?: string | null
  triggerWord?: unknown
}

/**
 * ライブラリに並べる 1 件（公式・みんなのモデルを同じ形にそろえる）
 */
export type ModelLibraryItem = {
  /**
   * official-checkpoint:<id> / official-lora:<name> / user:<id>
   */
  key: string
  source: "official" | "user"
  kind: UserModelKind
  name: string
  thumbnailUrl: string | null
  /**
   * 表示用のベースモデル名（SDXL など）。公式 LoRA など不明なら null
   */
  baseLabel: string | null
  baseModel: UserModelBaseModel | null
  sizeBytes: number | null
  useCount: number | null
  /**
   * unix 秒
   */
  updatedAt: number | null
  isNew: boolean
  isOwn: boolean
  isFavorite: boolean
  userModel: UserModel | null
  officialCheckpoint: OfficialCheckpoint | null
  officialLora: OfficialLora | null
}

/**
 * 最近使ったモデル（一覧を読み込まなくても出せるよう、そのまま保存する）
 */
export type ModelLibraryRecentEntry = ModelLibraryItem & {
  usedAt: number
}
