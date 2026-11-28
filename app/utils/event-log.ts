/**
 * 操作の記録（どのページで何を表示・押したか）を自前の記録先（/api/ev → Workers Analytics Engine）に送る。
 * 毎日 aipictors-api が前日分を日別・イベント別・ファネル別にまとめて D1 に保存し、生のイベントは R2 に残す
 * （分析の道具: ~/Documents/aipictors-analytics/events.py）
 *
 * - 送るのはまとめて: 画面を離れる・隠れるとき（pagehide / visibilitychange）と、30 件たまったとき、
 *   いちばん古い未送信が 5 分たったときだけ。1 回の送信が 1 リクエスト（Worker の起動）になるため
 * - 最初のページ表示は HTML に埋め込んだスクリプトが window.__aipEv に積む（hydration の前に離れた人も数える。
 *   app/utils/page-view.ts の PAGE_VIEW_INLINE_SCRIPT）。ここで読み込んだら引き取る
 * - 利用者を見分ける ID は送らない。タブごとのセッション（30 分操作がなければ新しくなる）と、
 *   ログイン中はユーザー ID（サーバーで鍵付きのハッシュにしてから保存する）だけ
 * - 自動操作のブラウザ（navigator.webdriver）は送らない
 */

export const EVENT_LOG_ENDPOINT = "/api/ev"

/** セッション ID を置く sessionStorage のキー（値は "<ID>.<最後の操作の時刻 ms>"） */
export const SESSION_KEY = "aip.sid"

/** 操作がこれだけ空いたら新しいセッションにする */
export const SESSION_IDLE_MS = 30 * 60 * 1000

const MAX_QUEUE = 30
const MAX_WAIT_MS = 5 * 60 * 1000

/** 1 件のイベント（送る形。キーは短く） */
export type EventLogItem = {
  /** イベント名 */
  e: string
  /** 出どころ（trackGrowthEvent の source など） */
  s?: string
  /** そのときのパス（クエリは付けない） */
  p: string
  /** page_view の流入元（direct / google / nav:<前のページの種類> など） */
  r?: string
  /** 時刻（ms） */
  t: number
  /** そのほかの値（JSON 文字列、短く） */
  x?: string
  /** 数値（コイン数など） */
  n?: number
  /** 訪問の印（page_view だけ。d: その日の最初、n: このブラウザで初めて） */
  v?: string
}

type InlineQueue = {
  sid?: string
  q?: EventLogItem[]
  taken?: boolean
}

declare global {
  interface Window {
    __aipEv?: InlineQueue
  }
}

/** 今のセッション ID（30 分以上操作がなければ新しくする）。保存できないときは空 */
export function currentSessionId(now = Date.now()): string {
  try {
    const stored = window.sessionStorage.getItem(SESSION_KEY) ?? ""
    const [id, last] = stored.split(".")
    const isFresh =
      id !== undefined &&
      /^[a-z0-9]{6,16}$/.test(id) &&
      now - Number(last) < SESSION_IDLE_MS
    const sid = isFresh ? id : Math.random().toString(36).slice(2, 12)
    window.sessionStorage.setItem(SESSION_KEY, `${sid}.${now}`)
    return sid
  } catch {
    return ""
  }
}

let queue: EventLogItem[] = []
let userId: string | null = null
let isStarted = false
let isDisabled = false
let timer: ReturnType<typeof setTimeout> | null = null

const toPath = () => window.location.pathname.slice(0, 200)

/** 送るパラメータ（source 以外）を短い JSON にする。文字列と数値だけ */
export function toExtra(
  params: Record<string, unknown> | undefined,
): Pick<EventLogItem, "x" | "n"> {
  if (!params) return {}
  const extra: Record<string, string | number> = {}
  let value: number | undefined
  for (const [key, raw] of Object.entries(params)) {
    if (key === "source") continue
    if (typeof raw === "number" && Number.isFinite(raw)) {
      extra[key] = raw
      if (value === undefined) value = raw
    } else if (typeof raw === "string") {
      extra[key] = raw.slice(0, 60)
    }
  }
  const x = Object.keys(extra).length > 0 ? JSON.stringify(extra) : ""
  return {
    ...(x && x.length <= 300 ? { x } : {}),
    ...(value !== undefined ? { n: value } : {}),
  }
}

function flush() {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
  if (queue.length === 0) return
  const body = JSON.stringify({
    v: 1,
    sid: currentSessionId(),
    u: userId,
    a:
      userId !== null || document.documentElement.dataset.aipAuth === "in"
        ? 1
        : 0,
    l: (navigator.language || "").slice(0, 5),
    ev: queue,
  })
  queue = []
  try {
    if (navigator.sendBeacon?.(EVENT_LOG_ENDPOINT, body)) return
  } catch {
    // 送れなければ下の fetch で
  }
  fetch(EVENT_LOG_ENDPOINT, {
    method: "POST",
    body,
    keepalive: true,
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
  }).catch(() => {})
}

/**
 * 記録を始める（hydration の直後に root から呼ぶ）。埋め込みのスクリプトが積んだ最初の page_view を引き取り、
 * 画面が隠れたとき・離れるときに送るようにする（何も操作がないページでも最初の表示が送られる）
 */
export function startEventLog() {
  if (typeof window === "undefined") return
  start()
}

function start() {
  if (isStarted) return
  isStarted = true
  try {
    isDisabled =
      navigator.webdriver === true || import.meta.env.NODE_ENV === "development"
  } catch {
    isDisabled = true
  }
  const inline = window.__aipEv
  if (inline) {
    inline.taken = true
    if (!isDisabled && Array.isArray(inline.q)) queue.push(...inline.q)
    inline.q = []
  }
  if (isDisabled) {
    queue = []
    return
  }
  window.addEventListener("pagehide", flush)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush()
  })
  if (queue.length > 0) schedule()
}

function schedule() {
  if (queue.length >= MAX_QUEUE) {
    flush()
    return
  }
  if (timer === null) timer = setTimeout(flush, MAX_WAIT_MS)
}

function push(item: EventLogItem) {
  if (typeof window === "undefined") return
  start()
  if (isDisabled) return
  currentSessionId()
  queue.push(item)
  schedule()
}

/**
 * 操作を 1 件記録する（trackFunnelEvent・trackGrowthEvent からも呼ばれる）。
 * params.source は出どころとして、ほかの文字列・数値は短い JSON として残す（個人を特定できる値は渡さない）
 */
export function logEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  const source = params?.source
  push({
    e: name.slice(0, 64),
    ...(typeof source === "string" && source !== ""
      ? { s: source.slice(0, 64) }
      : {}),
    p: toPath(),
    t: Date.now(),
    ...toExtra(params),
  })
}

/** サイト内の移動でのページ表示（最初の表示は埋め込みのスクリプトが積む） */
export function logPageView(fromPageType: string) {
  if (typeof window === "undefined") return
  push({ e: "page_view", p: toPath(), r: `nav:${fromPageType}`, t: Date.now() })
}

/**
 * 形を決めたイベントをそのまま 1 件記録する（cls_shift のように x が長い・パスがそのときと違うもの）。
 * 長さはサーバーでも切る（x は 300 文字）
 */
export function logEventItem(item: Omit<EventLogItem, "t"> & { t?: number }) {
  if (typeof window === "undefined") return
  push({ ...item, e: item.e.slice(0, 64), t: item.t ?? Date.now() })
}

/** たまっている分をすぐ送る（画面が隠れたあとに積んだものなど） */
export function flushEventLog() {
  if (typeof window === "undefined" || isDisabled) return
  flush()
}

/** ログイン中のユーザー（ログアウトで null）。送るときにまとめて付ける */
export function setEventLogUser(id: string | null) {
  if (userId === id) return
  // 前の人の分は前の人として送ってから切り替える
  if (typeof window !== "undefined" && queue.length > 0 && userId !== null) {
    flush()
  }
  userId = id
}

/** テスト用 */
export function resetEventLogForTest() {
  queue = []
  userId = null
  isStarted = false
  isDisabled = false
  if (timer !== null) clearTimeout(timer)
  timer = null
}

export function peekEventLogQueueForTest() {
  return queue
}
