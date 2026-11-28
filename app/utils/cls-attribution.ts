/**
 * 表示のずれ（CLS）の原因を操作の記録（/api/ev → aipictors_events）に残すための純粋な処理と、ルートの履歴。
 * web-vitals を読むのは app/utils/cls-observer.ts（間引きで選ばれたセッションだけ、hydration のあとに動的 import）。
 *
 * - イベント名は cls_shift。CLS が CLS_THRESHOLD 以上のときだけ、web-vitals の 1 つの計測（metric.id。
 *   最初の読み込み・bfcache からの復帰・soft navigation ごとに別）につき 1 回だけ送る
 * - パスはいちばん大きいずれが起きたときのルート（クエリなし）。ソフトナビゲーションの計測に対応していない
 *   ブラウザでは 1 つの計測がタブの間ずっと続くため、送る時点のパスではなくずれた時刻のパスを使う
 * - x: t ずれた要素のセレクタ / v いちばん大きいずれ / at その時刻（ms）/ nt 読み込みの種類 / vw 画面の幅 /
 *   sr 間引き率（%）/ cv 見積もりの高さ（data-cih）を持つ部分の [見積もり, 実際の高さ, 位置]。
 *   ずれた要素にいちばん近い祖先が先頭（ずれた時点で測る。最大 4 つ）
 *   （位置 i: ずれた要素を含む、a: ずれた要素より上にある、b: 下にある）
 * - n は CLS の値、s は読み込みの状態（loading / dom-interactive / dom-content-loaded / complete）
 */

/** これ以上の CLS だけ送る（Google の「良い」は 0.1 以下。手前から拾う） */
export const CLS_THRESHOLD = 0.05

/** 送るセッションの割合（セッション ID で決めるので、同じセッションの中では変わらない） */
export const CLS_SAMPLE_RATE = 0.2

/** セレクタの長さの上限（後ろ＝ずれた要素に近い側を残す） */
export const CLS_TARGET_MAX = 200

/** x の長さの上限（サーバーは 300 文字で切る） */
const EXTRA_MAX = 300

/** 見積もりの高さを記録する部分の数の上限 */
const MAX_ESTIMATES = 4

/** 文字列のハッシュ（FNV-1a 32bit） */
function hash(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** このセッションで送るか。セッション ID がなければ（保存できない）その場の乱数 */
export function isSampledSession(
  sessionId: string,
  rate = CLS_SAMPLE_RATE,
  random: () => number = Math.random,
): boolean {
  if (rate <= 0) return false
  if (rate >= 1) return true
  const value = sessionId ? (hash(sessionId) % 10000) / 10000 : random()
  return value < rate
}

/** 長すぎるセレクタは前を落として後ろ（ずれた要素の側）を残す */
export function truncateSelector(selector: string, max = CLS_TARGET_MAX) {
  if (selector.length <= max) return selector
  return `…${selector.slice(selector.length - (max - 1))}`
}

/** 1 つの計測（metric.id）につき 1 回だけ、閾値以上のときに送る */
export function createClsGate(threshold = CLS_THRESHOLD) {
  const sentIds = new Set<string>()
  return (metricId: string, value: number): boolean => {
    if (!(value >= threshold) || sentIds.has(metricId)) return false
    sentIds.add(metricId)
    return true
  }
}

type RouteMark = { t: number; p: string }

const MAX_ROUTES = 50
let routes: RouteMark[] = []

const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now()

/** ルートが変わったら呼ぶ（root の PageViewTracker）。時刻は performance.now() */
export function noteClsRoute(pathname: string, time = now()) {
  const last = routes[routes.length - 1]
  if (last?.p === pathname) return
  routes.push({ t: time, p: pathname.slice(0, 200) })
  if (routes.length > MAX_ROUTES) routes = routes.slice(-MAX_ROUTES)
}

/** その時刻に表示していたルート。記録がなければ fallback */
export function routeAt(time: number | undefined, fallback: string): string {
  if (time === undefined || routes.length === 0) return fallback
  let path = routes[0]?.p ?? fallback
  for (const mark of routes) {
    if (mark.t > time) break
    path = mark.p
  }
  return path
}

export function resetClsRoutesForTest() {
  routes = []
}

/** 見積もりの高さ（data-cih）を持つ部分の [見積もり, 実際の高さ, 位置] */
export type ClsEstimate = [number, number, "i" | "a" | "b"]

type ClsExtraInput = {
  target?: string
  largestShiftValue?: number
  largestShiftTime?: number
  navigationType?: string
  viewportWidth?: number
  sampleRate?: number
  estimates?: ClsEstimate[]
}

const round = (value: number, digits: number) => {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

/** x（短い JSON）を作る。300 文字を超えるならセレクタを縮め、それでも長ければ見積もりを落とす */
export function buildClsExtra(input: ClsExtraInput): string {
  const base: Record<string, unknown> = {}
  if (input.largestShiftValue !== undefined)
    base.v = round(input.largestShiftValue, 4)
  if (input.largestShiftTime !== undefined)
    base.at = Math.round(input.largestShiftTime)
  if (input.navigationType) base.nt = input.navigationType.slice(0, 20)
  if (input.viewportWidth !== undefined)
    base.vw = Math.round(input.viewportWidth)
  if (input.sampleRate !== undefined)
    base.sr = Math.round(input.sampleRate * 100)
  let estimates = (input.estimates ?? []).slice(0, MAX_ESTIMATES)
  let target = truncateSelector(input.target ?? "")
  for (;;) {
    const extra = {
      ...(target ? { t: target } : {}),
      ...base,
      ...(estimates.length > 0 ? { cv: estimates } : {}),
    }
    const json = JSON.stringify(extra)
    if (json.length <= EXTRA_MAX) return json
    if (target.length > 60) {
      target = truncateSelector(
        target,
        Math.max(60, target.length - (json.length - EXTRA_MAX)),
      )
    } else if (estimates.length > 0) {
      estimates = estimates.slice(0, -1)
    } else {
      return json.slice(0, EXTRA_MAX)
    }
  }
}

/** セレクタに使うクラス（Tailwind の md:… や w-[…] のような記号つきは長いだけなので除く） */
const isPlainClass = (name: string) => /^[a-zA-Z][\w-]{0,30}$/.test(name)

/**
 * ずれた要素のセレクタ。web-vitals の既定は Tailwind のクラスで 100 文字に達して要素 1 つ分しか残らないため、
 * 要素ごとにクラスは 2 つまで、id か 5 段で止める。見積もりの高さを持つ部分は [data-cih=…] を付ける
 */
export function selectorFor(node: Node | null): string {
  let el: Element | null =
    node === null
      ? null
      : node.nodeType === 1
        ? (node as Element)
        : node.parentElement
  const parts: string[] = []
  while (el && parts.length < 5 && el.nodeType === 1) {
    const tag = el.tagName.toLowerCase()
    if (tag === "html" || tag === "body") break
    if (el.id) {
      parts.unshift(`#${el.id}`)
      break
    }
    const classes = Array.from(el.classList).filter(isPlainClass).slice(0, 2)
    const cih = el.getAttribute("data-cih")
    parts.unshift(
      `${tag}${classes.map((name) => `.${name}`).join("")}${cih ? `[data-cih=${cih}]` : ""}`,
    )
    el = el.parentElement
  }
  return truncateSelector(parts.join(">"))
}

/**
 * ページ内の見積もりの高さ（data-cih）を持つ部分の見積もりと実際の高さ、ずれた要素との位置。
 * ずれた要素にいちばん近い祖先（位置 i）があれば必ず先頭に入れ、残りはページの上から
 */
export function estimatesFor(node: Node | null, root: ParentNode = document) {
  const element =
    node === null
      ? null
      : node.nodeType === 1
        ? (node as Element)
        : node.parentElement
  const nearest = element?.closest("[data-cih]") ?? null
  const others = Array.from(root.querySelectorAll("[data-cih]")).filter(
    (el) => el !== nearest,
  )
  const estimates: ClsEstimate[] = []
  for (const el of [...(nearest ? [nearest] : []), ...others]) {
    if (estimates.length >= MAX_ESTIMATES) break
    const estimate = Number(el.getAttribute("data-cih"))
    if (!Number.isFinite(estimate)) continue
    const height = Math.round(el.getBoundingClientRect().height)
    let position: ClsEstimate[2] = "b"
    if (node && el.contains(node)) {
      position = "i"
    } else if (
      node &&
      el.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      position = "a"
    }
    estimates.push([estimate, height, position])
  }
  return estimates
}
