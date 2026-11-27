import { classifyPath } from "~/utils/page-view"

/**
 * 操作の記録（app/utils/event-log.ts が POST /api/ev にまとめて送る）を Workers Analytics Engine に 1 イベント 1 行で書く。
 * アプリ本体を読み込まずに worker-entry.ts で返す（1 回 1ms ほど）
 *
 * データセット aipictors_events の列（SQL では blob1〜 / double1〜 の名前で読む）:
 *   index1 = セッション ID（集計の間引きはセッション単位になる）
 *   blob1 イベント名 / blob2 出どころ / blob3 ページの種類（classifyPath）/ blob4 パス / blob5 流入元（page_view）
 *   blob6 セッション ID / blob7 ユーザー（ID の鍵付きハッシュ 16 桁、未ログインは空）/ blob8 ログイン中 "in" / "out"
 *   blob9 端末 mobile / tablet / desktop / blob10 OS / blob11 言語 / blob12 国 / blob13 通信元 ok / dc（データセンター）
 *   blob14 そのほかの値（JSON）/ blob15 訪問の印（d: その日の最初、n: 初めて）
 *   double1 数値（コイン数など）/ double2 ブラウザの時刻（ms）
 * メール・IP・プロンプトなどは受け取らない・書かない。クローラー（UA）は書かない
 */

type AnalyticsEngineLike = {
  writeDataPoint(point: {
    indexes?: string[]
    blobs?: string[]
    doubles?: number[]
  }): void
}

export type EventLogEnv = {
  EVENTS?: AnalyticsEngineLike
  EVENT_UID_SALT?: string
}

const MAX_BODY_BYTES = 32 * 1024
const MAX_EVENTS = 60

/** クローラー・監視・自動操作の UA（これらは書かない） */
export const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|mediapartners|facebookexternalhit|embedly|quora link|whatsapp\/|headless|phantom|puppeteer|playwright|selenium|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|python|curl|wget|okhttp|go-http|java\/|axios|node-fetch|scrapy|httpclient/i

/**
 * データセンターの AS 番号（AWS・Google Cloud・Azure・Alibaba・Tencent・Huawei・DigitalOcean・OVH・Hetzner・Linode・Vultr・Oracle）。
 * JS を動かすクローラーが多いので通信元を dc として書き、まとめでは数えない（VPN の人も入るので消さずに残す）
 */
const DATACENTER_ASNS = new Set([
  16509, 14618, 15169, 396982, 8075, 45102, 37963, 132203, 45090, 136907, 55990,
  14061, 16276, 24940, 63949, 20473, 31898,
])

export function deviceOf(ua: string) {
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) return "tablet"
  if (/Mobi|iPhone|iPod|Android|IEMobile|Opera Mini/i.test(ua)) return "mobile"
  return "desktop"
}

export function osOf(ua: string) {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios"
  if (/Android/i.test(ua)) return "android"
  if (/Windows/i.test(ua)) return "windows"
  if (/Macintosh|Mac OS X/i.test(ua)) return "mac"
  if (/CrOS/i.test(ua)) return "chromeos"
  if (/Linux/i.test(ua)) return "linux"
  return "other"
}

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.slice(0, max) : ""

let keyPromise: Promise<CryptoKey> | null = null
let keySalt = ""

/** ユーザー ID → 鍵付きハッシュ（16 桁）。鍵が無いときは書かない */
async function hashUser(userId: string, salt: string | undefined) {
  if (!salt || !userId) return ""
  if (keyPromise === null || keySalt !== salt) {
    keySalt = salt
    keyPromise = crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(salt),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    )
  }
  const signature = await crypto.subtle.sign(
    "HMAC",
    await keyPromise,
    new TextEncoder().encode(userId),
  )
  return Array.from(new Uint8Array(signature, 0, 8), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")
}

/** よそのサイトからの送信は受け付けない（Origin が無い古いブラウザは通す） */
function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin) return true
  try {
    const host = new URL(origin).hostname
    return (
      host === "aipictors.com" ||
      host.endsWith(".aipictors.com") ||
      host === "localhost"
    )
  } catch {
    return false
  }
}

const NO_CONTENT = () =>
  new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } })

export async function handleEventLog(
  request: Request,
  env: EventLogEnv,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } })
  }
  if (!isAllowedOrigin(request)) return new Response(null, { status: 403 })
  const ua = request.headers.get("user-agent") ?? ""
  if (!env.EVENTS || ua === "" || BOT_UA.test(ua)) return NO_CONTENT()
  const length = Number(request.headers.get("content-length") ?? "0")
  if (length > MAX_BODY_BYTES) return new Response(null, { status: 413 })
  let body: {
    sid?: unknown
    u?: unknown
    a?: unknown
    l?: unknown
    ev?: unknown
  }
  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) return new Response(null, { status: 413 })
    body = JSON.parse(raw)
  } catch {
    return new Response(null, { status: 400 })
  }
  if (!Array.isArray(body.ev)) return new Response(null, { status: 400 })
  const sid = /^[a-z0-9]{6,16}$/.test(text(body.sid, 16))
    ? text(body.sid, 16)
    : ""
  const userId = /^[A-Za-z0-9_-]{1,64}$/.test(text(body.u, 64))
    ? text(body.u, 64)
    : ""
  const user = await hashUser(userId, env.EVENT_UID_SALT)
  const auth = userId !== "" || body.a === 1 ? "in" : "out"
  const cf = (request as { cf?: { country?: string; asn?: number } }).cf
  const traffic = DATACENTER_ASNS.has(Number(cf?.asn)) ? "dc" : "ok"
  const common = {
    device: deviceOf(ua),
    os: osOf(ua),
    lang: text(body.l, 5).toLowerCase(),
    country: text(cf?.country, 2),
  }
  for (const item of body.ev.slice(0, MAX_EVENTS)) {
    if (typeof item !== "object" || item === null) continue
    const event = item as Record<string, unknown>
    const name = text(event.e, 64)
    if (!/^[A-Za-z0-9_:.-]+$/.test(name)) continue
    const path = (text(event.p, 200).split(/[?#]/)[0] ?? "") || "/"
    env.EVENTS.writeDataPoint({
      indexes: [sid],
      blobs: [
        name,
        text(event.s, 64),
        classifyPath(path),
        path,
        text(event.r, 32),
        sid,
        user,
        auth,
        common.device,
        common.os,
        common.lang,
        common.country,
        traffic,
        text(event.x, 300),
        text(event.v, 4),
      ],
      doubles: [
        typeof event.n === "number" && Number.isFinite(event.n) ? event.n : 0,
        typeof event.t === "number" && Number.isFinite(event.t) ? event.t : 0,
      ],
    })
  }
  return NO_CONTENT()
}
