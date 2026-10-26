import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import {
  callUserModelsApi,
  resolveUserModelsProxy,
  toUserModelsJsonResponse,
} from "~/lib/server/user-models.server"

const allowedParams = [
  "kind",
  "q",
  "baseModel",
  "sort",
  "ratings",
  "offset",
  "limit",
] as const

/**
 * みんなのモデル一覧（未ログインでも取得可）
 * GET /api/user-models?kind=&q=&baseModel=&sort=popular|new&ratings=G,R15&offset=&limit=
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

  const url = new URL(request.url)
  const params = new URLSearchParams()
  for (const key of allowedParams) {
    const value = url.searchParams.get(key)
    if (value !== null && value !== "") {
      params.set(key, value)
    }
  }

  const limit = Number(params.get("limit") ?? "24")
  params.set(
    "limit",
    String(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 60) : 24),
  )

  return callUserModelsApi({
    proxy: resolved.value,
    path: `/internal/user-models?${params.toString()}`,
    method: "GET",
    fallbackError: "モデル一覧の取得に失敗しました",
  })
}

export async function action(_props: ActionFunctionArgs) {
  return toUserModelsJsonResponse(
    { error: "Method not allowed", data: null },
    405,
  )
}
