import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import {
  callUserModelsApi,
  readJsonBodyWithUserId,
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
 * アップロード完了 { parts: [{ partNumber, etag }] }
 */
export async function action({ request, context, params }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toUserModelsJsonResponse(
      { error: "Method not allowed", data: null },
      405,
    )
  }

  const modelId = params.modelId ?? ""
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(modelId)) {
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

  const body = await readJsonBodyWithUserId(request, viewer.userId)
  if (body === null || !Array.isArray(body.parts)) {
    return toUserModelsJsonResponse(
      { error: "parts が必要です", data: null },
      400,
    )
  }

  return callUserModelsApi({
    proxy: resolved.value,
    path: `/internal/user-models/uploads/${modelId}/complete`,
    method: "POST",
    json: { userId: viewer.userId, parts: body.parts },
    fallbackError: "アップロードの完了処理に失敗しました",
  })
}
