/**
 * ユーザIDのトークンを取得
 * @returns
 */
export const getUserToken = () => {
  try {
    const texts = document.cookie.split(";")

    const source = texts
      .map((t) => t.trim())
      .map((t) => t.split("=") as [string, string])

    const cookie = new Map<string, string>(source)

    const idToken = cookie.get("user_token")

    if (typeof idToken === "undefined") {
      return null
    }

    return idToken
  } catch (error) {
    return null
  }
}
