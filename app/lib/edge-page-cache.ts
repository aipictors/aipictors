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

import { isbot } from "isbot"
import { getGridLayout } from "~/utils/grid-layout"
import { getLayoutHint } from "~/utils/layout-hint"
import { toLocaleFromAcceptLanguage } from "~/utils/locale-path"

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
type SharedExtra = {
  /** 描画し終えたあとに、一緒に置く内容を返す */
  get: () => string | undefined
  /** KV から返すときに、その拠点に戻す */
  restore: (value: string) => void
}

/**
 * 全拠点共通の KV にも置くページ。KV は書き込みが有料なので、数の限られた一覧（検索条件なし）だけにする
 */
const SHARED_PAGE_PATH =
  /^\/(?:(?:ja|en)\/?)?(?:r\/?)?(?:$|home\/?$|rankings(?:\/[\w-]+)*\/?$|themes(?:\/[\w-]+)*\/?$|tags\/?$|novels\/?$|notes\/?$|posts(?:\/(?:2d|2\.5d|3d|novel|column|video))?\/?$)/

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
  /^\/(?:en\/)?(?:r\/?)?(?:$|home$|rankings|ai-rankings|posts\/(?:2d|2\.5d|3d|novel|column|video)|tags|themes|albums|events|models|search|users\/[^/]+$|posts\/\d+$)/

const DEFAULT_DATA_TTL_SECONDS = 30

/** Cloudflare の Transform Rules が付ける、ページの見分けに使うヘッダー（services/edge-snippets/README.md） */
const EDGE_LOCALE_HEADER = "x-aip-locale"
const EDGE_LAYOUT_HEADER = "x-aip-layout"
const EDGE_GRID_HEADER = "x-aip-grid"
const EDGE_VARY_HEADERS = `${EDGE_LOCALE_HEADER}, ${EDGE_LAYOUT_HEADER}, ${EDGE_GRID_HEADER}, x-aip-fresh`

/** 配信のキャッシュで古いものを返す上限（秒） */
const MAX_EDGE_SWR_SECONDS = 60 * 60 * 24

const WORK_PAGE_PATH = /^\/(?:(?:ja|en)\/)?(?:r\/)?posts\/(\d+)\/?$/
const DEFAULT_SWR_SECONDS = 300

/**
 * 古いものを返して裏で作り直す期間の下限。
 * キャッシュは拠点ごとなので、アクセスの少ない拠点（海外や検索エンジン・計測ツール）では
 * 数分で切れてしまい、そのたびに API から作り直して 2〜3 秒かかっていた。
 * 古いものを返すのはその拠点で久しぶりの 1 回だけで、直後に作り直す
 */
const MIN_SWR_SECONDS = 60 * 60 * 6

/**
 * ページを作れなかったとき（DB の過負荷など）に、エラーの代わりに返すため古いものを残しておく期間
 */
const STALE_IF_ERROR_SECONDS = 60 * 60 * 24 * 7

/**
 * クローラーに古いページを返してよい期間。ページ取得の大半はクローラーで、1 回の描画で D1 に十数本投げるので、
 * 手元にあるものは作り直さずに返す
 */
const BOT_MAX_STALE_SECONDS = 60 * 60 * 24 * 14

export const canServeStaleToBot = (ageSeconds: number) =>
  ageSeconds >= 0 && ageSeconds < BOT_MAX_STALE_SECONDS

/**
 * 新着一覧は古い並びが目立つので、古いものを返す期間を短くする
 */
const LATEST_PAGE_PATH = /^\/(?:en\/)?(?:r\/)?new-works\/?$/
const LATEST_PAGE_SWR_SECONDS = 60 * 10

export const getSwrSeconds = (pathname: string, swr: number | null) => {
  if (LATEST_PAGE_PATH.test(pathname)) {
    return Math.min(swr ?? DEFAULT_SWR_SECONDS, LATEST_PAGE_SWR_SECONDS)
  }
  return Math.max(swr ?? DEFAULT_SWR_SECONDS, MIN_SWR_SECONDS)
}

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
  return toLocaleFromAcceptLanguage(request.headers.get("accept-language"))
}

/** ページの見分けをしない応答を、配信のキャッシュに保存させない（ページの Cache-Control に s-maxage があるため） */
export const withoutSharedCache = (response: Response, url?: URL) => {
  // API やサイトマップは見分けがいらないので、そのまま保存してよい
  if (
    (url && /^\/(?:api|sitemap)/.test(url.pathname)) ||
    !response.headers.get("Cache-Control")?.includes("s-maxage")
  ) {
    return response
  }
  const uncached = new Response(response.body, response)
  uncached.headers.set("Cache-Control", "private, no-store")
  return uncached
}

export const createEdgePageCache = (version: string) => {
  const isCacheableRequest = (request: Request, url: URL) => {
    if (request.method !== "GET") return false
    if (request.headers.get("authorization")) return false
    if (EXCLUDED_PATH.test(url.pathname)) return false
    // 日本語を選んだ人が英語の URL を開いたときは日本語へ転送する（保存済みの英語を返さない）
    if (
      /^\/en(?:\/|$)/.test(url.pathname) &&
      /(?:^|;\s*)locale=ja(?:;|$)/.test(request.headers.get("cookie") ?? "")
    ) {
      return false
    }
    // 画像やファイル（拡張子つき）は対象外
    if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) return false
    const isData = url.searchParams.has("_data")
    if (!isData) {
      // クローラーは Accept がない・*/* のことが多い（同じ HTML を返すので共有する）
      const accept = request.headers.get("accept")
      if (accept && !/text\/html|\*\/\*/.test(accept)) return false
    }
    return true
  }

  const toCacheKey = (request: Request, url: URL) => {
    const key = new URL(url.toString())
    key.hostname = "www.aipictors.com"
    key.protocol = "https:"
    // 端末の種類で描画する一覧が違う（app/utils/layout-hint.ts）
    // サムネイルの並べ方（cookie）でも描画が違う（app/utils/grid-layout.ts）
    key.pathname = `/__edge/${version}/${getLocale(request)}/${getLayoutHint(request)}/${getGridLayout(request)}${url.pathname}`
    key.searchParams.sort()
    return new Request(key.toString(), { method: "GET" })
  }

  /**
   * クローラー向けの控え。デプロイでキャッシュのキーが変わっても残るよう版を含めない
   * （デプロイの直後にクローラーの分まで全部作り直すと D1 の負荷の山になる）
   */
  const toBotFallbackKey = (cacheKey: Request) =>
    new Request(cacheKey.url.replace(`/__edge/${version}/`, "/__edge-bot/"), {
      method: "GET",
    })

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
        swr: getSwrSeconds(url.pathname, cc.swr),
      }
    }
    if (
      url.searchParams.has("_data") &&
      !response.headers.get("Cache-Control") &&
      PUBLIC_DATA_PATH.test(url.pathname)
    ) {
      return {
        ttl: DEFAULT_DATA_TTL_SECONDS,
        swr: getSwrSeconds(url.pathname, null),
      }
    }
    return null
  }

  /**
   * 配信のキャッシュ（Workers のキャッシュ）に保存してよいか。
   * 端末・言語などの見分けに使うヘッダーがこのページの描画と一致するときだけ保存する
   */
  const canShareAcrossEdge = (request: Request) =>
    !wantsFresh(request) &&
    request.headers.get(EDGE_LOCALE_HEADER) === getLocale(request) &&
    request.headers.get(EDGE_LAYOUT_HEADER) === getLayoutHint(request) &&
    request.headers.get(EDGE_GRID_HEADER) === getGridLayout(request)

  /**
   * ブラウザには保存させない（新しい内容をすぐ見られるように）。
   * 配信のキャッシュには CDN-Cache-Control で保存し、次からは Worker を動かさない
   */
  const forBrowser = (
    request: Request,
    url: URL,
    response: Response,
    state: string,
    ttl?: { ttl: number; swr: number } | null,
  ) => {
    const headers = new Headers(response.headers)
    const storedAt = Number(headers.get("X-Edge-Stored-At"))
    const edgeTtl =
      ttl ??
      (headers.has("X-Edge-Ttl")
        ? {
            ttl: Number(headers.get("X-Edge-Ttl")),
            swr: Number(headers.get("X-Edge-Swr")),
          }
        : null)
    headers.set("Cache-Control", "public, max-age=0, must-revalidate")
    headers.set("X-Edge-Cache", state)
    headers.set("Vary", EDGE_VARY_HEADERS)
    headers.delete("X-Edge-Stored-At")
    headers.delete("X-Edge-Ttl")
    headers.delete("X-Edge-Swr")
    const remaining = edgeTtl
      ? Math.floor(
          edgeTtl.ttl - (storedAt ? (Date.now() - storedAt) / 1000 : 0),
        )
      : 0
    if (edgeTtl && remaining > 0 && canShareAcrossEdge(request)) {
      headers.set(
        "CDN-Cache-Control",
        `public, max-age=${remaining}, stale-while-revalidate=${Math.min(edgeTtl.swr, MAX_EDGE_SWR_SECONDS)}`,
      )
      const workId = url.pathname.match(WORK_PAGE_PATH)?.[1]
      if (workId) headers.set("Cache-Tag", `work-${workId}`)
    } else {
      // 配信のキャッシュの同じ URL を上書きしない
      headers.set("Cache-Control", "private, no-store")
    }
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
    headers.set(
      "Cache-Control",
      `public, max-age=${Math.max(ttl.ttl + ttl.swr, STALE_IF_ERROR_SECONDS)}`,
    )
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
    return {
      meta,
      headers: head.h,
      extra: head.x,
      body: value.slice(newline + 1),
    }
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
      if (!SHARED_SKIP_HEADERS.has(name.toLowerCase()))
        headers.push([name, value])
    })
    const metadata: SharedMetadata = {
      s: Date.now(),
      t: ttl.ttl,
      w: ttl.swr,
      v: 1,
    }
    await kv.put(
      key,
      `${JSON.stringify({ h: headers, x: extra?.get() })}\n${body}`,
      {
        expirationTtl: Math.max(ttl.ttl + ttl.swr, STALE_IF_ERROR_SECONDS),
        metadata,
      },
    )
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
      return withoutSharedCache(await render(), url)
    }
    const cacheKey = toCacheKey(ctx.request, url)
    const isBot = isbot(ctx.request.headers.get("user-agent"))
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
      if (isBot) {
        ctx.waitUntil(
          store(toBotFallbackKey(cacheKey), response.clone(), ttl).catch(
            () => undefined,
          ),
        )
      }
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

    /** ページを作れなかったときに代わりに返す、期限切れのもの */
    let staleIfError: (() => Response) | null = null

    if (cached) {
      const storedAt = Number(cached.headers.get("X-Edge-Stored-At"))
      const ttl = Number(cached.headers.get("X-Edge-Ttl"))
      const swr = Number(cached.headers.get("X-Edge-Swr"))
      const ageSeconds = (Date.now() - storedAt) / 1000
      if (Number.isFinite(ageSeconds) && ageSeconds >= 0) {
        if (ageSeconds < ttl) {
          return forBrowser(ctx.request, url, cached, "HIT")
        }
        if (ageSeconds < ttl + swr) {
          // 古いものを返して裏で作り直す（クローラーのためには作り直さない。
          // ページ取得の 9 割はクローラーで、1 回の描画で D1 に 17 文ほど投げる）
          if (!isBot) {
            ctx.waitUntil(renderAndStore().catch(() => undefined))
          }
          return forBrowser(ctx.request, url, cached, "STALE")
        }
        if (isBot && canServeStaleToBot(ageSeconds)) {
          return forBrowser(ctx.request, url, cached, "BOT-STALE")
        }
        staleIfError = () => forBrowser(ctx.request, url, cached as Response, "STALE-IF-ERROR")
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
            return forBrowser(ctx.request, url, response, "SHARED-STALE")
          }
          return forBrowser(ctx.request, url, response, "SHARED", { ttl: shared.meta.t - ageSeconds, swr: shared.meta.w })
        }
        if (ageSeconds >= 0 && staleIfError === null) {
          staleIfError = () => {
            if (shared.extra !== undefined) sharedExtra?.restore(shared.extra)
            return forBrowser(
              ctx.request,
              url,
              new Response(shared.body, {
                status: 200,
                headers: shared.headers,
              }),
              "STALE-IF-ERROR",
            )
          }
        }
      }
    }

    if (isBot && !wantsFresh(ctx.request)) {
      const fallback = await caches.default
        .match(toBotFallbackKey(cacheKey))
        .catch(() => undefined)
      const ageSeconds =
        (Date.now() - Number(fallback?.headers.get("X-Edge-Stored-At"))) / 1000
      if (fallback && canServeStaleToBot(ageSeconds)) {
        return forBrowser(ctx.request, url, fallback, "BOT-FALLBACK")
      }
    }

    const { response, stored } = await renderAndStore()
    if (response.status >= 500 && staleIfError) {
      return staleIfError()
    }
    return stored
      ? forBrowser(ctx.request, url, response, "MISS", getTtl(url, response))
      : withoutSharedCache(response, url)
  }

  return { handle }
}
