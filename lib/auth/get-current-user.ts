import { ParsedToken } from "firebase/auth"
import { jwtDecode } from "jwt-decode"
import { cookies } from "next/headers"

/**
 * ログイン中のユーザの情報を取得する
 * @returns
 */
export function getCurrentUser() {
  const idToken = cookies().get("firebase.id_token")

  if (typeof idToken === "undefined") {
    return null
  }

  if (idToken.value === "") {
    return null
  }

  return jwtDecode<ParsedToken>(idToken.value)
}
