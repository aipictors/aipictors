/**
 * 公開用コイン支援ランキング API プロキシ
 * GET /api/coins/support/rankings/public
 *
 * Firebase 認証不要 — ホームページなど非ログイン画面からも利用可。
 * バックエンドへの接続にはサーバー内部トークンのみ使用。
 */
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { enrichSupportRankingItems } from "~/lib/server/support-ranking-enrichment.server"
import { getServerEnvValue } from "~/lib/server/env.server"

const PUBLIC_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=120"

/** 拠点のキャッシュに置く時間（秒） */
const EDGE_CACHE_SECONDS = 300

function toJsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": PUBLIC_CACHE_CONTROL,
    },
  })
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  if (request.method !== "GET") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }

  const apiBaseUrl =
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  const internalToken = getServerEnvValue(
    context,
    "AIPICTORS_API_INTERNAL_TOKEN",
  )
  const cfId = getServerEnvValue(context, "AIPICTORS_API_CF_ACCESS_CLIENT_ID")
  const cfSecret = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_SECRET",
  )

  if (!internalToken) {
    return toJsonResponse(
      { error: "AIPICTORS_API_INTERNAL_TOKEN is not configured", data: null },
      500,
    )
  }

  const url = new URL(request.url)
  const query = url.search ? url.search : ""

  // ホームを開くたびに 1 人ずつ GraphQL で名前を引いていたので、週間の順位は拠点ごとに使い回す
  const cache =
    typeof caches === "undefined" || url.searchParams.has("recipientUserId")
      ? null
      : caches.default
  const cacheKey = new Request(url.toString())
  const cached = await cache?.match(cacheKey).catch(() => undefined)
  if (cached) {
    const hit = new Response(cached.body, cached)
    hit.headers.set("cache-control", PUBLIC_CACHE_CONTROL)
    return hit
  }

  const apiResponse = await fetch(
    `${apiBaseUrl}/internal/coins/support/rankings${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${internalToken}`,
        "Content-Type": "application/json",
        ...(cfId && cfSecret
          ? { "CF-Access-Client-Id": cfId, "CF-Access-Client-Secret": cfSecret }
          : {}),
      },
    },
  )

  const apiJson = (await apiResponse.json()) as {
    error: string | null
    data?: unknown
  }

  if (!apiResponse.ok || apiJson.error || !apiJson.data) {
    return toJsonResponse(
      {
        error: apiJson.error ?? "Failed to fetch support rankings",
        data: null,
      },
      502,
    )
  }

  const data = apiJson.data as {
    items?: unknown[]
  }

  const response = toJsonResponse(
    {
      error: null,
      data: {
        ...data,
        items: await enrichSupportRankingItems(
          Array.isArray(data.items) ? (data.items as never[]) : [],
        ),
      },
    },
    200,
  )
  // 特定の人を推した一覧は、推した直後に反映されるようにブラウザにも残さない
  if (url.searchParams.has("recipientUserId")) {
    response.headers.set("cache-control", "no-store")
  }
  if (cache) {
    const stored = response.clone()
    stored.headers.set("cache-control", `public, max-age=${EDGE_CACHE_SECONDS}`)
    await cache.put(cacheKey, stored).catch(() => {})
  }
  return response
}
