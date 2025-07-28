/**
 * 安全なCookie操作ユーティリティ
 */

export type CookieOptions = {
  expires?: Date
  maxAge?: number
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: "strict" | "lax" | "none"
}

/**
 * Cookieを設定する
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): boolean {
  try {
    if (typeof document === "undefined") {
      return false
    }

    const {
      expires,
      maxAge,
      path = "/",
      domain,
      secure = true,
      sameSite = "strict",
    } = options

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

    if (expires) {
      cookieString += `; expires=${expires.toUTCString()}`
    }

    if (maxAge !== undefined) {
      cookieString += `; max-age=${maxAge}`
    }

    cookieString += `; path=${path}`

    if (domain) {
      cookieString += `; domain=${domain}`
    }

    if (secure) {
      cookieString += "; secure"
    }

    cookieString += `; samesite=${sameSite}`

    document.cookie = cookieString
    return true
  } catch (error) {
    console.error("Cookie設定エラー:", error)
    return false
  }
}

/**
 * Cookieを取得する
 */
export function getCookie(name: string): string | null {
  try {
    if (typeof document === "undefined") {
      return null
    }

    const value = `; ${document.cookie}`
    const parts = value.split(`; ${encodeURIComponent(name)}=`)

    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(";").shift()
      return cookieValue ? decodeURIComponent(cookieValue) : null
    }

    return null
  } catch (error) {
    console.error("Cookie取得エラー:", error)
    return null
  }
}

/**
 * Cookieが存在するかチェック
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null
}

/**
 * Cookieを削除する
 */
export function deleteCookie(name: string, path = "/"): boolean {
  try {
    if (typeof document === "undefined") {
      return false
    }

    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`
    return true
  } catch (error) {
    console.error("Cookie削除エラー:", error)
    return false
  }
}
