import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
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

async function resolveViewerAndHeaders(request: Request, context: LoaderFunctionArgs["context"] | ActionFunctionArgs["context"]) {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return { error: toJsonResponse({ error: "Unauthorized", data: null }, 401) }
  }

  const graphqlEndpoint = getServerEnvValue(context, "VITE_GRAPHQL_ENDPOINT_REMIX")
  if (!graphqlEndpoint) {
    return {
      error: toJsonResponse(
        { error: "VITE_GRAPHQL_ENDPOINT_REMIX is not configured", data: null },
        500,
      ),
    }
  }

  const viewer = await verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
  })

  if (!viewer) {
    return { error: toJsonResponse({ error: "Unauthorized", data: null }, 401) }
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

  if (!internalToken) {
    return {
      error: toJsonResponse(
        { error: "AIPICTORS_API_INTERNAL_TOKEN is not configured", data: null },
        500,
      ),
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${internalToken}`,
  }

  if (cfAccessClientId && cfAccessClientSecret) {
    headers["CF-Access-Client-Id"] = cfAccessClientId
    headers["CF-Access-Client-Secret"] = cfAccessClientSecret
  }

  return {
    viewer,
    apiBaseUrl,
    headers,
  }
}

async function handleRequest(request: Request, context: LoaderFunctionArgs["context"] | ActionFunctionArgs["context"]) {
  const resolved = await resolveViewerAndHeaders(request, context)
  if ("error" in resolved) {
    return resolved.error
  }

  try {
    const apiResponse = await fetch(
      `${resolved.apiBaseUrl}/internal/subscriptions/current/${resolved.viewer.userId}`,
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
            status?: string | null
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
          : "Failed to fetch current subscription"
      return toJsonResponse({ error: apiJson?.error ?? fallbackError, data: null }, 502)
    }

    return toJsonResponse(
      {
        error: null,
        data: {
          status: apiJson?.data?.status ?? null,
        },
      },
      200,
    )
  } catch (error) {
    return toJsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch current subscription",
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
