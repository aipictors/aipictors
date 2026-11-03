/**
 * Discord 連携の OAuth の state
 *
 * Discord アプリで許可すると、始めたのとは別のブラウザに戻ってくることがあるので Cookie は使わない。
 * state に Aipictors のユーザー ID を署名して入れ、完了の処理でログイン中の本人と照らし合わせる
 * （他人に URL を開かせても、その人のログインと一致しないので連携されない）。
 * PKCE の verifier は暗号化して state に入れる
 */

/** Discord アプリ「Aipictors」（公開クライアントなので secret はなく PKCE で確かめる） */
const DISCORD_CLIENT_ID = "1566508809940115497"
const DISCORD_OAUTH_SCOPES = "identify"
export const DISCORD_REDIRECT_URI =
  "https://www.aipictors.com/api/discord/callback"

/** 連携の画面を開いたまま少し置いてもよいように長めにする */
const STATE_TTL_SECONDS = 30 * 60

const encoder = new TextEncoder()

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")

const fromBase64Url = (text: string) =>
  Uint8Array.from(atob(text.replaceAll("-", "+").replaceAll("_", "/")), (c) =>
    c.charCodeAt(0),
  )

const sign = async (secret: string, payload: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  )
  return toBase64Url(new Uint8Array(signature))
}

const loadCipherKey = async (secret: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`${secret}:pkce`),
  )
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ])
}

const isSameText = (a: string, b: string) => {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/** 認可画面の URL に渡す state と challenge を作る */
export const createDiscordOAuthState = async (props: {
  secret: string
  userId: string
  now: number
}) => {
  const verifier = toBase64Url(crypto.getRandomValues(new Uint8Array(32)))
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(verifier))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await loadCipherKey(props.secret),
    encoder.encode(verifier),
  )
  const payload = [
    props.userId,
    props.now + STATE_TTL_SECONDS,
    toBase64Url(iv),
    toBase64Url(new Uint8Array(encrypted)),
  ].join(".")
  return {
    state: `${payload}.${await sign(props.secret, payload)}`,
    codeChallenge: toBase64Url(new Uint8Array(digest)),
  }
}

/** 正しければ連携先の Aipictors のユーザー ID と verifier を返す */
export const verifyDiscordOAuthState = async (props: {
  secret: string
  state: string
  now: number
}) => {
  const [userId, expiresAt, iv, encrypted, signature] = props.state.split(".")
  if (!userId || !expiresAt || !iv || !encrypted || !signature) {
    return null
  }
  const payload = `${userId}.${expiresAt}.${iv}.${encrypted}`
  if (!isSameText(await sign(props.secret, payload), signature)) return null
  if (Number(expiresAt) < props.now) return null
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64Url(iv) },
      await loadCipherKey(props.secret),
      fromBase64Url(encrypted),
    )
    return { userId, codeVerifier: new TextDecoder().decode(decrypted) }
  } catch {
    return null
  }
}

export const toDiscordAuthorizeUrl = (props: {
  state: string
  codeChallenge: string
}) => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: DISCORD_REDIRECT_URI,
    scope: DISCORD_OAUTH_SCOPES,
    state: props.state,
    code_challenge: props.codeChallenge,
    code_challenge_method: "S256",
    prompt: "consent",
  })
  return `https://discord.com/oauth2/authorize?${params.toString()}`
}
