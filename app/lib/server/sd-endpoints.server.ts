import { getServerEnvValue } from "~/lib/server/env.server"

/**
 * 画像生成の GPU サーバー（RunPod の reForge）
 * 環境変数 SD_PROGRESS_ENDPOINTS（カンマ区切り）があればそちらを使う
 */
const DEFAULT_ENDPOINTS = [
  "https://8qohsj3lbw0fj4-8000.proxy.runpod.net",
  "https://7w8xshi0txmagl-8000.proxy.runpod.net",
]

export function getSdEndpoints(context: unknown): string[] {
  return (
    getServerEnvValue(context, "SD_PROGRESS_ENDPOINTS")
      ?.split(",")
      .map((value) => value.trim().replace(/\/+$/, ""))
      .filter(Boolean) ?? DEFAULT_ENDPOINTS
  ).slice(0, 8)
}

// cron-gpu-night が KV に書く。夜だけ動く GPU と、無料用の GPU を安いものに置き換えたときの行き先
const EXTRA_ENDPOINT_KEYS = ["gpu:night-endpoint", "gpu:free-endpoint"]
const EXTRA_ENDPOINT_CACHE_MS = 60_000

let extraEndpointCache: { urls: string[]; at: number } | null = null

type KvLike = { get(key: string): Promise<string | null> }

/**
 * 一時的に動いている GPU を含めた一覧。読めなければ常設の分だけ返す
 */
export async function getActiveSdEndpoints(
  context: unknown,
): Promise<string[]> {
  const endpoints = getSdEndpoints(context)
  try {
    if (
      extraEndpointCache === null ||
      Date.now() - extraEndpointCache.at > EXTRA_ENDPOINT_CACHE_MS
    ) {
      const kv = (context as { cloudflare?: { env?: { PAGE_CACHE?: KvLike } } })
        ?.cloudflare?.env?.PAGE_CACHE
      const urls = await Promise.all(
        EXTRA_ENDPOINT_KEYS.map(async (key) => (await kv?.get(key)) ?? null),
      )
      extraEndpointCache = {
        urls: urls.filter((url): url is string => url !== null),
        at: Date.now(),
      }
    }
  } catch {
    return endpoints
  }
  const extra = extraEndpointCache.urls.filter(
    (url) => !endpoints.includes(url),
  )
  return extra.length > 0 ? [...endpoints, ...new Set(extra)] : endpoints
}
