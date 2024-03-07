"use server"

import { cookies } from "next/headers"

/**
 * ログアウトする
 * @returns
 */
export async function signOut() {
  cookies().delete("firebase.id_token")

  cookies().delete("firebase.refresh_token")

  return null
}
