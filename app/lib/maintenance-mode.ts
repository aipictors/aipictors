/**
 * KV（PAGE_CACHE）のフラグで切り替えるメンテナンス表示（docs/maintenance-mode.md）
 *
 * - maintenance:site: サイト全体。ページは 503 のメンテナンス画面、API・データは 503 の JSON（functions/[[path]].ts）
 * - maintenance:generation: 画像生成だけ。生成画面に帯を出し、生成ボタンを押せなくする
 *
 * 値は JSON（{"enabled":true,"endsAt":"2026-11-15T03:00:00+09:00","message":"…","bypassToken":"…"}）。
 * 再デプロイなしで切り替えられる。KV を毎回読まないよう、Worker のメモリに短時間置く
 */

export const SITE_MAINTENANCE_KV_KEY = "maintenance:site"

export const GENERATION_MAINTENANCE_KV_KEY = "maintenance:generation"

/** 運営が確認するための cookie（?maintenance_bypass=<bypassToken> で付く） */
export const MAINTENANCE_BYPASS_COOKIE = "aip_maintenance_bypass"

export const MAINTENANCE_BYPASS_PARAM = "maintenance_bypass"

/** Worker のメモリに置く時間（KV 側でも最大 60 秒ほど古い値が返ることがある） */
const MEMORY_CACHE_TTL_MS = 20_000

export type MaintenanceFlag = {
  enabled: boolean
  /** 終了予定（ISO 8601） */
  endsAt: string | null
  message: string | null
  /** サイト全体のときだけ使う（画面・JSON には出さない） */
  bypassToken: string | null
}

/** 画面に渡す形（bypassToken は外す） */
export type PublicMaintenanceFlag = {
  enabled: boolean
  endsAt: string | null
  message: string | null
}

type KvNamespace = {
  get(key: string, options: { type: "text" }): Promise<string | null>
}

const DISABLED: MaintenanceFlag = {
  enabled: false,
  endsAt: null,
  message: null,
  bypassToken: null,
}

const optionalString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null

export const parseMaintenanceFlag = (raw: string | null): MaintenanceFlag => {
  if (!raw) return DISABLED
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return DISABLED
  }
  if (!value || typeof value !== "object") return DISABLED
  const v = value as Record<string, unknown>
  if (v.enabled !== true) return DISABLED
  const endsAt = optionalString(v.endsAt)
  return {
    enabled: true,
    endsAt:
      endsAt !== null && !Number.isNaN(Date.parse(endsAt)) ? endsAt : null,
    message: optionalString(v.message),
    bypassToken: optionalString(v.bypassToken),
  }
}

export const toPublicMaintenanceFlag = (
  flag: MaintenanceFlag,
): PublicMaintenanceFlag => ({
  enabled: flag.enabled,
  endsAt: flag.endsAt,
  message: flag.message,
})

const memoryCache = new Map<string, { flag: MaintenanceFlag; at: number }>()

const getKv = (env: unknown): KvNamespace | null => {
  const kv = (env as { PAGE_CACHE?: KvNamespace } | undefined)?.PAGE_CACHE
  return kv ?? null
}

/**
 * フラグを読む（20 秒はメモリの値を使う）。読めなければ前回の値、それもなければ無効として扱う
 */
export const readMaintenanceFlag = async (
  env: unknown,
  key: string,
): Promise<MaintenanceFlag> => {
  const cached = memoryCache.get(key)
  if (cached && Date.now() - cached.at < MEMORY_CACHE_TTL_MS) {
    return cached.flag
  }
  const kv = getKv(env)
  if (kv === null) return DISABLED
  try {
    const flag = parseMaintenanceFlag(await kv.get(key, { type: "text" }))
    memoryCache.set(key, { flag, at: Date.now() })
    return flag
  } catch {
    return cached?.flag ?? DISABLED
  }
}

const readCookie = (request: Request, name: string): string | null => {
  const cookie = request.headers.get("cookie") ?? ""
  for (const part of cookie.split(";")) {
    const index = part.indexOf("=")
    if (index < 0) continue
    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim())
    }
  }
  return null
}

/** 運営の確認用 cookie が今の bypassToken と同じか */
export const hasMaintenanceBypass = (
  request: Request,
  flag: MaintenanceFlag,
): boolean => {
  if (flag.bypassToken === null) return false
  return readCookie(request, MAINTENANCE_BYPASS_COOKIE) === flag.bypassToken
}

/**
 * 終了予定を日本時間で（例: 11月15日(日) 03:00）。なければ null
 */
export const formatMaintenanceEndsAt = (
  endsAt: string | null,
  locale: "ja" | "en" = "ja",
): string | null => {
  if (endsAt === null) return null
  const date = new Date(endsAt)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    timeZone: "Asia/Tokyo",
    month: locale === "ja" ? "numeric" : "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

/**
 * Retry-After（秒）。終了予定までの時間（1 分〜1 日）、なければ 10 分
 */
export const getMaintenanceRetryAfter = (flag: MaintenanceFlag): number => {
  if (flag.endsAt === null) return 600
  const seconds = Math.ceil((Date.parse(flag.endsAt) - Date.now()) / 1000)
  return Math.min(Math.max(seconds, 60), 86_400)
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")

/**
 * サイト全体のメンテナンス画面（Remix を通さずに返すので、外部の CSS・JS は読まない）
 */
export const createSiteMaintenanceHtml = (flag: MaintenanceFlag): string => {
  const endsAt = formatMaintenanceEndsAt(flag.endsAt) ?? "未定"
  const message =
    flag.message !== null
      ? `<p class="message">${escapeHtml(flag.message)}</p>`
      : ""

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <title>メンテナンス中 | Aipictors</title>
    <link rel="icon" href="/favicon.ico" />
    <style>
      :root { color-scheme: light dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        color: #0f172a;
        font-family: ui-sans-serif, system-ui, -apple-system, "Hiragino Sans",
          "Noto Sans JP", "Segoe UI", Roboto, sans-serif;
      }
      @media (prefers-color-scheme: dark) {
        body { background: #0b1220; color: #e2e8f0; }
        .card { background: #111a2e; border-color: #1e293b; }
        .sub { color: #94a3b8; }
      }
      .card {
        width: min(560px, 92vw);
        padding: 32px 24px;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        background: #fff;
        text-align: center;
      }
      img { width: min(240px, 60vw); height: auto; display: block; margin: 0 auto 16px; }
      h1 { margin: 0 0 12px; font-size: 24px; }
      p { margin: 0; line-height: 1.8; }
      .ends { margin-top: 8px; font-weight: 600; }
      .message { margin-top: 16px; white-space: pre-wrap; text-align: left; }
      .sub { margin-top: 20px; font-size: 13px; color: #64748b; }
      a { color: inherit; }
    </style>
  </head>
  <body>
    <main class="card">
      <img src="https://assets.aipictors.com/sorrypictorchan.webp" alt="" />
      <h1>メンテナンス中</h1>
      <p>ただいまメンテナンス中です。</p>
      <p class="ends">終了予定: ${escapeHtml(endsAt)}</p>
      ${message}
      <p class="sub">ご不便をおかけして申し訳ありません。最新の情報は <a href="https://x.com/AIPICTORS" rel="noopener">X（@AIPICTORS）</a> でお知らせします。</p>
    </main>
  </body>
</html>`
}
