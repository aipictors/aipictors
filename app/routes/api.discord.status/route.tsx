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

const toJson = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })

const getViewerUserId = async (request: Request, context: unknown) => {
  const authorization = request.headers.get("authorization")
  const graphqlEndpoint = getServerEnvValue(context, "VITE_GRAPHQL_ENDPOINT_REMIX")
  if (!authorization?.startsWith("Bearer ") || !graphqlEndpoint) return null
  const viewer = await verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
    wpUserId: request.headers.get("wp-user-id"),
  })
  return viewer?.userId ?? null
}

const forward = async (response: Response) => {
  return new Response(await response.text(), {
    status: response.status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await getViewerUserId(request, context)
  if (userId === null) {
    return toJson({ error: "Unauthorized", data: null }, 401)
  }
  return forward(
    await fetch(
      `${getApiBaseUrl(context)}/internal/discord/status/${encodeURIComponent(userId)}`,
      { headers: getInternalHeaders(context) },
    ),
  )
}

type ActionBody = {
  intent?: string
  showNickname?: boolean
  celebrate?: boolean
  expiryDm?: boolean
  highlightKey?: string | null
}

const INTENT_PATHS: Record<string, string> = {
  settings: "settings",
  unlink: "unlink",
  sync: "sync",
  "request-sync": "request-sync",
}

export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await getViewerUserId(request, context)
  if (userId === null) {
    return toJson({ error: "Unauthorized", data: null }, 401)
  }
  const body = (await request.json()) as ActionBody
  const path = INTENT_PATHS[body.intent ?? ""]
  if (!path) {
    return toJson({ error: "Invalid intent", data: null }, 400)
  }
  // userId は必ずログイン中の本人のものを使う
  const payload =
    path === "settings"
      ? {
          userId,
          showNickname: body.showNickname,
          celebrate: body.celebrate,
          expiryDm: body.expiryDm,
          highlightKey: body.highlightKey,
        }
      : { userId }
  return forward(
    await fetch(`${getApiBaseUrl(context)}/internal/discord/${path}`, {
      method: "POST",
      headers: getInternalHeaders(context),
      body: JSON.stringify(payload),
    }),
  )
}
