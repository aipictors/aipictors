import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { proxyStripeWebhookToApi } from "~/lib/server/points-api.server"

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

  try {
    const response = await proxyStripeWebhookToApi({
      context,
      payload,
      stripeSignature: signatureHeader,
    })

    const body = await response.text()

    return new Response(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    })
  } catch (error) {
    return toJsonResponse(
      { error: error instanceof Error ? error.message : "Failed to proxy webhook" },
      502,
    )
  }
}
