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
const NIGHT_ENDPOINT_KEY = "gpu:night-endpoint"
const FREE_ENDPOINT_KEY = "gpu:free-endpoint"
const EXTRA_ENDPOINT_CACHE_MS = 60_000

let extraEndpointCache: {
  night: string | null
  free: string | null
  at: number
} | null = null

/**
 * 常設の一覧に KV の行き先を反映する。
 * 無料用の GPU の置き換え先は、先頭（無料用の 1 台、生成ワーカーの instance 0）と入れ替える。
 * 置き換えたあと元の GPU は止めるので、足すと止まった 1 台を数えて「一部停止中」になっていた
 */
export function mergeSdEndpoints(
  endpoints: string[],
  extra: { night: string | null; free: string | null },
): string[] {
  const merged = [...endpoints]
  if (extra.free !== null && !merged.includes(extra.free)) {
    if (merged.length > 0) {
      merged[0] = extra.free
    } else {
      merged.push(extra.free)
    }
  }
  if (extra.night !== null && !merged.includes(extra.night)) {
    merged.push(extra.night)
  }
  return merged
}

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
      const [night, free] = await Promise.all(
        [NIGHT_ENDPOINT_KEY, FREE_ENDPOINT_KEY].map(async (key) => {
          const url = (await kv?.get(key)) ?? null
          return url === null ? null : url.trim().replace(/\/+$/, "") || null
        }),
      )
      extraEndpointCache = { night, free, at: Date.now() }
    }
  } catch {
    return endpoints
  }
  return mergeSdEndpoints(endpoints, extraEndpointCache)
}
