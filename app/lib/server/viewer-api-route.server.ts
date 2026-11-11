import { verifyViewerFromGraphQL, type VerifiedViewer } from "~/lib/server/auth.server"
import { getApiBaseUrl, getInternalHeaders } from "~/lib/server/coins-api.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { toJsonResponse } from "~/lib/server/json-response.server"

/**
 * ログイン中の人を確かめる（/api の課金まわりの入口で共通）。確かめられなければ返す応答を返す
 */
export const requireViewer = async (
  request: Request,
  context: unknown,
): Promise<VerifiedViewer | Response> => {
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
    wpUserId: request.headers.get("wp-user-id") ?? undefined,
  })
  if (!viewer) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }
  return viewer
}

/**
 * aipictors-api を内部トークンで呼ぶ。応答の { error, data } をそのまま返す
 */
export const callAipictorsApi = async <T>(
  context: unknown,
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<{ status: number; error: string | null; data: T | null }> => {
  const response = await fetch(`${getApiBaseUrl(context)}${path}`, {
    method: init?.method ?? "GET",
    headers: getInternalHeaders(context),
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  })
  const json = (await response.json().catch(() => null)) as {
    error?: string | null
    data?: T
  } | null
  return {
    status: response.status,
    error: json?.error ?? (response.ok ? null : `HTTP ${response.status}`),
    data: json?.data ?? null,
  }
}
