/**
 * Discord 連携の OAuth の state
 *
 * state に Aipictors のユーザー ID を署名して入れ、同じブラウザの Cookie の値と照らし合わせる。
 * Cookie がないと、他人に連携用の URL を開かせて自分のアカウントに連携させることができてしまう
 */

export const DISCORD_CLIENT_ID = "1306188881418391573"
export const DISCORD_OAUTH_SCOPES = "identify role_connections.write"
export const DISCORD_REDIRECT_URI =
  "https://www.aipictors.com/api/discord/callback"
export const DISCORD_NONCE_COOKIE = "discord_oauth_nonce"

const STATE_TTL_SECONDS = 10 * 60

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")

const sign = async (secret: string, payload: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  )
  return toBase64Url(new Uint8Array(signature))
}

const isSameText = (a: string, b: string) => {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export const createDiscordOAuthState = async (props: {
  secret: string
  userId: string
  now: number
}) => {
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(16)))
  const payload = `${props.userId}.${props.now + STATE_TTL_SECONDS}.${nonce}`
  const state = `${payload}.${await sign(props.secret, payload)}`
  return { state, nonce }
}

/** 正しければ連携先の Aipictors のユーザー ID を返す */
export const verifyDiscordOAuthState = async (props: {
  secret: string
  state: string
  nonce: string | null
  now: number
}) => {
  const [userId, expiresAt, nonce, signature] = props.state.split(".")
  if (!userId || !expiresAt || !nonce || !signature || !props.nonce) {
    return null
  }
  const expected = await sign(props.secret, `${userId}.${expiresAt}.${nonce}`)
  if (!isSameText(expected, signature)) return null
  if (!isSameText(nonce, props.nonce)) return null
  if (Number(expiresAt) < props.now) return null
  return userId
}

export const toDiscordAuthorizeUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: DISCORD_REDIRECT_URI,
    scope: DISCORD_OAUTH_SCOPES,
    state,
    prompt: "consent",
  })
  return `https://discord.com/oauth2/authorize?${params.toString()}`
}

export const readCookie = (header: string | null, name: string) => {
  for (const part of (header ?? "").split(";")) {
    const [key, ...value] = part.trim().split("=")
    if (key === name) return value.join("=")
  }
  return null
}
