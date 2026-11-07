import { config } from "~/config"

/**
 * センシティブな作品（画像の自動判定で、リアルな作風で子どもに見える人物の際どい表現の疑いとしたもの）を
 * 一覧や作品ページでぼかすかどうか。既定はぼかす。
 *
 * サーバーでも同じ状態で描画できるよう cookie に保存する（表示後にぼかしが外れたり付いたりしないように）。
 * ページのキャッシュもこの値ごとに分ける（app/lib/edge-page-cache.ts）
 */
export const SENSITIVE_BLUR_COOKIE = "aip_blur"

export const parseSensitiveBlur = (cookie: string | null | undefined) =>
  !/(?:^|;\s*)aip_blur=off(?:;|$)/.test(cookie ?? "")

export const getSensitiveBlur = (request: Request) =>
  parseSensitiveBlur(request.headers.get("cookie"))

/** HTML に入れる件数の上限（新しいものから） */
const MAX_IDS = 1000

const CACHE_TTL_MS = 60 * 1000

let cache: { expiresAt: number; ids: Promise<string[]> } | null = null

/**
 * ぼかす作品の ID。最初の描画からぼかせるよう、サーバーで取って root の loader で渡す。
 * 件数は少なく、変わるのもゆっくりなので 1 分ほど覚えておく（取れなくてもページは出す）
 */
export const fetchSensitiveWorkIds = (): Promise<string[]> => {
  const now = Date.now()
  if (cache !== null && cache.expiresAt > now) return cache.ids
  const ids = fetch(config.graphql.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "{ sensitiveWorkIds }" }),
    signal: AbortSignal.timeout(1500),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((body: { data?: { sensitiveWorkIds?: string[] } } | null) =>
      (body?.data?.sensitiveWorkIds ?? []).slice(0, MAX_IDS),
    )
    .catch(() => {
      cache = null
      return [] as string[]
    })
  cache = { expiresAt: now + CACHE_TTL_MS, ids }
  return ids
}
