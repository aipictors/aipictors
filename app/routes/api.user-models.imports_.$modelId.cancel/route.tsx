import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import {
  callUserModelsApi,
  resolveUserModelsProxy,
  toUserModelsJsonResponse,
} from "~/lib/server/user-models.server"

export async function loader(_props: LoaderFunctionArgs) {
  return toUserModelsJsonResponse(
    { error: "Method not allowed", data: null },
    405,
  )
}

/**
 * URL からの取り込みを中止する（作者のみ）
 */
export async function action({ request, context, params }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toUserModelsJsonResponse(
      { error: "Method not allowed", data: null },
      405,
    )
  }

  const modelId = params.modelId ?? ""
  if (!/^[0-9a-z]{12}$/.test(modelId)) {
    return toUserModelsJsonResponse({ error: "Not found", data: null }, 404)
  }

  const resolved = await resolveUserModelsProxy({
    request,
    context,
    requireViewer: true,
  })
  if (!resolved.ok) {
    return resolved.response
  }

  const viewer = resolved.value.viewer
  if (!viewer) {
    return toUserModelsJsonResponse(
      { error: "ログインが必要です", data: null },
      401,
    )
  }

  return callUserModelsApi({
    proxy: resolved.value,
    path: `/internal/user-models/imports/${modelId}/cancel`,
    method: "POST",
    json: { userId: viewer.userId },
    fallbackError: "取り込みの中止に失敗しました",
  })
}
