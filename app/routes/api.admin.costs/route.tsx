import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import {
  getApiBaseUrl,
  getInternalHeaders,
} from "~/lib/server/coins-api.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { toJsonResponse } from "~/lib/server/json-response.server"

/**
 * 維持費の内訳ページ（/admin/costs）の数字。モデレーターだけ
 * 中身は aipictors-api の /internal/analytics/costs/breakdown（今の RunPod の構成と、ほかのサービスの直近 5 日の中央値）
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }
  const graphqlEndpoint = getServerEnvValue(
    context,
    "VITE_GRAPHQL_ENDPOINT_REMIX",
  )
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
  if (!viewer.isModerator) {
    return toJsonResponse({ error: "Forbidden", data: null }, 403)
  }

  const fresh = new URL(request.url).searchParams.get("fresh") === "1"
  try {
    const response = await fetch(
      `${getApiBaseUrl(context)}/internal/analytics/costs/breakdown${fresh ? "?fresh=1" : ""}`,
      { headers: getInternalHeaders(context) },
    )
    if (!response.ok) {
      return toJsonResponse({ error: "Failed to load costs", data: null }, 502)
    }
    return toJsonResponse({ error: null, data: await response.json() }, 200)
  } catch (error) {
    return toJsonResponse(
      {
        error: error instanceof Error ? error.message : "Failed to load costs",
        data: null,
      },
      500,
    )
  }
}
