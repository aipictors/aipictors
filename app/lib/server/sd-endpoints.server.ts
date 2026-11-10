import { getServerEnvValue } from "~/lib/server/env.server"

/**
 * 画像生成の GPU サーバー（RunPod の reForge）
 * 環境変数 SD_PROGRESS_ENDPOINTS（カンマ区切り）があればそちらを使う
 */
const DEFAULT_ENDPOINTS = [
  "https://8qohsj3lbw0fj4-8000.proxy.runpod.net",
  "https://1ggt33c8h6hzdv-8000.proxy.runpod.net",
]

export function getSdEndpoints(context: unknown): string[] {
  return (
    getServerEnvValue(context, "SD_PROGRESS_ENDPOINTS")
      ?.split(",")
      .map((value) => value.trim().replace(/\/+$/, ""))
      .filter(Boolean) ?? DEFAULT_ENDPOINTS
  ).slice(0, 8)
}

const NIGHT_ENDPOINT_KEY = "gpu:night-endpoint"
const NIGHT_ENDPOINT_CACHE_MS = 60_000

let nightEndpointCache: { url: string | null; at: number } | null = null

type KvLike = { get(key: string): Promise<string | null> }

/**
 * 夜だけ動く GPU を含めた一覧（cron-gpu-night が KV に書く）。読めなければ常設の分だけ返す
 */
export async function getActiveSdEndpoints(context: unknown): Promise<string[]> {
  const endpoints = getSdEndpoints(context)
  try {
    if (
      nightEndpointCache === null ||
      Date.now() - nightEndpointCache.at > NIGHT_ENDPOINT_CACHE_MS
    ) {
      const kv = (context as { cloudflare?: { env?: { PAGE_CACHE?: KvLike } } })
        ?.cloudflare?.env?.PAGE_CACHE
      nightEndpointCache = {
        url: (await kv?.get(NIGHT_ENDPOINT_KEY)) ?? null,
        at: Date.now(),
      }
    }
  } catch {
    return endpoints
  }
  const url = nightEndpointCache.url
  return url && !endpoints.includes(url) ? [...endpoints, url] : endpoints
}
