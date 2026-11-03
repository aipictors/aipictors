import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { resolveViewerAndHeaders } from "~/lib/server/backend-api-auth.server"

async function handleRequest(request: Request, context: LoaderFunctionArgs["context"] | ActionFunctionArgs["context"]) {
  const resolved = await resolveViewerAndHeaders(request, context)
  if ("error" in resolved) {
    return resolved.error
  }

  try {
    const apiResponse = await fetch(
      `${resolved.apiBaseUrl}/internal/subscriptions/unpaid/${resolved.viewer.userId}`,
      {
        method: "GET",
        headers: resolved.headers,
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
            passType: string
            amount: number
            hostedInvoiceUrl: string
            subscriptionStatus: string
          } | null
        }
      } catch {
        return null
      }
    })()

    if (!apiResponse.ok || apiJson?.error) {
      const fallbackError =
        responseText && !responseText.trim().startsWith("<")
          ? responseText
          : "Failed to fetch unpaid subscription"
      return toJsonResponse({ error: apiJson?.error ?? fallbackError, data: null }, 502)
    }

    return toJsonResponse(
      {
        error: null,
        data: apiJson?.data ?? null,
      },
      200,
    )
  } catch (error) {
    return toJsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch unpaid subscription",
        data: null,
      },
      502,
    )
  }
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  if (request.method !== "GET") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }
  return handleRequest(request, context)
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }
  return handleRequest(request, context)
}
