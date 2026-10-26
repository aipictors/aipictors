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
 * URL（Civitai）のモデルの内容を確認する（登録はしない）
 */
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
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

  const body = await readJsonBodyWithUserId(request, viewer.userId)
  if (body === null || typeof body.url !== "string") {
    return toUserModelsJsonResponse(
      { error: "URL を入力してください", data: null },
      400,
    )
  }

  return callUserModelsApi({
    proxy: resolved.value,
    path: "/internal/user-models/imports/preview",
    method: "POST",
    json: { url: body.url },
    fallbackError: "モデルの情報を取得できませんでした",
  })
}
