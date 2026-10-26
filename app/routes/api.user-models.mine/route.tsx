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
 * 自分のモデル一覧と登録上限
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
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
    path: `/internal/user-models/mine/${encodeURIComponent(viewer.userId)}`,
    method: "GET",
    fallbackError: "自分のモデルの取得に失敗しました",
  })
}

export async function action(_props: ActionFunctionArgs) {
  return toUserModelsJsonResponse(
    { error: "Method not allowed", data: null },
    405,
  )
}
