import type { ParsedToken } from "firebase/auth"

/**
 * Cookieからログイン情報を取得する
 * @returns
 */
export const getCookieLoginToken = () => {
  try {
    const texts = document.cookie.split(";")

    const source = texts
      .map((t) => t.trim())
      .map((t) => t.split("=") as [string, string])

    const cookie = new Map<string, string>(source)

    const idToken = cookie.get("wordpress.login_token")

    if (typeof idToken === "undefined") {
      return null
    }

    return idToken
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("画像の取得に失敗しました")
  }
}
