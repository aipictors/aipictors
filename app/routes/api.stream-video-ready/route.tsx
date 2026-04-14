import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { isCloudflareStreamUid } from "~/utils/cloudflare-stream"

type CloudflareStreamStatusResponse = {
  result?: {
    uid?: string
    readyToStream?: boolean
    status?: {
      state?: string
    }
  }
  success?: boolean
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
  context: LoaderFunctionArgs["context"],
  key: string,
): string | undefined {
  const envFromContext = (
    context as { cloudflare?: { env?: Record<string, string> } }
  ).cloudflare?.env

  if (envFromContext?.[key]) {
    return envFromContext[key]
  }

  return (import.meta.env as Record<string, string | undefined>)[key]
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const uid = url.searchParams.get("uid")

  if (!uid || !isCloudflareStreamUid(uid)) {
    return toJsonResponse({ ready: false, error: "Invalid uid" }, 400)
  }

  const accountId = getSecretFromContextOrBuild(context, "CLOUDFLARE_ACCOUNT_ID")
  const streamApiToken = getSecretFromContextOrBuild(
    context,
    "CLOUDFLARE_STREAM_API_TOKEN",
  )

  if (!accountId || !streamApiToken) {
    return toJsonResponse({ ready: false, error: "Not configured" }, 500)
  }

  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${uid}`,
    {
      headers: {
        Authorization: `Bearer ${streamApiToken}`,
      },
    },
  )

  if (!resp.ok) {
    return toJsonResponse({ ready: false }, 200)
  }

  const data = (await resp.json()) as CloudflareStreamStatusResponse
  const ready = data.result?.readyToStream === true

  return toJsonResponse({ ready }, 200)
}
