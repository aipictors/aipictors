/**
 * POST /api/support/:op
 *
 * お問い合わせ（サポートチャット）。ログイン中の本人を確かめてから aipictors-api の /internal/support を呼ぶ
 * op: thread（今のお問い合わせ）・messages（送る・AI が答える）・escalate（スタッフに相談）・feedback・resolve・unread
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import {
  getApiBaseUrl,
  getInternalHeaders,
} from "~/lib/server/coins-api.server"
import { getServerEnvValue } from "~/lib/server/env.server"

const OPS = new Set([
  "thread",
  "messages",
  "escalate",
  "feedback",
  "resolve",
  "unread",
])

function toJson(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

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

  const input = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >

  // 本人の ID・プラン・メールアドレスはサーバーで決める（送られてきた値は使わない）
  const body: Record<string, unknown> = {
    ticketId: typeof input.ticketId === "string" ? input.ticketId : undefined,
    body: typeof input.body === "string" ? input.body : undefined,
    escalate: input.escalate === true,
    newTicket: input.newTicket === true,
    messageId: typeof input.messageId === "string" ? input.messageId : undefined,
    helpful: input.helpful === true,
    userName:
      typeof input.userName === "string" ? input.userName.slice(0, 80) : undefined,
    userId: viewer.userId,
    passType: viewer.currentPassType,
    contactEmail: viewer.userEmail ?? undefined,
  }

  const response = await fetch(`${getApiBaseUrl(context)}/internal/support/${op}`, {
    method: "POST",
    headers: getInternalHeaders(context),
    body: JSON.stringify(body),
  })
  const text = await response.text()
  return new Response(text, {
    status: response.status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}
