/**
 * ページとページのデータ（Remix の ?_data）を Cloudflare の拠点ごとに短時間キャッシュする。
 *
 * サーバー側の描画はログイン状態に依存しない（loader は認証なしで API を呼ぶ）ので、
 * URL と表示言語ごとに同じ結果を使い回せる。キャッシュできれば API・DB へは問い合わせない。
 * - 保存時間は各ページの Cache-Control の s-maxage（なければキャッシュしない。一部の一覧のデータは既定 30 秒）
 * - 期限切れでも stale-while-revalidate の間は古いものを返し、裏で作り直す
 * - デプロイごとにキーを変える（古い HTML が古いファイルを読み込まないように）
 * - 数の限られた一覧のページ（isSharedPage）は全拠点共通の KV にも置く。
 *   拠点のキャッシュは拠点ごとなので、海外や久しぶりの拠点では API から作り直して 2〜4 秒かかっていた
 */

import { getLayoutHint } from "~/utils/layout-hint"

type KvNamespace = {
  getWithMetadata(
    key: string,
    options: { type: "text"; cacheTtl?: number },
  ): Promise<{ value: string | null; metadata: unknown }>
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number; metadata?: unknown },
  ): Promise<void>
}

type Ctx = {
  request: Request
  env?: unknown
  waitUntil(promise: Promise<unknown>): void
}

/**
 * 全拠点共通の KV に置く追加の内容（HTML から外したローダーのデータなど）
 */
export type SharedExtra = {
  /** 描画し終えたあとに、一緒に置く内容を返す */
  get: () => string | undefined
  /** KV から返すときに、その拠点に戻す */
  restore: (value: string) => void
}

/**
 * 全拠点共通の KV にも置くページ。KV は書き込みが有料なので、数の限られた一覧（検索条件なし）だけにする
 */
const SHARED_PAGE_PATH =
  /^\/(?:(?:ja|en)\/?)?(?:r\/?)?(?:$|home\/?$|rankings(?:\/[\w-]+)*\/?$|themes(?:\/[\w-]+)*\/?$|tags\/?$|posts\/(?:2d|3d|novel|column|video)\/?$)/

export const isSharedPage = (url: URL) =>
  !url.search && SHARED_PAGE_PATH.test(url.pathname)

/** 同じページを KV に書き直す最短の間隔（秒） */
const SHARED_WRITE_INTERVAL_SECONDS = 60 * 10

type SharedMetadata = { s: number; t: number; w: number; v: number }

const toSharedMetadata = (value: unknown): SharedMetadata | null => {
  if (!value || typeof value !== "object") return null
  const m = value as Partial<SharedMetadata>
  if (
    typeof m.s !== "number" ||
    typeof m.t !== "number" ||
    typeof m.w !== "number" ||
    m.v !== 1
  ) {
    return null
  }
  return m as SharedMetadata
}

/** KV に置かない（拠点ごとに付け直される）ヘッダー */
const SHARED_SKIP_HEADERS = new Set([
  "content-length",
  "content-encoding",
  "transfer-encoding",
  "connection",
  "x-edge-stored-at",
  "x-edge-ttl",
  "x-edge-swr",
  "x-edge-cache",
  "cache-control",
])

const getSharedKv = (ctx: Ctx): KvNamespace | null => {
  const env = ctx.env as { PAGE_CACHE?: KvNamespace } | undefined
  return env?.PAGE_CACHE ?? null
}

/** キャッシュしないパス */
const EXCLUDED_PATH =
  /^\/(?:en\/)?(?:api|admin|settings|my|new|auth|login|logout|support|__|resource|sitemap|sitemaps|feed|rss|generation\/feed)(?:\/|$|\.)/

/**
 * ページのデータ（?_data）で、loader が Cache-Control を付けていなくても短くキャッシュしてよい一覧
 */
const PUBLIC_DATA_PATH =
  /^\/(?:en\/)?(?:r\/?)?(?:$|home$|rankings|ai-rankings|posts\/(?:2d|3d|novel|column|video)|tags|themes|albums|events|models|search|users\/[^/]+$|posts\/\d+$)/

const DEFAULT_DATA_TTL_SECONDS = 30
const DEFAULT_SWR_SECONDS = 300

/**
 * 古いものを返して裏で作り直す期間の下限。
 * キャッシュは拠点ごとなので、アクセスの少ない拠点（海外や検索エンジン・計測ツール）では
 * 数分で切れてしまい、そのたびに API から作り直して 2〜3 秒かかっていた。
 * 古いものを返すのはその拠点で久しぶりの 1 回だけで、直後に作り直す
 */
const MIN_SWR_SECONDS = 60 * 60 * 6

const parseCacheControl = (value: string | null) => {
  const lower = (value ?? "").toLowerCase()
  const num = (name: string) => {
    const match = lower.match(new RegExp(`${name}\\s*=\\s*(\\d+)`))
    return match ? Number(match[1]) : null
  }
  return {
    isPrivate: lower.includes("private") || lower.includes("no-store"),
    sMaxAge: num("s-maxage"),
    swr: num("stale-while-revalidate"),
  }
}

/**
 * 投稿・更新した直後（cookie aip_fresh、10 分）は保存済みのものを使わずに作り直す。
 * 作り直したものは保存するので、同じ拠点の他の人にもすぐ新しい内容が出る
 */
const wantsFresh = (request: Request) =>
  /(?:^|;\s*)aip_fresh=1(?:;|$)/.test(request.headers.get("cookie") ?? "")

const getLocale = (request: Request): "ja" | "en" => {
  const cookie = request.headers.get("cookie") ?? ""
  const match = cookie.match(/(?:^|;\s*)locale=(ja|en)/)
  if (match) return match[1] as "ja" | "en"
  const acceptLanguage = request.headers.get("accept-language")?.toLowerCase()
  return acceptLanguage?.startsWith("en") ? "en" : "ja"
}

export const createEdgePageCache = (version: string) => {
  const isCacheableRequest = (request: Request, url: URL) => {
    if (request.method !== "GET") return false
    if (request.headers.get("authorization")) return false
    if (EXCLUDED_PATH.test(url.pathname)) return false
    // 画像やファイル（拡張子つき）は対象外
    if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) return false
    const isData = url.searchParams.has("_data")
    if (!isData) {
      const accept = request.headers.get("accept") ?? ""
      if (!accept.includes("text/html")) return false
    }
    return true
  }

  const toCacheKey = (request: Request, url: URL) => {
    const key = new URL(url.toString())
    key.hostname = "www.aipictors.com"
    key.protocol = "https:"
    // 端末の種類で描画する一覧が違う（app/utils/layout-hint.ts）
    key.pathname = `/__edge/${version}/${getLocale(request)}/${getLayoutHint(request)}${url.pathname}`
    key.searchParams.sort()
    return new Request(key.toString(), { method: "GET" })
  }

  /**
   * キャッシュの保存時間（秒）。キャッシュしないなら null
   */
  const getTtl = (url: URL, response: Response) => {
    if (response.status !== 200) return null
    if (response.headers.has("Set-Cookie")) return null
    // Remix のリダイレクトやエラー（データ）は保存しない
    if (
      response.headers.has("X-Remix-Redirect") ||
      response.headers.has("X-Remix-Error") ||
      response.headers.has("X-Remix-Catch")
    ) {
      return null
    }
    const cc = parseCacheControl(response.headers.get("Cache-Control"))
    if (cc.sMaxAge !== null && cc.sMaxAge > 0 && !cc.isPrivate) {
      return {
        ttl: cc.sMaxAge,
        swr: Math.max(cc.swr ?? DEFAULT_SWR_SECONDS, MIN_SWR_SECONDS),
      }
    }
    if (
      url.searchParams.has("_data") &&
      !response.headers.get("Cache-Control") &&
      PUBLIC_DATA_PATH.test(url.pathname)
    ) {
      return { ttl: DEFAULT_DATA_TTL_SECONDS, swr: MIN_SWR_SECONDS }
    }
    return null
  }

  /**
   * ブラウザには保存させない（新しい内容をすぐ見られるように）
   */
  const forBrowser = (response: Response, state: string) => {
    const headers = new Headers(response.headers)
    headers.set("Cache-Control", "public, max-age=0, must-revalidate")
    headers.set("X-Edge-Cache", state)
    headers.delete("X-Edge-Stored-At")
    headers.delete("X-Edge-Ttl")
    headers.delete("X-Edge-Swr")
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }

  const store = async (
    cacheKey: Request,
    response: Response,
    ttl: { ttl: number; swr: number },
    storedAt = Date.now(),
  ) => {
    const headers = new Headers(response.headers)
    headers.set("X-Edge-Stored-At", String(storedAt))
    headers.set("X-Edge-Ttl", String(ttl.ttl))
    headers.set("X-Edge-Swr", String(ttl.swr))
    // Cache API に残しておく時間（期限は X-Edge-Stored-At で判定する）
    headers.set("Cache-Control", `public, max-age=${ttl.ttl + ttl.swr}`)
    await caches.default.put(
      cacheKey,
      new Response(response.body, { status: response.status, headers }),
    )
  }

  /**
   * 全拠点共通の KV から読む。中身は「1 行目にヘッダーと追加の内容の JSON、2 行目から本文」
   */
  const readShared = async (kv: KvNamespace, key: string) => {
    const { value, metadata } = await kv.getWithMetadata(key, {
      type: "text",
      cacheTtl: 60,
    })
    const meta = toSharedMetadata(metadata)
    if (value === null || meta === null) return null
    const newline = value.indexOf("\n")
    if (newline < 0) return null
    const head = JSON.parse(value.slice(0, newline)) as {
      h: [string, string][]
      x?: string
    }
    return { meta, headers: head.h, extra: head.x, body: value.slice(newline + 1) }
  }

  const writeShared = async (
    kv: KvNamespace,
    key: string,
    response: Response,
    ttl: { ttl: number; swr: number },
    extra: SharedExtra | undefined,
  ) => {
    const body = await response.text()
    const headers: [string, string][] = []
    response.headers.forEach((value, name) => {
      if (!SHARED_SKIP_HEADERS.has(name.toLowerCase())) headers.push([name, value])
    })
    const metadata: SharedMetadata = { s: Date.now(), t: ttl.ttl, w: ttl.swr, v: 1 }
    await kv.put(key, `${JSON.stringify({ h: headers, x: extra?.get() })}\n${body}`, {
      expirationTtl: Math.max(ttl.ttl + ttl.swr, 60),
      metadata,
    })
  }

  /**
   * キャッシュを使ってページを返す。render はキャッシュがないときに実際に作る処理
   */
  const handle = async (
    ctx: Ctx,
    render: () => Promise<Response>,
    sharedExtra?: SharedExtra,
  ): Promise<Response> => {
    const url = new URL(ctx.request.url)
    if (!isCacheableRequest(ctx.request, url)) {
      return render()
    }
    const cacheKey = toCacheKey(ctx.request, url)
    const kv = isSharedPage(url) ? getSharedKv(ctx) : null
    const sharedKey = cacheKey.url
    /** KV にあるものの保存時刻（読んでいないときは undefined） */
    let sharedStoredAt: number | null | undefined

    const shouldWriteShared = async () => {
      if (!kv) return false
      if (sharedStoredAt === undefined) {
        const shared = await readShared(kv, sharedKey).catch(() => null)
        sharedStoredAt = shared?.meta.s ?? null
      }
      return (
        sharedStoredAt === null ||
        (Date.now() - sharedStoredAt) / 1000 >= SHARED_WRITE_INTERVAL_SECONDS
      )
    }

    const renderAndStore = async () => {
      const response = await render()
      const ttl = getTtl(url, response)
      if (ttl === null) return { response, stored: false }
      const forShared = kv ? response.clone() : null
      ctx.waitUntil(
        store(cacheKey, response.clone(), ttl).catch(() => undefined),
      )
      if (kv && forShared) {
        ctx.waitUntil(
          (async () => {
            if (!(await shouldWriteShared())) {
              await forShared.body?.cancel()
              return
            }
            await writeShared(kv, sharedKey, forShared, ttl, sharedExtra)
          })().catch(() => undefined),
        )
      }
      return { response, stored: true }
    }

    let cached: Response | undefined
    try {
      cached = wantsFresh(ctx.request)
        ? undefined
        : await caches.default.match(cacheKey)
    } catch {
      cached = undefined
    }

    if (cached) {
      const storedAt = Number(cached.headers.get("X-Edge-Stored-At"))
      const ttl = Number(cached.headers.get("X-Edge-Ttl"))
      const swr = Number(cached.headers.get("X-Edge-Swr"))
      const ageSeconds = (Date.now() - storedAt) / 1000
      if (Number.isFinite(ageSeconds) && ageSeconds >= 0) {
        if (ageSeconds < ttl) {
          return forBrowser(cached, "HIT")
        }
        if (ageSeconds < ttl + swr) {
          // 古いものを返して裏で作り直す
          ctx.waitUntil(renderAndStore().catch(() => undefined))
          return forBrowser(cached, "STALE")
        }
      }
    }

    // この拠点にないときは全拠点共通の KV を見る
    if (kv && !wantsFresh(ctx.request)) {
      const shared = await readShared(kv, sharedKey).catch(() => null)
      sharedStoredAt = shared?.meta.s ?? null
      if (shared) {
        const ageSeconds = (Date.now() - shared.meta.s) / 1000
        if (ageSeconds >= 0 && ageSeconds < shared.meta.t + shared.meta.w) {
          if (shared.extra !== undefined) sharedExtra?.restore(shared.extra)
          const response = new Response(shared.body, {
            status: 200,
            headers: shared.headers,
          })
          ctx.waitUntil(
            store(
              cacheKey,
              response.clone(),
              { ttl: shared.meta.t, swr: shared.meta.w },
              shared.meta.s,
            ).catch(() => undefined),
          )
          if (ageSeconds >= shared.meta.t) {
            ctx.waitUntil(renderAndStore().catch(() => undefined))
            return forBrowser(response, "SHARED-STALE")
          }
          return forBrowser(response, "SHARED")
        }
      }
    }

    const { response, stored } = await renderAndStore()
    return stored ? forBrowser(response, "MISS") : response
  }

  return { handle }
}
