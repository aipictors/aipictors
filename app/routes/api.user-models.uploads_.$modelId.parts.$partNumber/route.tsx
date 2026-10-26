import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import {
  relayUserModelsApiResponse,
  resolveUserModelsProxy,
  toUserModelsJsonResponse,
} from "~/lib/server/user-models.server"

/**
 * 1 パートの上限（Cloudflare のリクエスト本文上限 100MB より小さくする）
 */
const MAX_PART_BYTES = 95 * 1024 * 1024

type FixedLengthStreamConstructor = new (
  length: number,
) => TransformStream<Uint8Array, Uint8Array>

export async function loader(_props: LoaderFunctionArgs) {
  return toUserModelsJsonResponse(
    { error: "Method not allowed", data: null },
    405,
  )
}

/**
 * パート転送。本文はバッファせずストリームのまま aipictors-api に中継する
 * PUT /api/user-models/uploads/:modelId/parts/:partNumber
 */
export async function action({ request, context, params }: ActionFunctionArgs) {
  if (request.method !== "PUT") {
    return toUserModelsJsonResponse(
      { error: "Method not allowed", data: null },
      405,
    )
  }

  const modelId = params.modelId ?? ""
  const partNumber = Number(params.partNumber)
  if (
    !/^[A-Za-z0-9_-]{1,64}$/.test(modelId) ||
    !Number.isInteger(partNumber) ||
    partNumber < 1 ||
    partNumber > 10000
  ) {
    return toUserModelsJsonResponse({ error: "Invalid part", data: null }, 400)
  }

  const contentLength = Number(request.headers.get("content-length") ?? "")
  if (!Number.isFinite(contentLength) || contentLength <= 0) {
    return toUserModelsJsonResponse(
      { error: "Content-Length が必要です", data: null },
      411,
    )
  }
  if (contentLength > MAX_PART_BYTES) {
    return toUserModelsJsonResponse(
      { error: "パートが大きすぎます", data: null },
      413,
    )
  }

  if (request.body === null) {
    return toUserModelsJsonResponse(
      { error: "本文がありません", data: null },
      400,
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

  // Workers では FixedLengthStream を通すと Content-Length 付きでストリーム送信できる
  const FixedLengthStream = (
    globalThis as { FixedLengthStream?: FixedLengthStreamConstructor }
  ).FixedLengthStream
  const body = FixedLengthStream
    ? request.body.pipeThrough(new FixedLengthStream(contentLength))
    : request.body

  try {
    const apiResponse = await fetch(
      `${resolved.value.apiBaseUrl}/internal/user-models/uploads/${modelId}/parts/${partNumber}?userId=${encodeURIComponent(viewer.userId)}`,
      {
        method: "PUT",
        headers: {
          ...resolved.value.headers,
          "content-type": "application/octet-stream",
          "content-length": String(contentLength),
        },
        body,
        // Node（ローカル開発）でストリーム本文を送るために必要
        duplex: "half",
      } as RequestInit,
    )
    return relayUserModelsApiResponse(apiResponse, "パートの送信に失敗しました")
  } catch (error) {
    return toUserModelsJsonResponse(
      {
        error:
          error instanceof Error ? error.message : "パートの送信に失敗しました",
        data: null,
      },
      502,
    )
  }
}
