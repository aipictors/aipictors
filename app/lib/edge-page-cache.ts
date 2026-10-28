/**
 * ページとページのデータ（Remix の ?_data）を Cloudflare の拠点ごとに短時間キャッシュする。
 *
 * サーバー側の描画はログイン状態に依存しない（loader は認証なしで API を呼ぶ）ので、
 * URL と表示言語ごとに同じ結果を使い回せる。キャッシュできれば API・DB へは問い合わせない。
 * - 保存時間は各ページの Cache-Control の s-maxage（なければキャッシュしない。一部の一覧のデータは既定 30 秒）
 * - 期限切れでも stale-while-revalidate の間は古いものを返し、裏で作り直す
 * - デプロイごとにキーを変える（古い HTML が古いファイルを読み込まないように）
 */

import { getLayoutHint } from "~/utils/layout-hint"

type Ctx = {
  request: Request
  waitUntil(promise: Promise<unknown>): void
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
  ) => {
    const headers = new Headers(response.headers)
    headers.set("X-Edge-Stored-At", String(Date.now()))
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
   * キャッシュを使ってページを返す。render はキャッシュがないときに実際に作る処理
   */
  const handle = async (
    ctx: Ctx,
    render: () => Promise<Response>,
  ): Promise<Response> => {
    const url = new URL(ctx.request.url)
    if (!isCacheableRequest(ctx.request, url)) {
      return render()
    }
    const cacheKey = toCacheKey(ctx.request, url)

    const renderAndStore = async () => {
      const response = await render()
      const ttl = getTtl(url, response)
      if (ttl === null) return { response, stored: false }
      ctx.waitUntil(
        store(cacheKey, response.clone(), ttl).catch(() => undefined),
      )
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

    const { response, stored } = await renderAndStore()
    return stored ? forBrowser(response, "MISS") : response
  }

  return { handle }
}
