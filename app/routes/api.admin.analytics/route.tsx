import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import {
  getApiBaseUrl,
  getInternalHeaders,
} from "~/lib/server/coins-api.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { toJsonResponse } from "~/lib/server/json-response.server"

/**
 * 分析ページ（/admin/analytics）の日別の数字。モデレーターだけ
 * 中身は aipictors-api の /internal/analytics/daily（毎日 00:30 JST に前日分を保存している）と /internal/analytics/pnl（収支）
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

  const days = new URL(request.url).searchParams.get("days") ?? "90"
  try {
    const headers = getInternalHeaders(context)
    const baseUrl = getApiBaseUrl(context)
    // 収支（今日のここまで・今月）は外部の請求 API を呼ぶので、失敗しても日別の数字は返す
    const [response, pnl] = await Promise.all([
      fetch(
        `${baseUrl}/internal/analytics/daily?days=${encodeURIComponent(days)}`,
        { headers },
      ),
      fetch(`${baseUrl}/internal/analytics/pnl`, { headers })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ])
    const body = await response.json()
    if (!response.ok) {
      return toJsonResponse(
        { error: "Failed to load analytics", data: null },
        502,
      )
    }
    return toJsonResponse({ error: null, data: { ...body, pnl } }, 200)
  } catch (error) {
    return toJsonResponse(
      {
        error:
          error instanceof Error ? error.message : "Failed to load analytics",
        data: null,
      },
      500,
    )
  }
}
