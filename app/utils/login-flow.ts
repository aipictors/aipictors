/**
 * ログインの流れの共通処理（表示から切り離してテストする）
 */

const NEXT_KEY = "aipictors.loginNext"
const LAST_METHOD_KEY = "aipictors.lastLoginMethod"

export type LoginMethod = "google" | "x" | "line" | "email" | "password"

/** ログイン後に戻してよいパスか（外部サイトへ飛ばさない。ログイン・登録の途中にも戻さない） */
export function toSafeNextPath(value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) return null
  if (value.includes("\\")) return null
  if (
    /^\/(ja\/|en\/)?(login|new\/profile|new\/settings)(\/|\?|$)/.test(value)
  ) {
    return null
  }
  return value
}

/**
 * ログイン後の行き先を決めて覚える。
 * LINE など別のサイトを経由すると referrer がなくなるので、sessionStorage にも残す
 */
export function rememberLoginNext(props: {
  nextParam: string | null
  referrer: string
  origin: string
}) {
  let fromReferrer: string | null = null
  if (props.referrer.startsWith(`${props.origin}/`)) {
    fromReferrer = toSafeNextPath(props.referrer.slice(props.origin.length))
  }
  const next = toSafeNextPath(props.nextParam) ?? fromReferrer
  try {
    if (next !== null) sessionStorage.setItem(NEXT_KEY, next)
    return toSafeNextPath(sessionStorage.getItem(NEXT_KEY)) ?? next
  } catch {
    return next
  }
}

export function takeLoginNext() {
  try {
    const next = toSafeNextPath(sessionStorage.getItem(NEXT_KEY))
    sessionStorage.removeItem(NEXT_KEY)
    return next
  } catch {
    return null
  }
}

export function readLastLoginMethod(): LoginMethod | null {
  try {
    const value = localStorage.getItem(LAST_METHOD_KEY)
    return value === "google" ||
      value === "x" ||
      value === "line" ||
      value === "email" ||
      value === "password"
      ? value
      : null
  } catch {
    return null
  }
}

export function writeLastLoginMethod(method: LoginMethod) {
  try {
    localStorage.setItem(LAST_METHOD_KEY, method)
  } catch {
    // 保存できなくてもログインには関係ない
  }
}

/**
 * SNS ログインの失敗を、次に何をすればいいかが分かる文にする。
 * 自分で閉じたときなど、知らせなくていいものは null
 */
export function toSocialLoginErrorMessage(
  error: unknown,
  t: (ja: string, en: string) => string,
): string | null {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : ""
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return null
    case "auth/popup-blocked":
      return t(
        "ログイン用の画面がブロックされました。ブラウザでポップアップを許可してから、もう一度お試しください。",
        "The sign-in window was blocked. Allow pop-ups in your browser and try again.",
      )
    case "auth/account-exists-with-different-credential":
      return t(
        "このメールアドレスは別の方法で登録されています。前に使った方法（Google・X・メールなど）でログインしてください。",
        "This email is registered with another method. Log in the way you used before.",
      )
    case "auth/network-request-failed":
      return t(
        "通信に失敗しました。接続を確認して、もう一度お試しください。",
        "Network error. Check your connection and try again.",
      )
    case "auth/too-many-requests":
      return t(
        "試行回数が多すぎます。少し時間をおいてからお試しください。",
        "Too many attempts. Please wait a moment and try again.",
      )
    case "auth/user-disabled":
      return t(
        "このアカウントは利用できません。お問い合わせください。",
        "This account is disabled. Please contact support.",
      )
    default:
      return t(
        `ログインできませんでした。別の方法もお試しください。${code ? `（${code}）` : ""}`,
        `Could not log in. Please try another method.${code ? ` (${code})` : ""}`,
      )
  }
}

/** アプリ内ブラウザか（Google のログインが拒否される） */
export function isInAppBrowser(userAgent: string) {
  return /(\bLine\/|FBAN|FBAV|Instagram|Discord|Twitter|TikTok|MicroMessenger|; wv\))/i.test(
    userAgent,
  )
}
