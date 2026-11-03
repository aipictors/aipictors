import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import {
  getApiBaseUrl,
  getInternalHeaders,
} from "~/lib/server/coins-api.server"
import {
  DISCORD_REDIRECT_URI,
  verifyDiscordOAuthState,
} from "~/lib/server/discord-oauth.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { toJsonResponse as toJson } from "~/lib/server/json-response.server"

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
  celebrate?: boolean
  expiryDm?: boolean
  highlightKey?: string | null
  code?: string
  state?: string
}

/**
 * Discord から戻ってきたあとの連携の完了。state のユーザーとログイン中の本人が同じときだけ行う
 */
const finishLink = async (
  context: unknown,
  userId: string,
  body: ActionBody,
) => {
  const secret = getServerEnvValue(context, "DISCORD_OAUTH_STATE_SECRET")
  const verified =
    secret && body.code && body.state
      ? await verifyDiscordOAuthState({
          secret,
          state: body.state,
          now: Math.floor(Date.now() / 1000),
        })
      : null
  if (verified === null) {
    return toJson({ error: null, data: { result: "expired" } }, 200)
  }
  if (verified.userId !== userId) {
    return toJson({ error: null, data: { result: "wrong_user" } }, 200)
  }

  const response = await fetch(
    `${getApiBaseUrl(context)}/internal/discord/link`,
    {
      method: "POST",
      headers: getInternalHeaders(context),
      body: JSON.stringify({
        userId,
        code: body.code,
        redirectUri: DISCORD_REDIRECT_URI,
        codeVerifier: verified.codeVerifier,
      }),
    },
  )
  const json = (await response.json()) as {
    data?: { ok: boolean; code?: string; bonusCoins?: number }
  }
  if (!response.ok || !json.data) {
    return toJson({ error: null, data: { result: "error" } }, 200)
  }
  if (!json.data.ok) {
    return toJson(
      {
        error: null,
        data: {
          result:
            json.data.code === "DISCORD_ALREADY_LINKED"
              ? "discord_taken"
              : "user_taken",
        },
      },
      200,
    )
  }
  return toJson(
    {
      error: null,
      data: { result: "linked", bonus: json.data.bonusCoins ?? 0 },
    },
    200,
  )
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
  if (body.intent === "finish") {
    return finishLink(context, userId, body)
  }
  const path = INTENT_PATHS[body.intent ?? ""]
  if (!path) {
    return toJson({ error: "Invalid intent", data: null }, 400)
  }
  // userId は必ずログイン中の本人のものを使う
  const payload =
    path === "settings"
      ? {
          userId,
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
