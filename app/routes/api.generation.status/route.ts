import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { getServerEnvValue } from "~/lib/server/env.server"
import { getSdEndpoints } from "~/lib/server/sd-endpoints.server"

/**
 * 画像生成サーバーの稼働状況（生成画面の「混雑状況」用）
 * GET /api/generation/status → { data: { total, working, normalWaiting, priorityWaiting, checkedAt } }
 *
 * 各 GPU サーバーの生成 API（/sdapi/v1/progress）に聞いて、応答したものを「稼働中」とする。
 * /internal/ping だけだと、生成 API が組み込まれず 404 の状態でも稼働中に見えるため。
 * 結果はエッジに 20 秒キャッシュする（閲覧者ごとに GPU へ問い合わせない）。
 */

const CACHE_SECONDS = 20
const CACHE_KEY = "https://www.aipictors.com/__cache/generation-status-v1"

type StatusData = {
  /** GPU サーバーの台数 */
  total: number
  /** 生成できる状態の台数 */
  working: number
  /** 順番待ちの件数（通常 / 優先）。取れなければ null */
  normalWaiting: number | null
  priorityWaiting: number | null
  checkedAt: string
}

const ENGINE_STATUS_QUERY =
  "{ imageGenerationEngineStatus { normalTasksCount standardTasksCount } }"

const fetchWaitingCounts = async (context: unknown) => {
  const endpoint =
    getServerEnvValue(context, "VITE_GRAPHQL_ENDPOINT_REMIX") ??
    "https://api.aipictors.com/"
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://www.aipictors.com",
      },
      body: JSON.stringify({ query: ENGINE_STATUS_QUERY }),
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return null
    const body = (await response.json()) as {
      data?: {
        imageGenerationEngineStatus?: {
          normalTasksCount?: number
          standardTasksCount?: number
        } | null
      }
    }
    return body.data?.imageGenerationEngineStatus ?? null
  } catch {
    return null
  }
}

const json = (body: unknown, cacheSeconds: number) =>
  new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      "cache-control":
        cacheSeconds > 0
          ? `public, max-age=0, s-maxage=${cacheSeconds}`
          : "no-store",
    },
  })

const isWorking = async (endpoint: string) => {
  try {
    const response = await fetch(
      `${endpoint}/sdapi/v1/progress?skip_current_image=true`,
      { signal: AbortSignal.timeout(4000) },
    )
    return response.ok
  } catch {
    return false
  }
}

const getEdgeCache = (): Cache | null => {
  const storage = (globalThis as { caches?: CacheStorage & { default?: Cache } })
    .caches
  return storage?.default ?? null
}

export async function loader({ context }: LoaderFunctionArgs) {
  const cache = getEdgeCache()
  const cached = await cache?.match(CACHE_KEY).catch(() => undefined)
  if (cached) return cached

  const endpoints = getSdEndpoints(context)
  const [results, waiting] = await Promise.all([
    Promise.all(endpoints.map(isWorking)),
    fetchWaitingCounts(context),
  ])
  const data: StatusData = {
    total: endpoints.length,
    working: results.filter(Boolean).length,
    normalWaiting: waiting?.normalTasksCount ?? null,
    priorityWaiting: waiting?.standardTasksCount ?? null,
    checkedAt: new Date().toISOString(),
  }
  const response = json({ error: null, data }, CACHE_SECONDS)
  await cache?.put(CACHE_KEY, response.clone()).catch(() => undefined)
  return response
}
