// クライアント診断ログ（セッション内、最大500件、localStorageにも保存）
import { redactDiagnostics } from "~/lib/redact-diagnostics"

export type LogLevel = "info" | "warn" | "error"

export type LogEntry = {
  id: string
  timestamp: number
  level: LogLevel
  source: string
  message: string
  details?: unknown
}

const STORAGE_KEY = "aipictors:generation:logs"
const MAX_LOGS = 500

let logs: LogEntry[] = []

// 機密情報を含む可能性のあるdetailsを再帰的にマスキングする
const redact = (value: unknown): unknown => {
  return redactDiagnostics(value)
}

// localStorageから読み出したエントリを安全化
const sanitizeEntry = (entry: LogEntry): LogEntry => {
  try {
    return {
      ...entry,
      details:
        typeof entry.details === "undefined"
          ? undefined
          : redact(entry.details),
    }
  } catch {
    return { ...entry, details: undefined }
  }
}

const loadInitial = () => {
  try {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null
    if (!raw) return
    const data = JSON.parse(raw) as LogEntry[]
    if (Array.isArray(data)) {
      logs = data.map(sanitizeEntry)
    }
  } catch {
    // noop
  }
}

// 他チャンク/他インポート元で追加されたログをlocalStorageから同期
const syncFromStorage = () => {
  try {
    if (typeof window === "undefined") return
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as LogEntry[]
    if (Array.isArray(data)) {
      logs = data.map(sanitizeEntry)
    }
  } catch {
    // noop
  }
}

const persist = () => {
  try {
    if (typeof window === "undefined") return
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(logs.slice(-MAX_LOGS)),
    )
  } catch {
    // noop
  }
}

const notify = () => {
  try {
    if (typeof window === "undefined") return
    const event = new CustomEvent("generation:logs-updated")
    window.dispatchEvent(event)
  } catch {
    // noop
  }
}

const add = (entry: Omit<LogEntry, "id" | "timestamp">) => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  // detailsは保存前にサニタイズ
  const safeDetails =
    typeof entry.details === "undefined" ? undefined : redact(entry.details)
  const item: LogEntry = {
    id,
    timestamp: Date.now(),
    ...entry,
    details: safeDetails,
  }
  logs.push(item)
  if (logs.length > MAX_LOGS) {
    logs = logs.slice(-MAX_LOGS)
  }
  persist()
  notify()
  return item
}

export const logInfo = (props: {
  source: string
  message: string
  details?: unknown
}) => {
  return add({
    level: "info",
    source: props.source,
    message: props.message,
    details: props.details,
  })
}

export const logWarn = (props: {
  source: string
  message: string
  details?: unknown
}) => {
  return add({
    level: "warn",
    source: props.source,
    message: props.message,
    details: props.details,
  })
}

export const logError = (props: {
  source: string
  message: string
  details?: unknown
}) => {
  return add({
    level: "error",
    source: props.source,
    message: props.message,
    details: props.details,
  })
}

export const getLogs = (): LogEntry[] => {
  // イベントで更新通知を受けた側でも最新状態を取得できるように同期
  syncFromStorage()
  return [...logs]
}

export const clearLogs = () => {
  logs = []
  persist()
  notify()
}

// 初期化
loadInitial()
