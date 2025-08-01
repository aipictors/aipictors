/**
 * Cookie情報取得
 */
export function getCookie(id: string) {
  try {
    const texts = document.cookie.split(";")

    const source = texts
      .map((t) => t.trim())
      .map((t) => t.split("=") as [string, string])

    const cookie = new Map<string, string>(source)

    const value = cookie.get(id)

    if (typeof value === "undefined") {
      return null
    }

    return value
  } catch (_error) {
    return null
  }
}
