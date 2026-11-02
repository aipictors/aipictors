import { describe, expect, test } from "bun:test"
import {
  createDiscordOAuthState,
  toDiscordAuthorizeUrl,
  verifyDiscordOAuthState,
} from "~/lib/server/discord-oauth.server"

const secret = "test-secret"
const now = 1_800_000_000

const toChallenge = async (verifier: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  )
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")
}

describe("Discord 連携の state", () => {
  test("ユーザーと verifier を取り出せて、challenge と一致する", async () => {
    const { state, codeChallenge } = await createDiscordOAuthState({ secret, userId: "12", now })
    const result = await verifyDiscordOAuthState({ secret, state, now })
    expect(result?.userId).toBe("12")
    expect(result?.codeVerifier.length).toBeGreaterThanOrEqual(43)
    expect(await toChallenge(result?.codeVerifier ?? "")).toBe(codeChallenge)
  })

  test("state に verifier がそのまま入らない", async () => {
    const { state } = await createDiscordOAuthState({ secret, userId: "12", now })
    const result = await verifyDiscordOAuthState({ secret, state, now })
    expect(state).not.toContain(result?.codeVerifier ?? "x")
  })

  test("書き換え・期限切れ・別の鍵は通らない", async () => {
    const { state } = await createDiscordOAuthState({ secret, userId: "12", now })
    const forged = state.replace(/^12\./, "13.")
    expect(await verifyDiscordOAuthState({ secret, state: forged, now })).toBeNull()
    expect(await verifyDiscordOAuthState({ secret, state, now: now + 1801 })).toBeNull()
    expect(await verifyDiscordOAuthState({ secret: "x", state, now })).toBeNull()
    expect(await verifyDiscordOAuthState({ secret, state: "broken", now })).toBeNull()
  })

  test("30 分は有効", async () => {
    const { state } = await createDiscordOAuthState({ secret, userId: "12", now })
    expect(await verifyDiscordOAuthState({ secret, state, now: now + 1790 })).not.toBeNull()
  })

  test("認可 URL に必要なものが入る", () => {
    const url = new URL(toDiscordAuthorizeUrl({ state: "abc", codeChallenge: "xyz" }))
    expect(url.origin).toBe("https://discord.com")
    expect(url.searchParams.get("state")).toBe("abc")
    expect(url.searchParams.get("client_id")).toBe("1566508809940115497")
    expect(url.searchParams.get("code_challenge")).toBe("xyz")
    expect(url.searchParams.get("code_challenge_method")).toBe("S256")
    expect(url.searchParams.get("scope")).toBe("identify")
    expect(url.searchParams.get("redirect_uri")).toBe("https://www.aipictors.com/api/discord/callback")
  })
})
