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
    return null
  }
}
