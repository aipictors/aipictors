import { getServerEnvValue } from "~/lib/server/env.server"

/**
 * 画像生成の GPU サーバー（RunPod の reForge）
 * 環境変数 SD_PROGRESS_ENDPOINTS（カンマ区切り）があればそちらを使う
 */
const DEFAULT_ENDPOINTS = [
  "https://cvrtxex5q98ebz-8000.proxy.runpod.net",
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
