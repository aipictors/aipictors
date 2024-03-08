"use server"

import { cookies } from "next/headers"

type Props = {
  idToken: string
  refreshToken: string
}

/**
 * トークンを検証してログインする
 * @param props
 * @returns
 */
export async function signInWithToken(props: Props) {
  /**
   * 30日
   */
  const time = 24 * 60 * 60 * 1000 * 30

  cookies().set("firebase.id_token", props.idToken, {
    expires: Date.now() + time,
  })

  cookies().set("firebase.refresh_token", props.refreshToken, {
    expires: Date.now() + time,
  })

  return null
}
