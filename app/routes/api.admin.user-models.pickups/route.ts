/**
 * GET  /api/admin/user-models/pickups   直近の週のピックアップと、今週の候補（点数つき）・X 投稿の下書き
 * POST /api/admin/user-models/pickups   { weekStart, modelId }  差し替え。modelId が null なら自動で選び直す
 *
 * モデレーター専用
 */
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import {
  callUserModelsApi,
  resolveUserModelsProxy,
  toUserModelsJsonResponse,
  type UserModelsProxyContext,
} from "~/lib/server/user-models.server"

type ModeratorResult =
  | { ok: true; proxy: UserModelsProxyContext; viewerId: string }
  | { ok: false; response: Response }

const resolveModerator = async (
  request: Request,
  context: LoaderFunctionArgs["context"],
): Promise<ModeratorResult> => {
  const resolved = await resolveUserModelsProxy({
    request,
    context,
    requireViewer: true,
  })
  if (!resolved.ok) {
    return resolved
  }
  const viewer = resolved.value.viewer
  if (!viewer) {
    return {
      ok: false,
      response: toUserModelsJsonResponse(
        { error: "ログインが必要です", data: null },
        401,
      ),
    }
  }
  if (!viewer.isModerator) {
    return {
      ok: false,
      response: toUserModelsJsonResponse(
        { error: "Forbidden: moderator only", data: null },
        403,
      ),
    }
  }
  return { ok: true, proxy: resolved.value, viewerId: viewer.userId }
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const moderator = await resolveModerator(request, context)
  if (!moderator.ok) {
    return moderator.response
  }
  const weekStart = new URL(request.url).searchParams.get("weekStart")
  const query =
    weekStart && /^\d{4}-\d{2}-\d{2}$/.test(weekStart)
      ? `?weekStart=${weekStart}`
      : ""
  return callUserModelsApi({
    proxy: moderator.proxy,
    path: `/internal/user-model-pickups/admin${query}`,
    method: "GET",
    fallbackError: "ピックアップの取得に失敗しました",
  })
}

export async function action({ request, context }: ActionFunctionArgs) {
  const moderator = await resolveModerator(request, context)
  if (!moderator.ok) {
    return moderator.response
  }
  const body = (await request.json().catch(() => null)) as {
    weekStart?: unknown
    modelId?: unknown
  } | null
  const weekStart =
    typeof body?.weekStart === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(body.weekStart)
      ? body.weekStart
      : null
  if (weekStart === null) {
    return toUserModelsJsonResponse(
      { error: "weekStart を指定してください", data: null },
      400,
    )
  }
  if (typeof body?.modelId === "string" && body.modelId !== "") {
    return callUserModelsApi({
      proxy: moderator.proxy,
      path: `/internal/user-model-pickups/admin/${weekStart}`,
      method: "PUT",
      json: { modelId: body.modelId, decidedBy: moderator.viewerId },
      fallbackError: "ピックアップの差し替えに失敗しました",
    })
  }
  return callUserModelsApi({
    proxy: moderator.proxy,
    path: `/internal/user-model-pickups/admin/${weekStart}/auto`,
    method: "POST",
    fallbackError: "ピックアップの選び直しに失敗しました",
  })
}
