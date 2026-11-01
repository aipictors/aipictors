import { describe, expect, test } from "bun:test"
import {
  createDiscordOAuthState,
  createDiscordPkce,
  readCookie,
  toDiscordAuthorizeUrl,
  verifyDiscordOAuthState,
} from "~/lib/server/discord-oauth.server"

const secret = "test-secret"
const now = 1_800_000_000

describe("Discord 連携の state", () => {
  test("同じブラウザの Cookie と一緒なら通る", async () => {
    const { state, nonce } = await createDiscordOAuthState({ secret, userId: "12", now })
    expect(await verifyDiscordOAuthState({ secret, state, nonce, now })).toBe("12")
  })

  test("Cookie がない・違うブラウザでは通らない", async () => {
    const { state } = await createDiscordOAuthState({ secret, userId: "12", now })
    expect(await verifyDiscordOAuthState({ secret, state, nonce: null, now })).toBeNull()
    expect(await verifyDiscordOAuthState({ secret, state, nonce: "other", now })).toBeNull()
  })

  test("書き換え・期限切れ・別の鍵は通らない", async () => {
    const { state, nonce } = await createDiscordOAuthState({ secret, userId: "12", now })
    const forged = state.replace(/^12\./, "13.")
    expect(await verifyDiscordOAuthState({ secret, state: forged, nonce, now })).toBeNull()
    expect(await verifyDiscordOAuthState({ secret, state, nonce, now: now + 601 })).toBeNull()
    expect(await verifyDiscordOAuthState({ secret: "x", state, nonce, now })).toBeNull()
    expect(await verifyDiscordOAuthState({ secret, state: "broken", nonce, now })).toBeNull()
  })

  test("認可 URL に必要なものが入る", () => {
    const url = new URL(toDiscordAuthorizeUrl({ state: "abc", codeChallenge: "xyz" }))
    expect(url.searchParams.get("state")).toBe("abc")
    expect(url.searchParams.get("client_id")).toBe("1566508809940115497")
    expect(url.searchParams.get("code_challenge")).toBe("xyz")
    expect(url.searchParams.get("code_challenge_method")).toBe("S256")
    expect(url.searchParams.get("scope")).toBe("identify role_connections.write")
    expect(url.searchParams.get("redirect_uri")).toBe("https://www.aipictors.com/api/discord/callback")
  })

  test("PKCE は RFC 7636 の例と同じ計算", async () => {
    const pkce = await createDiscordPkce()
    expect(pkce.verifier.length).toBeGreaterThanOrEqual(43)
    expect(pkce.challenge).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(pkce.challenge).not.toBe(pkce.verifier)
  })

  test("Cookie を読む", () => {
    expect(readCookie("a=1; discord_oauth_nonce=xyz; b=2", "discord_oauth_nonce")).toBe("xyz")
    expect(readCookie(null, "a")).toBeNull()
  })
})
