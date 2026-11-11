import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import {
  callUserModelsApi,
  resolveUserModelsProxy,
} from "~/lib/server/user-models.server"

/**
 * 今週のピックアップモデル（未ログインでも取得可。週に 1 回しか変わらないので 5 分キャッシュ）
 * GET /api/user-models/pickup
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const resolved = await resolveUserModelsProxy({
    request,
    context,
    requireViewer: false,
  })
  if (!resolved.ok) {
    return resolved.response
  }

  const response = await callUserModelsApi({
    proxy: resolved.value,
    path: "/internal/user-model-pickups",
    method: "GET",
    fallbackError: "ピックアップモデルの取得に失敗しました",
  })
  if (!response.ok) {
    return response
  }
  const headers = new Headers(response.headers)
  headers.set(
    "Cache-Control",
    "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
  )
  return new Response(response.body, { status: response.status, headers })
}
