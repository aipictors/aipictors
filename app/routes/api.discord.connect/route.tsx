import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import {
  createDiscordOAuthState,
  DISCORD_NONCE_COOKIE,
  toDiscordAuthorizeUrl,
} from "~/lib/server/discord-oauth.server"
import { getServerEnvValue } from "~/lib/server/env.server"

const toJson = (body: unknown, status: number, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...headers,
    },
  })

/**
 * Discord の認可画面の URL を返す（ログイン中の本人だけ）
 */
export async function action({ request, context }: ActionFunctionArgs) {
  const authorization = request.headers.get("authorization")
  const graphqlEndpoint = getServerEnvValue(context, "VITE_GRAPHQL_ENDPOINT_REMIX")
  const secret = getServerEnvValue(context, "DISCORD_OAUTH_STATE_SECRET")
  if (!authorization?.startsWith("Bearer ")) {
    return toJson({ error: "Unauthorized", data: null }, 401)
  }
  if (!graphqlEndpoint || !secret) {
    return toJson({ error: "Discord link is not configured", data: null }, 500)
  }

  const viewer = await verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
    wpUserId: request.headers.get("wp-user-id"),
  })
  if (!viewer) {
    return toJson({ error: "Unauthorized", data: null }, 401)
  }

  const { state, nonce } = await createDiscordOAuthState({
    secret,
    userId: viewer.userId,
    now: Math.floor(Date.now() / 1000),
  })

  return toJson({ error: null, data: { url: toDiscordAuthorizeUrl(state) } }, 200, {
    "set-cookie": `${DISCORD_NONCE_COOKIE}=${nonce}; Path=/api/discord; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
  })
}
