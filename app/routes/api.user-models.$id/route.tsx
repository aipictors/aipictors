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

const editableKeys = [
  "name",
  "description",
  "triggerWords",
  "recommendedWeight",
  "baseModel",
  "rating",
  "tags",
  "thumbnailUrl",
  "sampleImageUrls",
] as const

function isValidId(id: string | undefined): id is string {
  return typeof id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(id)
}

/**
 * モデル詳細（未ログインでも取得可。ログイン時は作者判定のため viewerUserId を付与）
 */
export async function loader({ request, context, params }: LoaderFunctionArgs) {
  if (!isValidId(params.id)) {
    return toUserModelsJsonResponse({ error: "Not found", data: null }, 404)
  }

  const resolved = await resolveUserModelsProxy({
    request,
    context,
    requireViewer: false,
  })
  if (!resolved.ok) {
    return resolved.response
  }

  const query = resolved.value.viewer
    ? `?viewerUserId=${encodeURIComponent(resolved.value.viewer.userId)}`
    : ""

  return callUserModelsApi({
    proxy: resolved.value,
    path: `/internal/user-models/${params.id}${query}`,
    method: "GET",
    fallbackError: "モデルの取得に失敗しました",
  })
}

/**
 * PATCH: 編集（作者のみ） / DELETE: 削除（作者のみ・論理削除）
 */
export async function action({ request, context, params }: ActionFunctionArgs) {
  if (!isValidId(params.id)) {
    return toUserModelsJsonResponse({ error: "Not found", data: null }, 404)
  }

  if (request.method !== "PATCH" && request.method !== "DELETE") {
    return toUserModelsJsonResponse(
      { error: "Method not allowed", data: null },
      405,
    )
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

  if (request.method === "DELETE") {
    return callUserModelsApi({
      proxy: resolved.value,
      path: `/internal/user-models/${params.id}?userId=${encodeURIComponent(viewer.userId)}`,
      method: "DELETE",
      fallbackError: "モデルの削除に失敗しました",
    })
  }

  const body = await readJsonBodyWithUserId(request, viewer.userId)
  if (body === null) {
    return toUserModelsJsonResponse({ error: "Invalid JSON", data: null }, 400)
  }

  const patch: Record<string, unknown> = { userId: viewer.userId }
  for (const key of editableKeys) {
    if (key in body) {
      patch[key] = body[key]
    }
  }

  return callUserModelsApi({
    proxy: resolved.value,
    path: `/internal/user-models/${params.id}`,
    method: "PATCH",
    json: patch,
    fallbackError: "モデルの更新に失敗しました",
  })
}
