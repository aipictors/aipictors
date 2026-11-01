import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import {
  createDiscordOAuthState,
  createDiscordPkce,
  DISCORD_NONCE_COOKIE,
  DISCORD_VERIFIER_COOKIE,
  toDiscordAuthorizeUrl,
} from "~/lib/server/discord-oauth.server"
import { getServerEnvValue } from "~/lib/server/env.server"

const toJson = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
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

  const pkce = await createDiscordPkce()
  const cookieOptions = "Path=/api/discord; Max-Age=600; HttpOnly; Secure; SameSite=Lax"
  const headers = new Headers({
    "content-type": "application/json",
    "cache-control": "no-store",
  })
  headers.append("set-cookie", `${DISCORD_NONCE_COOKIE}=${nonce}; ${cookieOptions}`)
  headers.append("set-cookie", `${DISCORD_VERIFIER_COOKIE}=${pkce.verifier}; ${cookieOptions}`)

  return new Response(
    JSON.stringify({
      error: null,
      data: {
        url: toDiscordAuthorizeUrl({ state, codeChallenge: pkce.challenge }),
      },
    }),
    { status: 200, headers },
  )
}
