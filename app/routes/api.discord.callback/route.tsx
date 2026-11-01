import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import {
  getApiBaseUrl,
  getInternalHeaders,
} from "~/lib/server/coins-api.server"
import {
  DISCORD_NONCE_COOKIE,
  DISCORD_REDIRECT_URI,
  readCookie,
  verifyDiscordOAuthState,
} from "~/lib/server/discord-oauth.server"
import { getServerEnvValue } from "~/lib/server/env.server"

const toSettings = (params: Record<string, string>) =>
  new Response(null, {
    status: 302,
    headers: {
      location: `/settings/discord?${new URLSearchParams(params).toString()}`,
      "cache-control": "no-store",
      "set-cookie": `${DISCORD_NONCE_COOKIE}=; Path=/api/discord; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    },
  })

/**
 * Discord の認可画面から戻ってくるところ
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const secret = getServerEnvValue(context, "DISCORD_OAUTH_STATE_SECRET")

  // 認可画面で「キャンセル」を押したとき
  if (url.searchParams.get("error")) {
    return toSettings({ result: "canceled" })
  }
  if (!code || !state || !secret) {
    return toSettings({ result: "error" })
  }

  const userId = await verifyDiscordOAuthState({
    secret,
    state,
    nonce: readCookie(request.headers.get("cookie"), DISCORD_NONCE_COOKIE),
    now: Math.floor(Date.now() / 1000),
  })
  if (userId === null) {
    return toSettings({ result: "expired" })
  }

  try {
    const response = await fetch(
      `${getApiBaseUrl(context)}/internal/discord/link`,
      {
        method: "POST",
        headers: getInternalHeaders(context),
        body: JSON.stringify({
          userId,
          code,
          redirectUri: DISCORD_REDIRECT_URI,
        }),
      },
    )
    const json = (await response.json()) as {
      data?: { ok: boolean; code?: string; bonusCoins?: number }
    }
    if (!response.ok || !json.data) {
      return toSettings({ result: "error" })
    }
    if (!json.data.ok) {
      return toSettings({
        result:
          json.data.code === "DISCORD_ALREADY_LINKED"
            ? "discord_taken"
            : "user_taken",
      })
    }
    return toSettings({
      result: "linked",
      bonus: String(json.data.bonusCoins ?? 0),
    })
  } catch {
    return toSettings({ result: "error" })
  }
}
