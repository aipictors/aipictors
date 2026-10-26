import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import {
  callUserModelsApi,
  resolveUserModelsProxy,
  toUserModelsJsonResponse,
} from "~/lib/server/user-models.server"

/**
 * URL からの取り込みの進み具合（作者のみ）
 */
export async function loader({ request, context, params }: LoaderFunctionArgs) {
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
    path: `/internal/user-models/imports/${modelId}?userId=${encodeURIComponent(viewer.userId)}`,
    method: "GET",
    fallbackError: "取り込みの状態を取得できませんでした",
  })
}

export async function action(_props: ActionFunctionArgs) {
  return toUserModelsJsonResponse(
    { error: "Method not allowed", data: null },
    405,
  )
}
