/**
 * POST /api/admin/support/:op
 *
 * スタッフ用のお問い合わせ受付（モデレーターのみ）
 * op: tickets（一覧）・ticket（1 件・アカウントの状況つき）・reply（返事・状態の変更）
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import {
  getApiBaseUrl,
  getInternalHeaders,
} from "~/lib/server/coins-api.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { toJsonResponse as toJson } from "~/lib/server/json-response.server"

const OPS = new Set(["tickets", "ticket", "reply"])

export async function loader(_props: LoaderFunctionArgs): Promise<Response> {
  return toJson({ error: "Method not allowed", data: null }, 405)
}

export async function action({
  request,
  context,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const op = params.op ?? ""
  if (!OPS.has(op)) {
    return toJson({ error: "Not found", data: null }, 404)
  }

  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return toJson({ error: "Unauthorized", data: null }, 401)
  }

  const graphqlEndpoint = getServerEnvValue(context, "VITE_GRAPHQL_ENDPOINT_REMIX")
  if (!graphqlEndpoint) {
    return toJson({ error: "GraphQL endpoint is not configured", data: null }, 500)
  }

  const viewer = await verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
    wpUserId: request.headers.get("wp-user-id"),
  })
  if (!viewer) {
    return toJson({ error: "Unauthorized", data: null }, 401)
  }
  if (!viewer.isModerator) {
    return toJson({ error: "Forbidden: moderator only", data: null }, 403)
  }

  const input = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >

  const response = await fetch(
    `${getApiBaseUrl(context)}/internal/support/admin/${op}`,
    {
      method: "POST",
      headers: getInternalHeaders(context),
      body: JSON.stringify({ ...input, staffUserId: viewer.userId }),
    },
  )
  const text = await response.text()
  return new Response(text, {
    status: response.status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}
