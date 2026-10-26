/**
 * GET  /api/admin/user-models?offset&limit  通報されたモデルの一覧
 * POST /api/admin/user-models               { modelId, action: "disable" | "enable", reason? }
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
  | { ok: true; proxy: UserModelsProxyContext }
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

  // モデレーターのみ許可
  if (!viewer.isModerator) {
    return {
      ok: false,
      response: toUserModelsJsonResponse(
        { error: "Forbidden: moderator only", data: null },
        403,
      ),
    }
  }

  return { ok: true, proxy: resolved.value }
}

const toInt = (value: string | null, fallback: number, max: number) => {
  const parsed = Number.parseInt(value ?? "", 10)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback
  }
  return Math.min(parsed, max)
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const moderator = await resolveModerator(request, context)
  if (!moderator.ok) {
    return moderator.response
  }

  const url = new URL(request.url)
  const offset = toInt(url.searchParams.get("offset"), 0, 100000)
  const limit = toInt(url.searchParams.get("limit"), 50, 200)

  return callUserModelsApi({
    proxy: moderator.proxy,
    path: `/internal/user-models/reports?offset=${offset}&limit=${limit}`,
    method: "GET",
    fallbackError: "通報一覧の取得に失敗しました",
  })
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toUserModelsJsonResponse(
      { error: "Method not allowed", data: null },
      405,
    )
  }

  const moderator = await resolveModerator(request, context)
  if (!moderator.ok) {
    return moderator.response
  }

  const body = await (async () => {
    try {
      return (await request.json()) as Record<string, unknown> | null
    } catch {
      return null
    }
  })()

  const modelId = body?.modelId
  if (typeof modelId !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(modelId)) {
    return toUserModelsJsonResponse(
      { error: "Invalid modelId", data: null },
      400,
    )
  }

  if (body?.action === "enable") {
    return callUserModelsApi({
      proxy: moderator.proxy,
      path: `/internal/user-models/${modelId}/enable`,
      method: "POST",
      json: {},
      fallbackError: "モデルの公開に失敗しました",
    })
  }

  if (body?.action === "disable") {
    const reason =
      typeof body.reason === "string" && body.reason.trim().length > 0
        ? body.reason.trim().slice(0, 500)
        : "通報内容の確認による非公開"
    return callUserModelsApi({
      proxy: moderator.proxy,
      path: `/internal/user-models/${modelId}/disable`,
      method: "POST",
      json: { reason: `admin: ${reason}` },
      fallbackError: "モデルの非公開に失敗しました",
    })
  }

  return toUserModelsJsonResponse(
    { error: 'action must be "disable" or "enable"', data: null },
    400,
  )
}
