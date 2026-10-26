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
 * アップロード開始（上限・サイズ・拡張子は aipictors-api 側で検証）
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
  if (body === null) {
    return toUserModelsJsonResponse({ error: "Invalid JSON", data: null }, 400)
  }

  const filename = typeof body.filename === "string" ? body.filename : ""
  if (!filename.toLowerCase().endsWith(".safetensors")) {
    return toUserModelsJsonResponse(
      {
        error: ".safetensors 形式のファイルのみアップロードできます",
        data: null,
      },
      400,
    )
  }

  return callUserModelsApi({
    proxy: resolved.value,
    path: "/internal/user-models/uploads",
    method: "POST",
    json: body,
    fallbackError: "アップロードの開始に失敗しました",
  })
}
