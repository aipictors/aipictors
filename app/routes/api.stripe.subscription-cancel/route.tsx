import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { toJsonResponse } from "~/lib/server/json-response.server"

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }

  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  const graphqlEndpoint = getServerEnvValue(context, "VITE_GRAPHQL_ENDPOINT_REMIX")
  if (!graphqlEndpoint) {
    return toJsonResponse(
      { error: "VITE_GRAPHQL_ENDPOINT_REMIX is not configured", data: null },
      500,
    )
  }

  const viewer = await verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
  })

  if (!viewer) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  const apiBaseUrl =
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  const internalToken = getServerEnvValue(context, "AIPICTORS_API_INTERNAL_TOKEN")
  const cfAccessClientId = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_ID",
  )
  const cfAccessClientSecret = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_SECRET",
  )

  // 解約の理由（任意）
  const input = (await request.json().catch(() => ({}))) as {
    reason?: unknown
    reasonNote?: unknown
  }

  if (!internalToken) {
    return toJsonResponse(
      { error: "AIPICTORS_API_INTERNAL_TOKEN is not configured", data: null },
      500,
    )
  }

  try {
    const apiResponse = await fetch(
      `${apiBaseUrl}/internal/subscriptions/cancel-current`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${internalToken}`,
          "Content-Type": "application/json",
          ...(cfAccessClientId && cfAccessClientSecret
            ? {
                "CF-Access-Client-Id": cfAccessClientId,
                "CF-Access-Client-Secret": cfAccessClientSecret,
              }
            : {}),
        },
        body: JSON.stringify({
          userId: viewer.userId,
          userEmail: viewer.userEmail,
          reason: typeof input.reason === "string" ? input.reason : null,
          reasonNote:
            typeof input.reasonNote === "string"
              ? input.reasonNote.slice(0, 500)
              : null,
        }),
      },
    )

    const responseText = await apiResponse.text()
    const apiJson = (() => {
      if (!responseText) {
        return null
      }
      try {
        return JSON.parse(responseText) as {
          error: string | null
          data: {
            status: string
          } | null
        }
      } catch {
        return null
      }
    })()

    if (!apiResponse.ok || apiJson?.error) {
      if (apiJson?.error === "No active subscription found") {
        return toJsonResponse(
          {
            error: null,
            data: {
              status: "already_canceled",
            },
          },
          200,
        )
      }

      const fallbackError =
        responseText && !responseText.trim().startsWith("<")
          ? responseText
          : "Failed to cancel subscription"
      return toJsonResponse(
        {
          error: apiJson?.error ?? fallbackError,
          data: null,
        },
        502,
      )
    }

    return toJsonResponse(
      {
        error: null,
        data: {
          status: apiJson?.data?.status ?? "cancellation_requested",
        },
      },
      200,
    )
  } catch (error) {
    return toJsonResponse(
      {
        error: error instanceof Error ? error.message : "Failed to cancel subscription",
        data: null,
      },
      502,
    )
  }
}
