import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import {
  getApiBaseUrl,
  getInternalHeaders,
} from "~/lib/server/coins-api.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { toJsonResponse as toJson } from "~/lib/server/json-response.server"

/**
 * クリエイター報酬（推しの換金）
 * GET  /api/creator-rewards → 本人の報酬のまとめ
 * POST /api/creator-rewards { intent: "join" | "leave" | "onboarding" | "dashboard" | "refresh", termsVersion? }
 * 処理は aipictors-api の /internal/creator-payouts/*
 */
const getViewer = async (request: Request, context: unknown) => {
  const authorization = request.headers.get("authorization")
  const graphqlEndpoint = getServerEnvValue(
    context,
    "VITE_GRAPHQL_ENDPOINT_REMIX",
  )
  if (!authorization?.startsWith("Bearer ") || !graphqlEndpoint) return null
  return verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
    wpUserId: request.headers.get("wp-user-id"),
  })
}

const forward = async (response: Response) =>
  new Response(await response.text(), {
    status: response.status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })

export async function loader({ request, context }: LoaderFunctionArgs) {
  const viewer = await getViewer(request, context)
  if (!viewer) return toJson({ error: "Unauthorized", data: null }, 401)
  return forward(
    await fetch(
      `${getApiBaseUrl(context)}/internal/creator-payouts/summary/${encodeURIComponent(viewer.userId)}`,
      { headers: getInternalHeaders(context) },
    ),
  )
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJson({ error: "Method not allowed", data: null }, 405)
  }
  const viewer = await getViewer(request, context)
  if (!viewer) return toJson({ error: "Unauthorized", data: null }, 401)
  const body = (await request.json().catch(() => ({}))) as {
    intent?: string
    termsVersion?: string
    lang?: string
    client?: string
  }
  const base = getApiBaseUrl(context)
  const headers = getInternalHeaders(context)
  const post = (path: string, payload: Record<string, unknown>) =>
    fetch(`${base}/internal/creator-payouts/${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ userId: viewer.userId, ...payload }),
    }).then(forward)
  const origin = new URL(request.url).origin
  const page = `${origin}${body.lang === "en" ? "/en" : ""}/settings/creator-rewards`
  switch (body.intent) {
    case "join":
      return post("join", { termsVersion: body.termsVersion ?? "" })
    case "leave":
      return post("leave", {})
    case "onboarding":
      return post("onboarding-link", {
        email: viewer.userEmail ?? undefined,
        returnUrl: `${page}?stripe=return${body.client === "app" ? "&from=app" : ""}`,
        refreshUrl: `${page}?stripe=refresh`,
      })
    case "dashboard":
      return post("dashboard-link", {})
    case "refresh":
      return post("refresh", {})
    default:
      return toJson({ error: "Unknown intent", data: null }, 400)
  }
}
