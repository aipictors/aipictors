import type {
  UserModelBaseModel,
  UserModelImportState,
  UserModelKind,
} from "~/lib/user-models/types"

const CIVITAI_HOSTS = new Set([
  "civitai.com",
  "www.civitai.com",
  "civitai.green",
  "www.civitai.green",
])

/**
 * 取り込める URL か（Civitai のモデルページ / ダウンロード URL）。最終的な判定は API 側で行う
 */
export const isImportableModelUrl = (text: string): boolean => {
  const raw = text.trim()
  if (!raw) return false
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    if (!CIVITAI_HOSTS.has(url.hostname.toLowerCase())) return false
    return (
      /^\/models\/\d+(\/[^/]*)?\/?$/.test(url.pathname) ||
      /^\/api\/download\/models\/\d+\/?$/.test(url.pathname)
    )
  } catch {
    return false
  }
}

/**
 * ドロップされたデータから URL を取り出す（ブラウザのアドレスバーやリンクのドラッグ）
 */
export const extractDroppedUrl = (data: {
  types: readonly string[]
  getData(type: string): string
}): string | null => {
  const candidates: string[] = []
  if (data.types.includes("text/uri-list")) {
    candidates.push(
      ...data
        .getData("text/uri-list")
        .split(/\r?\n/)
        .filter((line) => line && !line.startsWith("#")),
    )
  }
  if (data.types.includes("text/plain")) {
    candidates.push(data.getData("text/plain"))
  }
  const found = candidates.map((value) => value.trim()).find(Boolean)
  return found ?? null
}

/**
 * 他サービスでの利用が許可されていないときの注意書き
 */
export const licenseNoteText = (
  allowsOtherServices: boolean | null | undefined,
): string | null => {
  return allowsOtherServices === false
    ? "作者のライセンスでは他サービスでの利用が許可されていません"
    : null
}

/**
 * 今の生成サーバーで使えない可能性がある系統の注意書き
 */
export const unsupportedBaseNoteText = (
  baseModel: UserModelBaseModel,
  sourceBaseModel: string | null | undefined,
): string | null => {
  if (baseModel !== "OTHER" || !sourceBaseModel) return null
  return `この系統（${sourceBaseModel}）は今の生成サーバーでは生成できない場合があります`
}

/**
 * 取り込みの進み具合（0〜100）。転送前は 0、完了は 100
 */
export const importPercent = (props: {
  status: UserModelImportState
  partsDone: number
  partsTotal: number | null
}): number => {
  if (props.status === "READY") return 100
  if (!props.partsTotal || props.partsTotal <= 0) return 0
  return Math.min(100, (props.partsDone / props.partsTotal) * 100)
}

/**
 * 次に状態を確認するまでの時間（ミリ秒）。転送前はゆっくり、長く続くほど間隔を広げる
 */
export const importPollDelayMs = (props: {
  status: UserModelImportState
  attempt: number
}): number => {
  const base = props.status === "QUEUED" ? 4000 : 3000
  return Math.min(15000, base + Math.max(0, props.attempt - 20) * 500)
}

/**
 * 再読み込み後も進捗を出し続けるために localStorage に残す取り込み中の一覧
 */
export type StoredImportJob = {
  modelId: string
  name: string
  kind: UserModelKind
  sizeBytes: number
  startedAt: number
}

const STORED_IMPORT_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000

export const parseStoredImportJobs = (
  raw: string | null,
  now: number,
): StoredImportJob[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item): item is StoredImportJob =>
          item !== null &&
          typeof item === "object" &&
          typeof item.modelId === "string" &&
          /^[0-9a-z]{12}$/.test(item.modelId) &&
          typeof item.name === "string" &&
          (item.kind === "LORA" || item.kind === "CHECKPOINT") &&
          typeof item.sizeBytes === "number" &&
          typeof item.startedAt === "number",
      )
      .filter((item) => now - item.startedAt < STORED_IMPORT_MAX_AGE_MS)
      .slice(0, 20)
  } catch {
    return []
  }
}
