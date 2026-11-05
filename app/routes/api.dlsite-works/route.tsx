import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { toDlsiteWorks } from "~/utils/dlsite-affiliate"

const RANKING_URL = "https://www.dlsite.com/aix/api/=/ranking.json"
const CACHE_SECONDS = 3600

/**
 * R18 作品ページの DLsite 枠に出す作品（AI 生成フロアのランキング）
 * 元の JSON は 200KB を超えるので、表示に使う項目だけにして 1 時間キャッシュする
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const cache = typeof caches === "undefined" ? null : caches.default
  const cacheKey = new Request(new URL("/api/dlsite-works", request.url))
  const cached = await cache?.match(cacheKey).catch(() => undefined)
  if (cached) return cached

  let works: ReturnType<typeof toDlsiteWorks> = []
  try {
    const response = await fetch(RANKING_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Aipictors)" },
    })
    if (response.ok) works = toDlsiteWorks(await response.json())
  } catch {
    // 取れなければ画像なしの枠になるだけ
  }

  const body = new Response(JSON.stringify({ works }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${works.length > 0 ? CACHE_SECONDS : 60}`,
    },
  })
  if (cache && works.length > 0) {
    await cache.put(cacheKey, body.clone()).catch(() => {})
  }
  return body
}
