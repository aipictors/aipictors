import { useCallback, useEffect, useState } from "react"
import type {
  ModelLibraryFilters,
  ModelLibraryItem,
  ModelLibraryRecentEntry,
  ModelLibraryViewMode,
  OfficialCheckpoint,
  OfficialLora,
} from "~/components/model-library/model-library-types"
import { baseModelLabel } from "~/lib/user-models/constants"
import type { UserModel, UserModelBaseModel } from "~/lib/user-models/types"

/**
 * 公式モデルの種類と名前からベースモデルを推定する
 */
export const officialBaseModel = (
  model: Pick<OfficialCheckpoint, "type" | "name">,
): UserModelBaseModel | null => {
  if (model.type === "SD1") return "SD1.5"
  if (model.type !== "SDXL") return null
  const name = model.name.toLowerCase()
  if (name.includes("pony")) return "PONY"
  if (name.includes("illustrious")) return "ILLUSTRIOUS"
  if (name.includes("noob")) return "NOOBAI"
  return "SDXL"
}

export const officialCheckpointKey = (id: string) => `official-checkpoint:${id}`

export const officialLoraKey = (name: string) => `official-lora:${name}`

export const userModelKey = (id: string) => `user:${id}`

export const fromOfficialCheckpoint = (
  model: OfficialCheckpoint,
  favoriteIds: number[],
): ModelLibraryItem => {
  const baseModel = officialBaseModel(model)
  return {
    key: officialCheckpointKey(model.id),
    source: "official",
    kind: "CHECKPOINT",
    name: model.displayName || model.name,
    thumbnailUrl: model.thumbnailImageURL || null,
    baseLabel: baseModel ? baseModelLabel(baseModel) : model.type || null,
    baseModel,
    sizeBytes: null,
    useCount: null,
    updatedAt: null,
    isNew: Boolean(model.isNew),
    isOwn: false,
    isFavorite: favoriteIds.includes(Number(model.id)),
    userModel: null,
    officialCheckpoint: model,
    officialLora: null,
  }
}

export const fromOfficialLora = (model: OfficialLora): ModelLibraryItem => {
  return {
    key: officialLoraKey(model.name),
    source: "official",
    kind: "LORA",
    name: model.name,
    thumbnailUrl: model.thumbnailImageURL || null,
    baseLabel: null,
    baseModel: null,
    sizeBytes: null,
    useCount: null,
    updatedAt: null,
    isNew: false,
    isOwn: false,
    isFavorite: false,
    userModel: null,
    officialCheckpoint: null,
    officialLora: model,
  }
}

export const fromUserModel = (
  model: UserModel,
  viewerUserId: string | null,
): ModelLibraryItem => {
  return {
    key: userModelKey(model.id),
    source: "user",
    kind: model.kind,
    name: model.name,
    thumbnailUrl: model.thumbnailUrl,
    baseLabel: baseModelLabel(model.baseModel),
    baseModel: model.baseModel,
    sizeBytes: model.sizeBytes,
    useCount: model.useCount,
    updatedAt: model.updatedAt || model.createdAt || null,
    isNew: false,
    isOwn: viewerUserId !== null && model.userId === viewerUserId,
    isFavorite: false,
    userModel: model,
    officialCheckpoint: null,
    officialLora: null,
  }
}

/**
 * 手元にある一覧（公式・自分のモデルなど）を検索・絞り込み・並び替えする
 */
export const filterLibraryItems = (
  items: ModelLibraryItem[],
  filters: ModelLibraryFilters,
  options: { keepOrder?: boolean } = {},
): ModelLibraryItem[] => {
  const q = filters.q.trim().toLowerCase()
  const filtered = items.filter((item) => {
    if (filters.kind && item.kind !== filters.kind) return false
    if (filters.baseModel && item.baseModel !== filters.baseModel) return false
    if (q === "") return true
    const haystack = [
      item.name,
      item.officialCheckpoint?.name,
      item.officialLora?.description,
      item.userModel?.tags.join(" "),
      item.userModel?.triggerWords,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return haystack.includes(q)
  })
  if (options.keepOrder) return filtered
  if (filters.sort === "name") {
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "ja"))
  }
  if (filters.sort === "new") {
    return [...filtered].sort((a, b) => {
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1
      return (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
    })
  }
  return [...filtered].sort((a, b) => (b.useCount ?? 0) - (a.useCount ?? 0))
}

const VIEW_MODE_KEY = "aipictors.model-library.view"
const RECENT_KEY = "aipictors.model-library.recent"
const RECENT_MAX = 30

/**
 * グリッド / リスト表示（ローカルストレージに保存）
 */
export function useModelLibraryViewMode(): [
  ModelLibraryViewMode,
  (mode: ModelLibraryViewMode) => void,
] {
  const [mode, setMode] = useState<ModelLibraryViewMode>("grid")

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_KEY)
      if (saved === "grid" || saved === "list") setMode(saved)
    } catch {
      // 読めなければ既定のまま
    }
  }, [])

  const update = useCallback((next: ModelLibraryViewMode) => {
    setMode(next)
    try {
      localStorage.setItem(VIEW_MODE_KEY, next)
    } catch {
      // 保存できなくても表示は切り替わる
    }
  }, [])

  return [mode, update]
}

export const readRecentEntries = (): ModelLibraryRecentEntry[] => {
  try {
    const text = localStorage.getItem(RECENT_KEY)
    const parsed = text ? (JSON.parse(text) as unknown) : []
    return Array.isArray(parsed) ? (parsed as ModelLibraryRecentEntry[]) : []
  } catch {
    return []
  }
}

/**
 * 「最近使った」に追加する
 */
export const pushRecentEntry = (item: ModelLibraryItem) => {
  const entry: ModelLibraryRecentEntry = { ...item, usedAt: Date.now() }
  const next = [
    entry,
    ...readRecentEntries().filter((recent) => recent.key !== item.key),
  ].slice(0, RECENT_MAX)
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // 保存できなくても生成には影響しない
  }
}

export const formatLibraryDate = (unixSeconds: number | null): string => {
  if (!unixSeconds) return "—"
  const date = new Date(
    unixSeconds > 10_000_000_000 ? unixSeconds : unixSeconds * 1000,
  )
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
}
