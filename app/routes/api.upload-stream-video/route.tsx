import type { ActionFunctionArgs } from "@remix-run/cloudflare"

type CloudflareUploadResponse = {
  success?: boolean
  errors?: Array<{ message?: string }>
  result?: {
    uid?: string
    playback?: {
      hls?: string
      dash?: string
    }
    thumbnail?: string
  }
}

function toJsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

function getSecretFromContextOrBuild(
  context: ActionFunctionArgs["context"],
  key: string,
): string | undefined {
  const envFromContext = (context as { cloudflare?: { env?: Record<string, string> } })
    .cloudflare?.env

  if (envFromContext?.[key]) {
    return envFromContext[key]
  }

  const envFromBuild = (import.meta.env as Record<string, string | undefined>)[
    key
  ]

  return envFromBuild
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse(
      { error: "Method not allowed", data: null },
      405,
    )
  }

  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return toJsonResponse(
      { error: "Unauthorized", data: null },
      401,
    )
  }

  const contentType = request.headers.get("content-type") ?? ""
  if (!contentType.startsWith("video/")) {
    return toJsonResponse(
      { error: "Invalid content type", data: null },
      400,
    )
  }

  const accountId = getSecretFromContextOrBuild(context, "CLOUDFLARE_ACCOUNT_ID")
  const streamApiToken = getSecretFromContextOrBuild(
    context,
    "CLOUDFLARE_STREAM_API_TOKEN",
  )

  if (!accountId || !streamApiToken) {
    return toJsonResponse(
      {
        error:
          "CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_STREAM_API_TOKEN is not configured",
        data: null,
      },
      500,
    )
  }

  const body = await request.arrayBuffer()
  if (body.byteLength === 0) {
    return toJsonResponse({ error: "Empty body", data: null }, 400)
  }

  const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`
  const formData = new FormData()
  formData.set("file", new Blob([body], { type: contentType }), "upload.mp4")

  const cloudflareResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${streamApiToken}`,
    },
    body: formData,
  })

  const responseJson = (await cloudflareResponse.json()) as CloudflareUploadResponse
  const uid = responseJson.result?.uid

  if (!cloudflareResponse.ok || !responseJson.success || !uid) {
    const reason =
      responseJson.errors?.map((error) => error.message).filter(Boolean).join("; ") ||
      "Cloudflare Stream upload failed"

    return toJsonResponse(
      {
        error: reason,
        data: null,
      },
      502,
    )
  }

  const embedUrl = `https://iframe.videodelivery.net/${uid}`

  return toJsonResponse(
    {
      data: {
        uid,
        url: embedUrl,
        hlsUrl: responseJson.result?.playback?.hls ?? null,
        dashUrl: responseJson.result?.playback?.dash ?? null,
        thumbnailUrl: responseJson.result?.thumbnail ?? null,
      },
      error: null,
    },
    200,
  )
}
