import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { getServerEnvValue } from "~/lib/server/env.server"

function toJsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed" }, 405)
  }

  const signatureHeader = request.headers.get("stripe-signature")
  if (!signatureHeader) {
    return toJsonResponse({ error: "Missing stripe-signature" }, 400)
  }

  const payload = await request.text()

  const apiBaseUrl =
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"

  const cfAccessClientId = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_ID",
  )
  const cfAccessClientSecret = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_SECRET",
  )

  const extraHeaders: Record<string, string> = {}
  if (cfAccessClientId && cfAccessClientSecret) {
    extraHeaders["CF-Access-Client-Id"] = cfAccessClientId
    extraHeaders["CF-Access-Client-Secret"] = cfAccessClientSecret
  }

  try {
    const response = await fetch(
      `${apiBaseUrl}/webhooks/stripe/premium-coins`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "stripe-signature": signatureHeader,
          ...extraHeaders,
        },
        body: payload,
      },
    )

    const body = await response.text()

    return new Response(body, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    })
  } catch (error) {
    return toJsonResponse(
      {
        error:
          error instanceof Error ? error.message : "Failed to proxy webhook",
      },
      502,
    )
  }
}
