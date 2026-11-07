import { config } from "~/config"

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
