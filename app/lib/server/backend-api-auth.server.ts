import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { toJsonResponse } from "~/lib/server/json-response.server"

/**
 * ログイン中のユーザーを確かめて、バックエンド API を呼ぶ URL とヘッダーを返す
 */
export async function resolveViewerAndHeaders(request: Request, context: LoaderFunctionArgs["context"] | ActionFunctionArgs["context"]) {
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
