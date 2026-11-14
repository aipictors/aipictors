import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { resolveViewerAndHeaders } from "~/lib/server/backend-api-auth.server"

const toSeconds = (value: number | string | null | undefined) => {
  const seconds = Number(value)
  return value != null && Number.isFinite(seconds) && seconds > 0
    ? seconds
    : null
}

async function handleRequest(
  request: Request,
  context: LoaderFunctionArgs["context"] | ActionFunctionArgs["context"],
) {
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
            type?: string | null
            created_at?: number | string | null
            current_period_end?: number | string | null
            trial_end?: number | string | null
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
      return toJsonResponse(
        { error: apiJson?.error ?? fallbackError, data: null },
        502,
      )
    }

    return toJsonResponse(
      {
        error: null,
        data: {
          status: apiJson?.data?.status ?? null,
          // 解約予定の案内・入ったばかりの人への案内（use-subscription-summary）で使う
          type: apiJson?.data?.type ?? null,
          createdAt: toSeconds(apiJson?.data?.created_at),
          currentPeriodEnd: toSeconds(apiJson?.data?.current_period_end),
          trialEnd: toSeconds(apiJson?.data?.trial_end),
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
