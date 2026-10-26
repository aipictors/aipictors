import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import {
  callUserModelsApi,
  resolveUserModelsProxy,
  toUserModelsJsonResponse,
} from "~/lib/server/user-models.server"

const reportReasons = [
  "COPYRIGHT",
  "REAL_PERSON",
  "ILLEGAL",
  "WRONG_RATING",
  "BROKEN",
  "SPAM",
  "OTHER",
] as const

export async function loader(_props: LoaderFunctionArgs) {
  return toUserModelsJsonResponse(
    { error: "Method not allowed", data: null },
    405,
  )
}

/**
 * モデルの通報（ログイン必須。自分のモデルは API 側で 400）
 */
export async function action({ request, context, params }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toUserModelsJsonResponse(
      { error: "Method not allowed", data: null },
      405,
    )
  }

  const id = params.id ?? ""
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
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

  const body = await (async () => {
    try {
      return (await request.json()) as Record<string, unknown> | null
    } catch {
      return null
    }
  })()

  const reason = body?.reason
  if (
    typeof reason !== "string" ||
    !(reportReasons as readonly string[]).includes(reason)
  ) {
    return toUserModelsJsonResponse(
      { error: "通報の理由を選んでください", data: null },
      400,
    )
  }

  const detail =
    typeof body?.detail === "string" ? body.detail.trim().slice(0, 1000) : ""

  return callUserModelsApi({
    proxy: resolved.value,
    path: `/internal/user-models/${id}/report`,
    method: "POST",
    json: {
      userId: viewer.userId,
      reason,
      ...(detail ? { detail } : {}),
    },
    fallbackError: "通報に失敗しました",
  })
}
