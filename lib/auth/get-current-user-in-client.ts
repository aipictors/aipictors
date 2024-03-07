import { ParsedToken } from "firebase/auth"
import { jwtDecode } from "jwt-decode"

/**
 * ログイン中のユーザの情報を取得する
 * @returns
 */
export function getCurrentUserInClient() {
  const texts = document.cookie.split(";")

  const source = texts
    .map((t) => t.trim())
    .map((t) => t.split("=") as [string, string])

  const cookie = new Map<string, string>(source)

  const idToken = cookie.get("firebase.id_token")

  if (typeof idToken === "undefined") {
    return null
  }

  return jwtDecode<ParsedToken>(idToken)
}
